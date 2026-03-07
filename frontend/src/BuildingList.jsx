/**
 * BuildingList.jsx — Browse all buildings in the settlement
 */

import './BuildingList.css';

export default function BuildingList({ buildings, npcs, onSelectBuilding, onClose }) {
    return (
        <div className="building-list-overlay" onClick={onClose}>
            <div className="building-list-panel" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>🏛️ Settlement Buildings</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="building-grid">
                    {buildings.map(bld => {
                        const occupantCount = npcs.filter(n => n.currentLocation?.buildingId === bld.id).length;
                        return (
                            <div key={bld.id} className="building-card" onClick={() => { onSelectBuilding(bld); onClose(); }}>
                                <div className="building-icon-large">{bld.icon}</div>
                                <div className="building-details">
                                    <span className="building-name">{bld.name}</span>
                                    <span className="building-type">{bld.type}</span>
                                    <span className="building-occupants">👥 {occupantCount} inside</span>
                                </div>
                                <span className="building-status">
                                    {bld.isOpen ? '🟢' : '🔴'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
