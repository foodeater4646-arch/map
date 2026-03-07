import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onLoginClick, onGuestStart }) {
    return (
        <div className="landing-container">
            {/* ── Navbar ── */}
            <nav className="landing-nav">
                <div className="nav-brand">⚔️ Map Forge</div>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <button className="btn btn-primary" onClick={onLoginClick}>Log In</button>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <header className="hero-section">
                <div className="hero-content">
                    <h1>Every street, building, and resident</h1>
                    <h1 className="highlight">ready in seconds.</h1>
                    <p className="hero-subtitle">
                        Generate highly detailed, interactive fantasy settlement maps powered by Stable Diffusion.
                        Simulate thousands of NPCs, control the weather, edit the town, and export your world for VTTs.
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-primary hero-btn" onClick={onLoginClick}>
                            Create & Manage Settlements <br /> <small>Save to Cloud</small>
                        </button>
                        <button className="btn btn-secondary hero-btn guest-btn" onClick={onGuestStart}>
                            Create One-Time Settlement <br /> <small>No sign-up (Deletes on exit)</small>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Features Grid ── */}
            <section id="features" className="features-section">
                <h2 className="section-title">Forge Your World</h2>
                <div className="features-grid">

                    <div className="feature-card">
                        <div className="feature-icon">🗺️</div>
                        <h3>Interactive AI Maps</h3>
                        <p>High-quality rendered maps that support zooming, panning, and toggling of various layers. Visualized instantly with Stable Diffusion 3.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🏘️</div>
                        <h3>Detailed Buildings</h3>
                        <p>Every building is assigned a name, description, and list of residents. Names and descriptions can be regenerated with a single click.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🧍</div>
                        <h3>Resident Simulation</h3>
                        <p>Residents are not just static data; they have jobs, daily schedules, and relationships. Watch them go to work or interact at a tavern.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">✏️</div>
                        <h3>Edit Everything</h3>
                        <p>Drag-and-drop interface for renaming and moving buildings or people, allowing for manual overrides of the AI generation.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🌦️</div>
                        <h3>Dynamic Environments</h3>
                        <p>Control the climate, watch the sun set, and experience dynamically generated weather that changes your settlement's atmosphere.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>Districts & Factions</h3>
                        <p>Automatically divide your city into thematic districts and generate deep political factions with assigned members and leaders.</p>
                    </div>

                </div>
            </section>

            {/* ── Pricing / Membership ── */}
            <section id="pricing" className="pricing-section">
                <h2 className="section-title">Choose Your Path</h2>
                <div className="pricing-grid">

                    {/* Guest Tier */}
                    <div className="pricing-card">
                        <div className="pricing-header">
                            <h3>Wanderer</h3>
                            <div className="price">Free</div>
                            <p>No Account Required</p>
                        </div>
                        <ul className="pricing-features">
                            <li>✔️ Access to all main generation options</li>
                            <li>✔️ Full resident & time simulation</li>
                            <li>❌ Cloud storage (Deletes on exit)</li>
                            <li>❌ VTT Exports</li>
                        </ul>
                        <button className="btn btn-secondary" onClick={onGuestStart}>Start as Guest</button>
                    </div>

                    {/* Free Account Tier */}
                    <div className="pricing-card highlighted-pricing">
                        <div className="pricing-header">
                            <h3>Mayor</h3>
                            <div className="price">Free</div>
                            <p>With Free Account</p>
                        </div>
                        <ul className="pricing-features">
                            <li>✔️ Store up to 10 settlements in the cloud</li>
                            <li>✔️ Export maps as images (PNG)</li>
                            <li>✔️ Private settlements by default</li>
                            <li>✔️ Full editing controls</li>
                        </ul>
                        <button className="btn btn-primary" onClick={onLoginClick}>Sign Up Free</button>
                    </div>

                    {/* Premium Tier */}
                    <div className="pricing-card premium-card">
                        <div className="pricing-header">
                            <div className="premium-badge">🌟 Patreon Supported</div>
                            <h3>Emperor</h3>
                            <div className="price">$5<small>/mo</small></div>
                            <p>Via Patreon</p>
                        </div>
                        <ul className="pricing-features">
                            <li>👑 <strong>Unlimited</strong> cloud settlements</li>
                            <li>👑 Real-time map generation preview</li>
                            <li>👑 Custom Name Lists & Presets</li>
                            <li>👑 Metropolis Scale (Up to 50k residents)</li>
                            <li>👑 Direct VTT Integration (Foundry/Roll20)</li>
                        </ul>
                        <button className="btn btn-premium" onClick={() => window.open('https://patreon.com', '_blank')}>Unlock Premium</button>
                    </div>

                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <p>TTRPG Map Forge &copy; 2026. Built with React, Supabase, and Stable Diffusion.</p>
            </footer>
        </div>
    );
}
