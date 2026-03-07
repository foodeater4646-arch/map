/**
 * Sidebar.jsx — Context-aware detail panel with editing controls
 */

import { useState } from 'react';
import './Sidebar.css';
import { generateNPC } from './npcGenerator';

export default function Sidebar({ settlement, selectedBuilding, selectedNPC, onSelectNPC, onSelectBuilding, onClose, onUpdateNotes, onUpdateNPC, onUpdateBuilding, onAddNPC }) {
    const [activeTab, setActiveTab] = useState('general');
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editJob, setEditJob] = useState('');

    // ── NPC Detail View ─────────────────────────────────────────
    if (selectedNPC) {
        const npc = selectedNPC;

        const startEdit = () => {
            setEditName(npc.name);
            setEditJob(npc.job);
            setIsEditing(true);
        };

        const saveEdit = () => {
            onUpdateNPC(npc.id, { name: editName, job: editJob });
            setIsEditing(false);
        };

        const rerollNPC = () => {
            const newNPC = generateNPC();
            onUpdateNPC(npc.id, {
                ...newNPC,
                id: npc.id,
                currentLocation: npc.currentLocation,
                notes: npc.notes,
            });
        };

        const rerollDetail = (detailType) => {
            const freshNPC = generateNPC();
            onUpdateNPC(npc.id, {
                [detailType]: freshNPC[detailType]
            });
        };

        return (
            <div className="sidebar open">
                <div className="sidebar-header">
                    <div>
                        {isEditing ? (
                            <input className="edit-input title-edit" value={editName} onChange={e => setEditName(e.target.value)} />
                        ) : (
                            <h2 className="sidebar-title">{npc.name}</h2>
                        )}
                        <p className="sidebar-subtitle">
                            {npc.age} year old {npc.gender.toLowerCase()} {npc.race.toLowerCase()}
                            {isEditing ? (
                                <input className="edit-input inline-edit" value={editJob} onChange={e => setEditJob(e.target.value)} />
                            ) : (
                                <> {npc.job}</>
                            )}
                        </p>
                        <p className="sidebar-meta">
                            {npc.status === 'Sleeping' ? '😴' : '🟢'} {npc.status}
                        </p>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Action Bar */}
                <div className="sidebar-actions">
                    {isEditing ? (
                        <>
                            <button className="action-btn" onClick={saveEdit}>💾 Save</button>
                            <button className="action-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <button className="action-btn" onClick={startEdit}>✏️ Edit</button>
                            <button className="action-btn" onClick={rerollNPC}>🎲 Re-roll</button>
                        </>
                    )}
                </div>

                <div className="sidebar-tabs">
                    <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>General</button>
                    <button className={activeTab === 'relations' ? 'active' : ''} onClick={() => setActiveTab('relations')}>Relations</button>
                    <button className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>Notes</button>
                </div>

                <div className="sidebar-content">
                    {activeTab === 'general' && (
                        <>
                            <div className="detail-section">
                                <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Appearance</span>
                                    <button className="reroll-icon-btn" onClick={() => rerollDetail('appearance')} title="Re-roll Appearance">🎲</button>
                                </h3>
                                <p>Has {npc.appearance.hair} and {npc.appearance.eyes}.</p>
                                <p>Has {npc.appearance.skin}.</p>
                                <p>Stands {npc.appearance.height} tall and has a {npc.appearance.build} build.</p>
                            </div>

                            <div className="detail-section">
                                <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Personality</span>
                                    <button className="reroll-icon-btn" onClick={() => rerollDetail('traits')} title="Re-roll Traits">🎲</button>
                                </h3>
                                <p>{npc.name.split(' ')[0]} is {npc.traits.join(', ')}.</p>
                            </div>

                            <div className="detail-section">
                                <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Goal</span>
                                    <button className="reroll-icon-btn" onClick={() => rerollDetail('goal')} title="Re-roll Goal">🎲</button>
                                </h3>
                                <p>Their main goal is {npc.goal}.</p>
                            </div>

                            <div className="detail-section">
                                <h3>Ability Scores</h3>
                                <div className="ability-grid">
                                    {Object.entries(npc.abilityScores).map(([name, { score, mod }]) => (
                                        <div key={name} className="ability-score">
                                            <span className="ability-name">{name.substring(0, 3)}</span>
                                            <span className="ability-value">{score}</span>
                                            <span className="ability-mod">[{mod}]</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {npc.currentLocation && (
                                <div className="detail-section">
                                    <h3>Location</h3>
                                    <p className="location-link" onClick={() => {
                                        const bld = settlement.buildings.find(b => b.id === npc.currentLocation.buildingId);
                                        if (bld) onSelectBuilding(bld);
                                    }}>
                                        📍 {settlement.buildings.find(b => b.id === npc.currentLocation?.buildingId)?.name || 'Unknown'}
                                        {' — '}{npc.currentLocation.room}
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'relations' && (
                        <div className="detail-section">
                            {npc.relationships && npc.relationships.length > 0 ? (
                                <ul className="relation-list">
                                    {npc.relationships.map((rel, index) => {
                                        const other = settlement.npcs.find(n => n.id === rel.id);
                                        if (!other) return null;

                                        // Color gradient based on trust
                                        let trustColor = '#ef4444'; // Red for low trust
                                        if (rel.trust > 40) trustColor = '#f59e0b'; // Yellow for medium
                                        if (rel.trust > 70) trustColor = '#10b981'; // Green for high

                                        return (
                                            <li key={`${rel.id}-${index}`} className="relation-item" onClick={() => onSelectNPC(other)}>
                                                <div className="relation-header">
                                                    <span className="relation-name">👤 {other.name}</span>
                                                    <span className="relation-type">{rel.type}</span>
                                                </div>
                                                <div className="relation-trust-container">
                                                    <div className="trust-bar-bg">
                                                        <div className="trust-bar-fill" style={{ width: `${rel.trust}%`, backgroundColor: trustColor }}></div>
                                                    </div>
                                                    <span className="trust-label">{rel.trust}% Trust</span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="empty-state">No relations tracked yet.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="detail-section">
                            <textarea
                                className="notes-input"
                                placeholder="Add notes about this NPC..."
                                value={npc.notes}
                                onChange={(e) => onUpdateNotes('npc', npc.id, e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Building Detail View ────────────────────────────────────
    if (selectedBuilding) {
        const bld = selectedBuilding;
        const occupants = settlement.npcs.filter(
            n => n.currentLocation?.buildingId === bld.id
        );

        const startBuildingEdit = () => {
            setEditName(bld.name);
            setIsEditing(true);
        };

        const saveBuildingEdit = () => {
            onUpdateBuilding(bld.id, { name: editName });
            setIsEditing(false);
        };

        const handleAddPerson = () => {
            const newNPC = generateNPC();
            const room = bld.rooms[0];
            newNPC.currentLocation = { buildingId: bld.id, room: room.name };
            onAddNPC(newNPC, bld.id, room.name);
        };

        return (
            <div className="sidebar open">
                <div className="sidebar-header">
                    <div>
                        {isEditing ? (
                            <input className="edit-input title-edit" value={editName} onChange={e => setEditName(e.target.value)} />
                        ) : (
                            <h2 className="sidebar-title">{bld.name}</h2>
                        )}
                        <p className="sidebar-subtitle">{bld.type}</p>
                        <p className="sidebar-meta">
                            👥 {occupants.length} {occupants.length === 1 ? 'person' : 'people'} currently here
                            {' · '}{bld.isOpen ? '🟢 Open' : '🔴 Closed'}
                        </p>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Action Bar */}
                <div className="sidebar-actions">
                    {isEditing ? (
                        <>
                            <button className="action-btn" onClick={saveBuildingEdit}>💾 Save</button>
                            <button className="action-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <button className="action-btn" onClick={startBuildingEdit}>✏️ Edit</button>
                            <button className="action-btn" onClick={handleAddPerson}>👤 New Person</button>
                            <button className="action-btn" onClick={() => onUpdateBuilding(bld.id, { isOpen: !bld.isOpen })}>
                                {bld.isOpen ? '🔒 Close' : '🔓 Open'}
                            </button>
                        </>
                    )}
                </div>

                <div className="sidebar-tabs">
                    <button className={activeTab === 'current' ? 'active' : ''} onClick={() => setActiveTab('current')}>Currently Here</button>
                    <button className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>Notes</button>
                </div>

                <div className="sidebar-content">
                    {activeTab === 'current' && (
                        <>
                            {bld.rooms.map(room => {
                                const roomOccupants = occupants.filter(n => n.currentLocation?.room === room.name);
                                return (
                                    <div key={room.name} className="detail-section room-section">
                                        <h3>{room.name}</h3>
                                        {roomOccupants.length === 0 ? (
                                            <p className="empty-state">Empty</p>
                                        ) : (
                                            <div className="occupant-list">
                                                {roomOccupants.map(npc => (
                                                    <div key={npc.id} className="occupant-card" onClick={() => onSelectNPC(npc)}>
                                                        <span className="occupant-icon">👤</span>
                                                        <div className="occupant-info">
                                                            <span className="occupant-name">{npc.name}</span>
                                                            <span className="occupant-job">{npc.job}</span>
                                                        </div>
                                                        <span className="occupant-status">
                                                            {npc.status === 'Sleeping' ? '😴' : ''}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {activeTab === 'notes' && (
                        <div className="detail-section">
                            <textarea
                                className="notes-input"
                                placeholder="Add notes about this building..."
                                value={bld.notes}
                                onChange={(e) => onUpdateNotes('building', bld.id, e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
