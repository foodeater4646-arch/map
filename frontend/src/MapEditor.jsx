/**
 * MapEditor.jsx — Bottom toolbar for map overlay editing
 *
 * Drawing modes: Roads, Buildings, Walls, Labels, Water
 * All drawn as SVG overlays on top of the AI-generated map.
 */

import { useState } from 'react';
import './MapEditor.css';

export const TOOLS = [
    { id: 'road', label: 'Road', icon: '🛤️', color: '#8B7355' },
    { id: 'main-road', label: 'Main Road', icon: '🛣️', color: '#6B5B3D' },
    { id: 'building', label: 'Buildings', icon: '🏠', color: '#A0522D' },
    { id: 'wall', label: 'Walls', icon: '🧱', color: '#696969' },
    { id: 'decoration', label: 'Decoration', icon: '🌳', color: '#2E8B57' },
    { id: 'water', label: 'Water', icon: '💧', color: '#4682B4' },
    { id: 'label', label: 'Labels', icon: '🏷️', color: '#DAA520' },
    { id: 'demolish', label: 'Demolish', icon: '💥', color: '#DC143C' },
];

export default function MapEditor({
    isActive,
    onToggle,
    drawings,
    onAddDrawing,
    onClearDrawings,
    activeTool,
    setActiveTool,
    labelText,
    setLabelText
}) {
    if (!isActive) {
        return (
            <div className="map-editor-toggle">
                <button className="btn btn-sm btn-secondary" onClick={onToggle}>
                    ✏️ Edit Map
                </button>
            </div>
        );
    }

    return (
        <div className="map-editor">
            <div className="editor-header">
                <span className="editor-title">✏️ Editing Map</span>
                <button className="editor-cancel" onClick={onToggle}>✕ Cancel Edit</button>
            </div>

            <div className="editor-tools">
                {TOOLS.map(tool => (
                    <button
                        key={tool.id}
                        className={`editor-tool ${activeTool === tool.id ? 'active' : ''}`}
                        onClick={() => setActiveTool(tool.id)}
                        title={tool.label}
                    >
                        <span className="tool-icon">{tool.icon}</span>
                        <span className="tool-label">{tool.label}</span>
                    </button>
                ))}
            </div>

            {activeTool === 'label' && (
                <div className="label-input-row">
                    <input
                        type="text"
                        value={labelText}
                        onChange={e => setLabelText(e.target.value)}
                        placeholder="Label text..."
                        className="label-input"
                    />
                </div>
            )}

            <div className="editor-actions">
                <button className="btn btn-sm btn-secondary" onClick={onClearDrawings}>
                    🗑️ Clear All
                </button>
                <button className="btn btn-sm btn-primary" onClick={onToggle}>
                    💾 Save Layout
                </button>
            </div>
        </div>
    );
}
