/**
 * Toolbar.jsx — Enhanced top navigation ribbon
 */

import './Toolbar.css';

export default function Toolbar({
    settlement,
    onViewPeople, onViewBuildings, onViewFactions, onViewDistricts, onViewShops,
    onViewSettings, onExport, onBack, activeView
}) {
    if (!settlement) return null;

    return (
        <nav className="toolbar">
            <div className="toolbar-left">
                <div className="toolbar-info">
                    <h2 className="toolbar-settlement-name">{settlement.name}</h2>
                    <span className="toolbar-size">{settlement.size} settlement</span>
                </div>
            </div>

            <div className="toolbar-actions">
                <button
                    className={`toolbar-btn ${activeView === 'people' ? 'active' : ''}`}
                    onClick={onViewPeople}
                    title="People"
                >
                    <span className="toolbar-icon">👥</span>
                    <span className="toolbar-label">People</span>
                    <span className="toolbar-count">{settlement.npcs.length}</span>
                </button>

                <button
                    className={`toolbar-btn ${activeView === 'buildings' ? 'active' : ''}`}
                    onClick={onViewBuildings}
                    title="Buildings"
                >
                    <span className="toolbar-icon">🏛️</span>
                    <span className="toolbar-label">Buildings</span>
                    <span className="toolbar-count">{settlement.buildings.length}</span>
                </button>

                <button className="toolbar-btn" onClick={onExport} title="Export settlement data">
                    <span className="toolbar-icon">📦</span>
                    <span className="toolbar-label">Export</span>
                </button>

                <button className="toolbar-btn" onClick={onViewShops} title="View shop inventories & economy">
                    <span className="toolbar-icon">🪙</span>
                    <span className="toolbar-label">Shops</span>
                    <span className="toolbar-count">{settlement.buildings.filter(b => b.inventory && b.inventory.length > 0).length}</span>
                </button>

                <button
                    className={`toolbar-btn ${activeView === 'factions' ? 'active' : ''}`}
                    onClick={onViewFactions}
                    title="Factions"
                >
                    <span className="toolbar-icon">🛡️</span>
                    <span className="toolbar-label">Factions</span>
                    <span className="toolbar-count">{settlement.factions?.length || 0}</span>
                </button>

                <button
                    className={`toolbar-btn ${activeView === 'districts' ? 'active' : ''}`}
                    onClick={onViewDistricts}
                    title="Districts"
                >
                    <span className="toolbar-icon">🏘️</span>
                    <span className="toolbar-label">Districts</span>
                    <span className="toolbar-count">{settlement.districts?.length || 0}</span>
                </button>

                <button
                    className={`toolbar-btn ${activeView === 'settings' ? 'active' : ''}`}
                    title="Settings"
                    onClick={onViewSettings}
                >
                    <span className="toolbar-icon">⚙️</span>
                    <span className="toolbar-label">Settings</span>
                </button>
            </div>
        </nav>
    );
}
