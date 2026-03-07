import './Lists.css'; // Will reuse list styles

export default function FactionList({ factions, npcs, onClose }) {
    const getFactionMembers = (memberIds) => {
        return npcs.filter(n => memberIds.includes(n.id));
    };

    return (
        <div className="list-panel">
            <div className="list-header">
                <h2>🛡️ Factions ({factions?.length || 0})</h2>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="list-content">
                {!factions || factions.length === 0 ? (
                    <p className="empty-state">No major factions established in this settlement.</p>
                ) : (
                    factions.map(faction => {
                        const members = getFactionMembers(faction.members);
                        const leader = members.find(m => m.factionRole.toLowerCase().includes('master') || m.factionRole.toLowerCase().includes('captain') || m.factionRole.toLowerCase().includes('priest'));

                        return (
                            <div key={faction.id} className="list-item faction-item">
                                <div className="item-main">
                                    <div className="item-title">
                                        <span className="icon">🛡️</span>
                                        {faction.name}
                                    </div>
                                    <div className="item-subtitle">
                                        {faction.type} • {members.length} member{members.length !== 1 ? 's' : ''} • Influence: {faction.influence}%
                                    </div>
                                    <p className="item-desc" style={{ fontSize: '0.85rem', color: '#aaa', margin: '4px 0' }}>
                                        {faction.description}
                                    </p>
                                </div>

                                <div className="item-details" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
                                    {leader && (
                                        <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                            <span style={{ color: '#ffd700' }}>Leader:</span> {leader.name} ({leader.factionRole})
                                        </div>
                                    )}
                                    {members.length > 0 && (
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                            <strong>Known Members:</strong> {members.map(m => m.name).join(', ')}
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
