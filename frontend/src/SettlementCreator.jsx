/**
 * SettlementCreator.jsx — Multi-tab settlement creation modal
 *
 * Inspired by Fantasy Town Generator's creation form.
 * Tabs: General, Layout, People, Government, Landscape, Religion, Advanced
 */

import { useState } from 'react';
import './SettlementCreator.css';
import PremiumBadge from './PremiumBadge';

const GOVERNMENT_TYPES = [
    'Monarchy', 'Council', 'Theocracy', 'Democracy', 'Oligarchy',
    'Anarchy', 'Military Dictatorship', 'Tribal', 'Magocracy', 'Republic',
];

const TERRAIN_TYPES = [
    'Plains', 'Forest', 'Mountains', 'Coast', 'Desert',
    'Swamp', 'Tundra', 'Hills', 'River Valley', 'Island',
];

const CLIMATE_TYPES = ['Tropical', 'Temperate', 'Arid', 'Cold', 'Arctic'];

const WALL_TYPES = ['None', 'Wooden Palisade', 'Stone Wall', 'Fortified', 'Magical Barrier'];
const ROAD_STYLES = ['Dirt Paths', 'Cobblestone', 'Paved', 'Mixed'];
const LIFESTYLE_LEVELS = ['Wretched', 'Squalid', 'Poor', 'Modest', 'Comfortable', 'Wealthy', 'Aristocratic'];

const DEFAULT_RACES = [
    { name: 'Human', percentage: 40 },
    { name: 'Dwarf', percentage: 15 },
    { name: 'Elf', percentage: 12 },
    { name: 'Half-Elf', percentage: 10 },
    { name: 'Halfling', percentage: 10 },
    { name: 'Gnome', percentage: 5 },
    { name: 'Half-Orc', percentage: 5 },
    { name: 'Tiefling', percentage: 3 },
];

const RELIGIONS = [
    'Pelor (Sun God)', 'Moradin (Forge God)', 'Corellon (Art & Magic)',
    'Helm (Protection)', 'Tymora (Luck)', 'Mystra (Magic)',
    'Tempus (War)', 'Silvanus (Nature)', 'Lathander (Dawn)',
    'Custom Pantheon',
];

const TABS = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'layout', label: 'Settlement Layout', icon: '🗺️' },
    { id: 'districts', label: 'Districts', icon: '🏘️' },
    { id: 'people', label: 'People', icon: '👥' },
    { id: 'government', label: 'Government', icon: '🏛️' },
    { id: 'factions', label: 'Factions', icon: '🛡️' },
    { id: 'landscape', label: 'Landscape', icon: '⛰️' },
    { id: 'water', label: 'Water', icon: '🌊' },
    { id: 'religion', label: 'Religion', icon: '⛪' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'items', label: 'Items And Services', icon: '💰' },
    { id: 'advanced', label: 'Building Options', icon: '🔧' },
];

