"""
TTRPG Map Generator — FastAPI Backend
======================================
Accepts a map description + style, calls the NVIDIA Stable Diffusion API
and returns the image as a base64 data URL.
"""

import os
import base64
import random
from pathlib import Path
from dotenv import load_dotenv
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
# If key is missing, we will catch it during the request rather than crashing at startup


# NVIDIA NIM Endpoint for Stable Diffusion 3 Medium
NVIDIA_API_URL = "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium"

# NVIDIA NIM Endpoint for Llama 3.1 8B Instruct (Prompt Enhancement)
NVIDIA_LLM_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
LLM_MODEL = "meta/llama-3.1-8b-instruct"

AUTH_HEADERS = {
    "Authorization": f"Bearer {NVIDIA_API_KEY}",
    "Accept": "application/json",
}

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="TTRPG Map Generator API",
    description="Generate fantasy maps for tabletop RPGs using AI.",
    version="1.0.0",
)

# Allow the Vite dev-server origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------

class MapRequest(BaseModel):
    """Body sent by the frontend."""
    prompt: str
    style: str = "parchment"
    aspect_ratio: str = "1:1"
    enhance: bool = True


class MapResponse(BaseModel):
    """Successful generation response."""
    # We return a data URL (data:image/png;base64,...) so the frontend 
    # can display it immediately.
    image_url: str

# ---------------------------------------------------------------------------
# Style-to-prompt-prefix mapping
# ---------------------------------------------------------------------------
STYLE_PREFIXES: dict[str, str] = {
    "parchment": "Breathtaking highly detailed Inkarnate style top-down fantasy city map, sprawling urban layout, high density buildings, rich watercolor textures, elegant parchment borders, ornate cartography, vibrant colors, clear paths and rivers, 2d RPG map",
    "dark fantasy": "Dark fantasy Dungeons and Dragons top-down Dungeondraft map, dense gothic city, moody lighting, gothic architecture, grimdark setting, deep shadows, 2d game asset",
    "top-down battle map": "High resolution top-down RPG battlemap, Dungeondraft and Crosshead Studios style, sprawling city environment, extremely vibrant colors, crisp hand-drawn forests and buildings, clear terrain, grid-ready game asset",
    "classic D&D": "Classic vintage Dungeons & Dragons module map, hand-drawn cartography, dense city grid, tabletop RPG style, sepia tones, clean outlines, historical map aesthetic",
}

# ---------------------------------------------------------------------------
# Prompt Enhancement
# ---------------------------------------------------------------------------

async def enhance_prompt(client: httpx.AsyncClient, user_prompt: str, style: str) -> str:
    """Uses Llama 3 to expand a short user prompt into a highly detailed visual description."""
    system_message = (
        "You are an expert AI prompt engineer for tabletop RPG maps. "
        "The user will give you a brief concept. You must rewrite it into a highly detailed, "
        "coma-separated prompt for Stable Diffusion 3 describing a top-down fantasy map. "
        "Focus on geography, architecture, lighting, atmosphere, and colors. "
        "Keep it under 50 words. Do NOT include greetings, explanations, or quotes. Just output the prompt."
    )
    
    try:
        resp = await client.post(
            NVIDIA_LLM_URL,
            headers=AUTH_HEADERS,
            json={
                "model": LLM_MODEL,
                "messages": [
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": f"Enhance this map concept ({style} style): {user_prompt}"}
                ],
                "temperature": 0.7,
                "max_tokens": 100,
            },
        )
        if resp.status_code == 200:
            data = resp.json()
            enhanced = data["choices"][0]["message"]["content"].strip()
            # Clean up potential quotes if the LLM adds them
            enhanced = enhanced.replace('"', '').replace("'", "")
            print(f"Original Prompt: {user_prompt}")
            print(f"Enhanced Prompt: {enhanced}")
            return enhanced
        else:
            print(f"LLM Enhancement failed ({resp.status_code}): {resp.text}")
            return user_prompt # Fallback to original
    except Exception as e:
        print(f"LLM Enhancement error: {e}")
        return user_prompt # Fallback to original

# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@app.post("/generate-map", response_model=MapResponse)
async def generate_map(request: MapRequest):
    if not NVIDIA_API_KEY or NVIDIA_API_KEY == "your_nvidia_api_key_here":
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY missing on server. Please set it in Vercel settings.")
    """
    Generate a fantasy map image via NVIDIA NIM (SD3 Medium).

    Combines the user's prompt with the chosen style into a single detailed
    prompt, then calls NVIDIA's SD3 Medium model.
    """
    # Call NVIDIA REST API
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            
            # 1. Optionally enhance the prompt using Llama 3
            if request.enhance:
                enhanced_user_prompt = await enhance_prompt(client, request.prompt, request.style)
            else:
                enhanced_user_prompt = request.prompt
            
            # Build combined prompt with the style prefix
            style_prefix = STYLE_PREFIXES.get(request.style, "fantasy map")
            combined_prompt = (
                f"{style_prefix} of {enhanced_user_prompt}, "
                "highly detailed, top-down view, sharp focus, artstation quality masterpiece"
            )
            print(f"Final SD3 Prompt: {combined_prompt}")

            # Generate a random seed for variation
            seed = random.randint(1, 4294967295)
            
            # Strict negative prompt to prevent 3D elements, text, and modern artifacts
            negative_prompt = "text, watermark, typography, labels, words, letters, signature, 3d render, isometric, perspective, blurry, modern architecture, photograph, realistic, low details, out of frame"

            # 2. Call SD3 Image Gen
            resp = await client.post(
                NVIDIA_API_URL,
                headers=AUTH_HEADERS,
                json={
                    "prompt": combined_prompt,
                    "negative_prompt": negative_prompt,
                    "cfg_scale": 7,
                    "aspect_ratio": request.aspect_ratio,
                    "seed": seed,
                    "steps": 40, # increased steps for higher quality
                },
            )
            
            # Handle errors
            if resp.status_code != 200:
                error_detail = resp.text
                try:
                    error_json = resp.json()
                    error_detail = error_json.get("detail", error_detail)
                except:
                    pass
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"NVIDIA API error: {error_detail}"
                )

            data = resp.json()
            
            # Extract image (NVIDIA NIM returns list of artifacts or a single object depending on version)
            artifacts = data.get("artifacts", [])
            if not artifacts:
                # Check for alternative keys (base64 or image)
                base64_image = data.get("base64") or data.get("image")
                if not base64_image:
                    raise HTTPException(status_code=500, detail="NVIDIA API returned no image.")
            else:
                base64_image = artifacts[0].get("base64")
            
            if not base64_image:
                raise HTTPException(status_code=500, detail="Image data missing from response.")

            # Create Data URL
            data_url = f"data:image/png;base64,{base64_image}"
            
            return MapResponse(image_url=data_url)

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Image generation failed: {exc}",
        ) from exc
