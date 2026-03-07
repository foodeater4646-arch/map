/**
 * PeopleList.jsx — Browse all NPCs in the settlement
 */

import './PeopleList.css';

import { useState } from 'react';
import './PeopleList.css';

export default function PeopleList({ npcs, buildings, onSelectNPC, onBulkUpdateNPCs, onClose }) {
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [bulkAction, setBulkAction] = useState('status');
    const [bulkValue, setBulkValue] = useState('');

    const isBulkMode = selectedIds.size > 0 || showBulkEdit;

    const toggleSelection = (id, e) => {
        e.stopPropagation();
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
        if (next.size > 0) setShowBulkEdit(true);
        else setShowBulkEdit(false);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === npcs.length) {
            setSelectedIds(new Set());
            setShowBulkEdit(false);
        } else {
            setSelectedIds(new Set(npcs.map(n => n.id)));
            setShowBulkEdit(true);
        }
    };

    const handleApplyBulkEdit = () => {
        if (!bulkValue.trim()) return;
        const updates = {};
        if (bulkAction === 'status') updates.status = bulkValue;
        if (bulkAction === 'job') updates.job = bulkValue;

        onBulkUpdateNPCs(Array.from(selectedIds), updates);

        // Reset bulk edit state
        setSelectedIds(new Set());
        setShowBulkEdit(false);
        setBulkValue('');
    };

    return (
        <div className="people-list-overlay" onClick={onClose}>
            <div className="people-list-panel" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>👥 Settlement Population</h2>
                    <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={handleSelectAll}>
                            {selectedIds.size === npcs.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button className="close-btn" onClick={onClose}>✕</button>
                    </div>
                </div>

                {showBulkEdit && (
                    <div className="bulk-edit-bar" style={{ padding: '10px', background: '#2a2a2a', borderBottom: '1px solid #444', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span>{selectedIds.size} selected</span>
                        <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} style={{ padding: '4px' }}>
                            <option value="status">Change Status</option>
                            <option value="job">Change Job</option>
                        </select>
                        <input
                            type="text"
                            placeholder={`New ${bulkAction}...`}
                            value={bulkValue}
                            onChange={e => setBulkValue(e.target.value)}
                            style={{ padding: '4px', flex: 1 }}
                        />
                        <button className="btn btn-sm btn-primary" onClick={handleApplyBulkEdit} disabled={!bulkValue.trim() || selectedIds.size === 0}>
                            Apply
                        </button>
                    </div>
                )}

                <div className="people-grid">
                    {npcs.map(npc => {
                        const bld = buildings.find(b => b.id === npc.currentLocation?.buildingId);
                        const isSelected = selectedIds.has(npc.id);
                        return (
                            <div
                                key={npc.id}
                                className={`person-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => { if (!isBulkMode) { onSelectNPC(npc); onClose(); } }}
                                style={isSelected ? { border: '1px solid #ffd700', background: 'rgba(255,215,0,0.1)' } : {}}
                            >
                                <div className="person-select" onClick={(e) => toggleSelection(npc.id, e)} style={{ alignSelf: 'center', marginRight: '10px' }}>
                                    <input type="checkbox" checked={isSelected} readOnly />
                                </div>
                                <div className="person-avatar" style={{ opacity: isBulkMode && !isSelected ? 0.5 : 1 }}>👤</div>
                                <div className="person-details">
                                    <span className="person-name">{npc.name}</span>
                                    <span className="person-job">{npc.job}</span>
                                    <span className="person-location">
                                        {bld ? `📍 ${bld.name}` : '📍 Unknown'}
                                    </span>
                                </div>
                                <span className="person-status-dot" title={npc.status}>
                                    {npc.status === 'Sleeping' ? '😴' : '🟢'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