export default function SettlementCreator({ onClose, onCreate, isPremium }) {
    const [activeTab, setActiveTab] = useState('general');

    // ── General ───────────────────────────────────────────────
    const [name, setName] = useState('Eldoria');
    const [size, setSize] = useState('small');
    const [lifestyle, setLifestyle] = useState('Modest');
    const [guardLevel, setGuardLevel] = useState(3);

    // ── Layout ────────────────────────────────────────────────
    const [roadStyle, setRoadStyle] = useState('Cobblestone');
    const [wallType, setWallType] = useState('None');
    const [buildingDensity, setBuildingDensity] = useState(50);

    // ── People ────────────────────────────────────────────────
    const [races, setRaces] = useState(DEFAULT_RACES.map(r => ({ ...r })));
    const [customRaceName, setCustomRaceName] = useState('');

    // ── Government ────────────────────────────────────────────
    const [govType, setGovType] = useState('Monarchy');
    const [leaderTitle, setLeaderTitle] = useState('');
    const [leaderName, setLeaderName] = useState('');

    // ── Landscape ─────────────────────────────────────────────
    const [terrain, setTerrain] = useState('Plains');
    const [climate, setClimate] = useState('Temperate');
    const [resources, setResources] = useState([]);

    // ── Religion ──────────────────────────────────────────────
    const [primaryReligion, setPrimaryReligion] = useState(RELIGIONS[0]);
    const [templeFrequency, setTempleFrequency] = useState('Normal');

    // ── Water ─────────────────────────────────────────────────
    const [waterType, setWaterType] = useState('None');
    const [waterDirection, setWaterDirection] = useState('Center');

    // ── Districts & Factions & Calendar & Items  ──────────────
    const [districtComplexity, setDistrictComplexity] = useState('Standard');
    const [factionDensity, setFactionDensity] = useState('Normal');
    const [daysInWeek, setDaysInWeek] = useState(7);
    const [economyLevel, setEconomyLevel] = useState('Standard');

    // ── Advanced / Buildings ──────────────────────────────────
    const [seed, setSeed] = useState('');

    // ── Race Handlers ─────────────────────────────────────────
    const updateRacePercentage = (idx, val) => {
        setRaces(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], percentage: Math.max(0, Math.min(100, parseInt(val) || 0)) };
            return next;
        });
    };

    const addCustomRace = () => {
        if (!customRaceName.trim()) return;
        setRaces(prev => [...prev, { name: customRaceName.trim(), percentage: 5 }]);
        setCustomRaceName('');
    };

    const removeRace = (idx) => {
        setRaces(prev => prev.filter((_, i) => i !== idx));
    };

    const resourceOptions = ['Timber', 'Stone', 'Iron', 'Gold', 'Fish', 'Grain', 'Livestock', 'Gems', 'Herbs', 'Magic Crystals'];

    const toggleResource = (r) => {
        setResources(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
    };

    // ── Build Settings Object ─────────────────────────────────
    const handleCreate = () => {
        const settings = {
            name, size, lifestyle, guardLevel,
            roadStyle, wallType, buildingDensity,
            races, govType, leaderTitle, leaderName,
            terrain, climate, resources,
            primaryReligion, templeFrequency,
            waterType, waterDirection,
            districtComplexity, factionDensity, daysInWeek, economyLevel,
            seed: seed || undefined,
        };
        onCreate(settings);
    };

    const raceTotal = races.reduce((s, r) => s + r.percentage, 0);

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="creator-overlay" onClick={onClose}>
            <div className="creator-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="creator-header">
                    <h2>Create New Settlement</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Tabs */}
                <div className="creator-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`creator-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <div className="tab-text">
                                <span className="tab-label">{tab.label}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="creator-content">
                    {/* ── General ───────────────────────────────────── */}
                    {activeTab === 'general' && (
                        <div className="tab-content">
                            <div className="field-row">
                                <div className="field">
                                    <label>Settlement Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter name..." />
                                </div>
                                <div className="field">
                                    <label>Size</label>
                                    <select value={size} onChange={e => setSize(e.target.value)}>
                                        <option value="small">Small (~15 people)</option>
                                        <option value="medium">Medium (~30 people)</option>
                                        <option value="large">Large (~50 people)</option>
                                        <option value="metropolis" disabled={!isPremium}>
                                            Metropolis (~200 people) {!isPremium ? '👑 Premium' : ''}
                                        </option>
                                        <option value="mega-city" disabled={!isPremium}>
                                            Mega-City (~500 people) {!isPremium ? '👑 Premium' : ''}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="field-row">
                                <div className="field">
                                    <label>Lifestyle</label>
                                    <select value={lifestyle} onChange={e => setLifestyle(e.target.value)}>
                                        {LIFESTYLE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Guard Level ({guardLevel}/10)</label>
                                    <input type="range" min="0" max="10" value={guardLevel} onChange={e => setGuardLevel(parseInt(e.target.value))} />
                                    <div className="range-labels"><span>None</span><span>Fortress</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Layout ────────────────────────────────────── */}
                    {activeTab === 'layout' && (
                        <div className="tab-content">
                            <div className="field-row">
                                <div className="field">
                                    <label>Road Style</label>
                                    <select value={roadStyle} onChange={e => setRoadStyle(e.target.value)}>
                                        {ROAD_STYLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Walls</label>
                                    <select value={wallType} onChange={e => setWallType(e.target.value)}>
                                        {WALL_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="field">
                                <label>Building Density ({buildingDensity}%)</label>
                                <input type="range" min="10" max="100" value={buildingDensity} onChange={e => setBuildingDensity(parseInt(e.target.value))} />
                                <div className="range-labels"><span>Sparse</span><span>Dense</span></div>
                            </div>
                        </div>
                    )}

                    {/* ── People ────────────────────────────────────── */}
                    {activeTab === 'people' && (
                        <div className="tab-content">
                            <label className="section-label">Race Distribution <span className={raceTotal === 100 ? 'valid' : 'invalid'}>({raceTotal}%)</span></label>
                            <div className="race-list">
                                {races.map((race, idx) => (
                                    <div key={idx} className="race-row">
                                        <span className="race-name">{race.name}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={race.percentage}
                                            onChange={e => updateRacePercentage(idx, e.target.value)}
                                            className="race-input"
                                        />
                                        <span className="race-pct">%</span>
                                        <div className="race-bar-bg">
                                            <div className="race-bar" style={{ width: `${race.percentage}%` }} />
                                        </div>
                                        {idx >= 8 && (
                                            <button className="remove-btn" onClick={() => removeRace(idx)}>✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="add-race-row">
                                <input
                                    type="text"
                                    value={customRaceName}
                                    onChange={e => setCustomRaceName(e.target.value)}
                                    placeholder="Custom race name..."
                                    className="add-race-input"
                                />
                                <button className="btn btn-sm btn-secondary" onClick={addCustomRace}>+ Add Race</button>
                            </div>

                            <div className="field" style={{ marginTop: '1.5rem', position: 'relative' }}>
                                <label>Custom Name List (JSON)</label>
                                <textarea
                                    disabled={!isPremium}
                                    placeholder='e.g. {"male": ["Thorin"], "female": ["Galadriel"], "last": ["Oakenshield"]}'
                                    style={{ width: '100%', height: '80px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--text-primary)', padding: '10px', fontSize: '0.85rem' }}
                                />
                                {!isPremium && <PremiumBadge feature="Custom Name Lists" compact />}
                            </div>
                        </div>
                    )}

                    {/* ── Government ────────────────────────────────── */}
                    {activeTab === 'government' && (
                        <div className="tab-content">
                            <div className="field">
                                <label>Government Type</label>
                                <div className="pill-grid">
                                    {GOVERNMENT_TYPES.map(g => (
                                        <button
                                            key={g}
                                            className={`pill ${govType === g ? 'active' : ''}`}
                                            onClick={() => setGovType(g)}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="field-row">
                                <div className="field">
                                    <label>Leader Title</label>
                                    <input type="text" value={leaderTitle} onChange={e => setLeaderTitle(e.target.value)} placeholder="e.g. King, Elder, High Priestess..." />
                                </div>
                                <div className="field">
                                    <label>Leader Name (leave blank to generate)</label>
                                    <input type="text" value={leaderName} onChange={e => setLeaderName(e.target.value)} placeholder="Auto-generated..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Landscape ─────────────────────────────────── */}
                    {activeTab === 'landscape' && (
                        <div className="tab-content">
                            <div className="field-row">
                                <div className="field">
                                    <label>Terrain</label>
                                    <div className="pill-grid">
                                        {TERRAIN_TYPES.map(t => (
                                            <button key={t} className={`pill ${terrain === t ? 'active' : ''}`} onClick={() => setTerrain(t)}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="field">
                                <label>Climate</label>
                                <select value={climate} onChange={e => setClimate(e.target.value)}>
                                    {CLIMATE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="field">
                                <label>Resources</label>
                                <div className="pill-grid">
                                    {resourceOptions.map(r => (
                                        <button key={r} className={`pill ${resources.includes(r) ? 'active' : ''}`} onClick={() => toggleResource(r)}>{r}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Religion ──────────────────────────────────── */}
                    {activeTab === 'religion' && (
                        <div className="tab-content">
                            <div className="field">
                                <label>Primary Religion / Deity</label>
                                <select value={primaryReligion} onChange={e => setPrimaryReligion(e.target.value)}>
                                    {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="field">
                                <label>Temple Frequency</label>
                                <select value={templeFrequency} onChange={e => setTempleFrequency(e.target.value)}>
                                    <option value="Rare">Rare — Temples are uncommon</option>
                                    <option value="Normal">Normal — A few temples</option>
                                    <option value="Common">Common — Temples in every district</option>
                                    <option value="Theocratic">Theocratic — Religion dominates</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ── Districts ───────────────────────────────────── */}
                    {activeTab === 'districts' && (
                        <div className="tab-content">
                            <div className="field">
                                <label>District Complexity</label>
                                <select value={districtComplexity} onChange={e => setDistrictComplexity(e.target.value)}>
                                    <option value="Simple">Simple — One core area</option>
                                    <option value="Standard">Standard — 2-4 defined districts</option>
                                    <option value="Complex">Complex — Many specialized districts</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ── Factions ────────────────────────────────────── */}
                    {activeTab === 'factions' && (
                        <div className="tab-content">
                            <div className="field">
                                <label>Faction Density</label>
                                <select value={factionDensity} onChange={e => setFactionDensity(e.target.value)}>
                                    <option value="None">None — No organized guilds</option>
                                    <option value="Normal">Normal — A few major guilds</option>
                                    <option value="High">High — Multiple competing factions</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ── Water ───────────────────────────────────────── */}
                    {activeTab === 'water' && (
                        <div className="tab-content">
                            <div className="field-row">
                                <div className="field">
                                    <label>Body of Water</label>
                                    <select value={waterType} onChange={e => setWaterType(e.target.value)}>
                                        {['None', 'River', 'Lake', 'Coast', 'Delta', 'Oasis'].map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Water Placement</label>
                                    <select value={waterDirection} onChange={e => setWaterDirection(e.target.value)} disabled={waterType === 'None'}>
                                        {['Center', 'North', 'South', 'East', 'West', 'Surrounding'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Calendar ────────────────────────────────────── */}
                    {activeTab === 'calendar' && (
                        <div className="tab-content">
                            <div className="field">
                                <label>Days in a Week</label>
                                <input type="number" min="3" max="15" value={daysInWeek} onChange={e => setDaysInWeek(parseInt(e.target.value) || 7)} />
                            </div>
                        </div>
                    )}

                    {/* ── Items ───────────────────────────────────────── */}
                    {activeTab === 'items' && (
                        <div className="tab-content">
                            <div className="field">
                                <label>Economy Availability</label>
                                <select value={economyLevel} onChange={e => setEconomyLevel(e.target.value)}>
                                    <option value="Scarce">Scarce — Basic goods only</option>
                                    <option value="Standard">Standard — Most common items</option>
                                    <option value="Abundant">Abundant — Exotic items available</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ── Advanced ──────────────────────────────────── */}
                    {activeTab === 'advanced' && (
                        <div className="tab-content">
                            <div className="field">
                                <label>Random Seed (leave blank for random)</label>
                                <input type="text" value={seed} onChange={e => setSeed(e.target.value)} placeholder="e.g. 42, dragonkeep, ..." />
                                <p className="field-hint">Use the same seed to recreate an identical settlement.</p>
                            </div>

                            <div className="field" style={{ position: 'relative', marginTop: '1rem' }}>
                                <label className="checkbox-label">
                                    <input type="checkbox" disabled={!isPremium} />
                                    Real-time Map Preview
                                </label>
                                <p className="field-hint">See building placement updates live as you change settings.</p>
                                {!isPremium && <PremiumBadge feature="Real-time Preview" compact />}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="creator-footer">
                    <button className="btn btn-sm btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleCreate}>🏰 Create Settlement</button>
                </div>
            </div>
        </div>
    );
}
