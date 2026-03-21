import React from 'react';
import './LandingPage.css';
import logo from './assets/logo.png';
import heroBg from './assets/hero-bg.png';

export default function LandingPage({
    prompt,
    setPrompt,
    loading,
    handleGenerate,
    onLoadCloud,
    onLoginClick,
    onGuestStart,
    session,
    savedSettlements = [],
    onLoadSave,
    onLogout
}) {
    return (
        <div className="landing-container">
            {/* ── Navbar ── */}
            <nav className="landing-nav">
                <div className="nav-brand">
                    <img src={logo} alt="Map Forge Logo" className="nav-logo" />
                    <span>Map Forge</span>
                </div>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    {session ? (
                        <div className="nav-user-info">
                            <span className="user-email">{session.user.email}</span>
                            <button className="btn btn-sm btn-secondary" onClick={onLogout} style={{ marginLeft: '1rem' }}>Log Out</button>
                        </div>
                    ) : (
                        <button className="btn btn-primary" onClick={onLoginClick}>Log In</button>
                    )}
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <header className="hero-section" style={{ backgroundImage: `url(${heroBg})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-badge">✨ THE ULTIMATE DM'S TOOLKIT</div>
                    <h1 className="hero-title">
                        Infinite Cities, <br />
                        <span className="hero-title-main">Zero Prep</span>
                    </h1>
                    <h1 className="hero-title-highlight">Generated in Seconds.</h1>
                    <p className="hero-subtitle">
                        Create immersive, living fantasy settlements with procedural depth. Populate your world with unique NPCs, historical lore, and high-fidelity maps—all in real-time.
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-primary hero-btn-main" onClick={session ? () => onLoadSave(null) : onLoginClick}>
                            <span>Create New Settlement</span>
                            <small>{session ? "Procedural Alpha v2" : "Cloud Storage Ready"}</small>
                        </button>
                        {!session && (
                            <button className="btn btn-secondary hero-btn-secondary" onClick={onGuestStart}>
                                <span>Start as Guest</span>
                                <small>One-time use</small>
                            </button>
                        )}
                        {session && (
                            <button className="btn btn-secondary hero-btn-secondary" onClick={() => window.scrollTo({ top: document.getElementById('saved-worlds').offsetTop - 100, behavior: 'smooth' })}>
                                <span>View Your Saves</span>
                                <small>{savedSettlements.length} Cloud Worlds</small>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Saved Settlements Section (Logged In Only) ── */}
            {session && (
                <section id="saved-worlds" className="saved-worlds-section">
                    <div className="section-header">
                        <h2 className="section-title">Your Saved Worlds</h2>
                        <p className="section-subtitle">Jump back into your active campaigns</p>
                    </div>
                    
                    <div className="saved-worlds-grid">
                        {savedSettlements.length === 0 ? (
                            <div className="no-saves-cta" onClick={() => onLoadSave(null)}>
                                <div className="cta-plus">+</div>
                                <h3>Create Your First World</h3>
                                <p>Start generating your first settlement to see it here.</p>
                            </div>
                        ) : (
                            savedSettlements.map(save => (
                                <div key={save.id} className="save-card">
                                    <div className="save-card-icon">🗺️</div>
                                    <div className="save-card-info">
                                        <h3>{save.name}</h3>
                                        <p>Created: {new Date(save.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={() => onLoadSave(save.id)}>Load World</button>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            )}

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
                        <button className="btn btn-premium" onClick={() => window.open('https://www.patreon.com/c/mapforge936/membership', '_blank')}>Unlock Premium</button>
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
