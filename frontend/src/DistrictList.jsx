import './Lists.css'; // Will reuse list styles

export default function DistrictList({ districts, buildings, onSelectBuilding, drawingDistrictId, onSetDrawing, onUpdatePolygon, onClose }) {
    const getDistrictBuildings = (buildingIds) => {
        return buildings.filter(b => buildingIds.includes(b.id));
    };

    return (
        <div className="list-panel">
            <div className="list-header">
                <h2>🏘️ Districts ({districts?.length || 0})</h2>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="list-content">
                {!districts || districts.length === 0 ? (
                    <p className="empty-state">No marked districts in this settlement.</p>
                ) : (
                    districts.map(district => {
                        const districtBuildings = getDistrictBuildings(district.buildings);

                        return (
                            <div key={district.id} className="list-item district-item">
                                <div className="item-main">
                                    <div className="item-title">
                                        <span className="icon">🏘️</span>
                                        {district.name}
                                    </div>
                                    <div className="item-subtitle">
                                        {districtBuildings.length} building{districtBuildings.length !== 1 ? 's' : ''}
                                    </div>
                                    <p className="item-desc" style={{ fontSize: '0.85rem', color: '#aaa', margin: '4px 0' }}>
                                        {district.description}
                                    </p>

                                    {/* Map Drawing Controls */}
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: district.color, border: '1px solid #fff' }} title="District Map Color" />
                                        <button
                                            className={`btn btn-sm ${drawingDistrictId === district.id ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => onSetDrawing(drawingDistrictId === district.id ? null : district.id)}
                                        >
                                            {drawingDistrictId === district.id ? '✅ Finish Drawing' : '✏️ Draw Area'}
                                        </button>

                                        {district.polygon && district.polygon.length > 0 && (
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }}
                                                onClick={() => onUpdatePolygon(district.id, [])}
                                            >
                                                🗑️ Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="item-details" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
                                    {districtBuildings.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {districtBuildings.map(b => (
                                                <button
                                                    key={b.id}
                                                    className="btn btn-sm btn-secondary"
                                                    style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                                                    onClick={() => onSelectBuilding(b)}
                                                >
                                                    {b.icon} {b.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
