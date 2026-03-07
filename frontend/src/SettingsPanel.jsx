/**
 * SettingsPanel.jsx — Global application settings
 */

import './SettingsPanel.css';

export default function SettingsPanel({ settings, onUpdate, onClose }) {
    return (
        <div className="settings-panel slide-panel">
            <div className="panel-header">
                <h2>⚙️ Application Settings</h2>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="panel-body">
                <section className="settings-section">
                    <h3>🗺️ Map Visuals</h3>
                    <div className="setting-item">
                        <label>Grid Size</label>
                        <input
                            type="number"
                            value={settings.gridSize}
                            onChange={e => onUpdate({ gridSize: parseInt(e.target.value) || 50 })}
                        />
                    </div>
                    <div className="setting-item">
                        <label>Grid Transparency</label>
                        <input
                            type="range" min="0" max="1" step="0.1"
                            value={settings.gridOpacity}
                            onChange={e => onUpdate({ gridOpacity: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="setting-item">
                        <label>Fog Density</label>
                        <input
                            type="range" min="0" max="1" step="0.1"
                            value={settings.fogOpacity}
                            onChange={e => onUpdate({ fogOpacity: parseFloat(e.target.value) })}
                        />
                    </div>
                </section>

                <section className="settings-section">
                    <h3>✨ Interface</h3>
                    <div className="setting-item">
                        <label>Show Tooltips</label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.showTooltips}
                                onChange={e => onUpdate({ showTooltips: e.target.checked })}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div className="setting-item">
                        <label>Animated Transitions</label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.enableAnimations}
                                onChange={e => onUpdate({ enableAnimations: e.target.checked })}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </section>

                <section className="settings-section">
                    <h3>🤖 AI Defaults</h3>
                    <div className="setting-item">
                        <label>Default LLM Model</label>
                        <select
                            value={settings.llmModel}
                            onChange={e => onUpdate({ llmModel: e.target.value })}
                        >
                            <option value="meta/llama-3.1-8b-instruct">Llama 3.1 8B (Fast)</option>
                            <option value="meta/llama-3.1-70b-instruct">Llama 3.1 70B (Smart)</option>
                        </select>
                    </div>
                </section>
            </div>

            <div className="panel-footer">
                <button className="btn btn-primary" onClick={onClose}>Save & Close</button>
            </div>
        </div>
    );
}
