/**
 * App.jsx — TTRPG Map Forge: Full Settlement Dashboard
 *
 * Integrates map generation, settlement creation modal, NPC/building
 * management, editing controls, export tools, time simulation, and map editor.
 */

import { useState, useCallback, useEffect } from "react";
import "./App.css";
import InteractiveMap from "./InteractiveMap";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import TimeSystem from "./TimeSystem";
import PeopleList from "./PeopleList";
import BuildingList from "./BuildingList";
import SettlementCreator from "./SettlementCreator";
import ExportPanel from "./ExportPanel";
import FactionList from "./FactionList";
import DistrictList from "./DistrictList";
import ShopPanel from "./ShopPanel";
import { generateSettlement, generateNPC } from "./npcGenerator";
import Auth from "./Auth";
import LandingPage from "./LandingPage";
import { supabase } from "./supabaseClient";

// ── constants ────────────────────────────────────────────────────
const API_URL = "http://localhost:8000/generate-map";

const STYLES = [
  { value: "parchment", label: "📜  Parchment" },
  { value: "dark fantasy", label: "🌑  Dark Fantasy" },
  { value: "top-down battle map", label: "🗺️  Top-Down Battle Map" },
  { value: "classic D&D", label: "🐉  Classic D&D" },
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
];

// ── Error Boundary ───────────────────────────────────────────────
import React from 'react';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#333', color: 'red' }}>
          <h2>React Crash!</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── component ────────────────────────────────────────────────────
export default function App() {
  // Map generation state
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0].value);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].value);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [enhancePrompt, setEnhancePrompt] = useState(true);

  // Settlement state
  const [settlement, setSettlement] = useState(null);
  const [eventLog, setEventLog] = useState([]);

  // UI state
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedNPC, setSelectedNPC] = useState(null);
  const [showPeopleList, setShowPeopleList] = useState(false);
  const [showBuildingList, setShowBuildingList] = useState(false);
  const [showFactionList, setShowFactionList] = useState(false);
  const [showDistrictList, setShowDistrictList] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShopPanel, setShowShopPanel] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [editTool, setEditTool] = useState("road");
  const [editLabel, setEditLabel] = useState("");
  const [activeView, setActiveView] = useState(null);
  const [drawingDistrictId, setDrawingDistrictId] = useState(null); // Map Drawing Mode
  const [isDrawingFog, setIsDrawingFog] = useState(false); // Fog of War Drawing Mode

  // Supabase Auth/DB state
  const [session, setSession] = useState(null);
  const [savedSettlements, setSavedSettlements] = useState([]);
  const [showSaves, setShowSaves] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Auth Init ───────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchSavedSettlements(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchSavedSettlements(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Database Operations ─────────────────────────────────────
  const fetchSavedSettlements = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('settlements')
        .select('id, name, created_at, image_url')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSettlements(data || []);
    } catch (err) {
      console.error('Error fetching settlements:', err);
    }
  };

  const saveSettlementToCloud = async () => {
    if (!session || !settlement) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.from('settlements').insert([
        {
          user_id: session.user.id,
          name: settlement.name,
          data: settlement,
          image_url: imageUrl
        }
      ]);
      if (error) throw error;
      alert('Settlement saved to cloud!');
      fetchSavedSettlements(session.user.id);
    } catch (err) {
      console.error('Save error:', err);
      alert('Could not save to cloud. Maybe the table does not exist?');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSettlementFromCloud = async (id) => {
    try {
      const { data, error } = await supabase
        .from('settlements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setSettlement(data.data);
      setImageUrl(data.image_url);
      setEventLog([]);
      setShowSaves(false);
    } catch (err) {
      console.error('Load error:', err);
      alert('Failed to load settlement data.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSettlement(null);
    setImageUrl(null);
  };

  // ── Settlement Creation ─────────────────────────────────────
  const handleCreateSettlement = async (settings) => {
    setShowCreator(false);
    setError(null);
    setImageUrl(null);
    setLoading(true);

    // Build a map prompt from the settings
    const mapPrompt = prompt.trim() ||
      `highly detailed top-down fantasy city map, RPG battlemap style, inkarnate style, ` +
      `${settings.terrain.toLowerCase()} settlement called ${settings.name}, ` +
      `${settings.roadStyle.toLowerCase()} roads, ${settings.wallType.toLowerCase() !== 'none' ? settings.wallType.toLowerCase() + ' walls, ' : ''}` +
      `${settings.climate.toLowerCase()} climate, ${settings.size} ${settings.govType.toLowerCase()} settlement`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: mapPrompt, style, aspect_ratio: aspectRatio, enhance: enhancePrompt }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || `Server returned ${response.status}`);
      }

      const data = await response.json();
      setImageUrl(data.image_url);

      // Generate settlement data from creator settings
      const newSettlement = generateSettlement(settings);

      // Assign random initial map positions to buildings so markers show up
      newSettlement.buildings = newSettlement.buildings.map(b => ({
        ...b,
        mapPosition: { x: Math.floor(Math.random() * 600) + 100, y: Math.floor(Math.random() * 600) + 100 }
      }));

      setSettlement(newSettlement);
      setEventLog([]);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Time Simulation ───────────────────────────────────────────
  const advanceHour = useCallback(() => {
    if (!settlement) return;
    setSettlement(prev => {
      const next = { ...prev, time: { ...prev.time } };
      next.time.hour = (next.time.hour + 1) % 24;
      if (next.time.hour === 0) {
        next.time.day = Math.min(next.time.day + 1, next.time.totalDays);
      }

      // Update NPC statuses and log events
      const newEvents = [];
      next.npcs = prev.npcs.map(npc => {
        const routineEntry = npc.routine[next.time.hour];
        const newStatus = routineEntry?.activity || 'Idle';

        if (newStatus !== npc.status) {
          newEvents.push({
            hour: next.time.hour,
            day: next.time.day,
            text: `${npc.name} is now ${newStatus.toLowerCase()}.`,
          });
        }

        return { ...npc, status: newStatus };
      });

      if (newEvents.length > 0) {
        setEventLog(prev => [...prev, ...newEvents.slice(0, 5)]); // cap per tick
      }

      return next;
    });
  }, [settlement]);

  const timeSkip = useCallback(() => {
    if (!settlement) return;
    const skipHours = 6 - (settlement.time.hour % 6);
    for (let i = 0; i < skipHours; i++) {
      advanceHour();
    }
  }, [settlement, advanceHour]);

  const setTime = useCallback((hour) => {
    if (!settlement) return;
    setSettlement(prev => {
      const next = { ...prev, time: { ...prev.time, hour } };
      next.npcs = prev.npcs.map(npc => {
        const routineEntry = npc.routine[hour];
        return { ...npc, status: routineEntry?.activity || 'Idle' };
      });
      return next;
    });
    setEventLog(prev => [...prev, { hour, day: settlement.time.day, text: `Time set to ${hour}:00.` }]);
  }, [settlement]);

  // ── NPC/Building Editing ───────────────────────────────────────
  const handleUpdateNPC = (id, updates) => {
    setSettlement(prev => ({
      ...prev,
      npcs: prev.npcs.map(n => n.id === id ? { ...n, ...updates } : n),
    }));
    if (selectedNPC?.id === id) {
      setSelectedNPC(prev => ({ ...prev, ...updates }));
    }
  };

  const handleUpdateBuilding = (id, updates) => {
    setSettlement(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
    if (selectedBuilding?.id === id) {
      setSelectedBuilding(prev => ({ ...prev, ...updates }));
    }
  };

  const handleUpdateDistrictPolygon = (id, polygon) => {
    setSettlement(prev => ({
      ...prev,
      districts: prev.districts.map(d => d.id === id ? { ...d, polygon } : d)
    }));
  };

  const handleUpdateFogPaths = (path) => {
    setSettlement(prev => ({
      ...prev,
      fogPaths: [...(prev.fogPaths || []), path]
    }));
  };

  const handleClearFog = () => {
    setSettlement(prev => ({ ...prev, fogPaths: [] }));
  };

  const handleAddNPC = (newNPC, buildingId, roomName) => {
    setSettlement(prev => {
      const updatedBuildings = prev.buildings.map(b => {
        if (b.id === buildingId) {
          return {
            ...b,
            rooms: b.rooms.map(r => r.name === roomName ? { ...r, occupants: [...r.occupants, newNPC.id] } : r),
          };
        }
        return b;
      });
      return {
        ...prev,
        npcs: [...prev.npcs, newNPC],
        buildings: updatedBuildings,
      };
    });
  };

  const handleUpdateNotes = (type, id, notes) => {
    if (type === 'npc') handleUpdateNPC(id, { notes });
    if (type === 'building') handleUpdateBuilding(id, { notes });
  };

  // ── Selection Handlers ─────────────────────────────────────────
  const handleSelectNPC = (npc) => { setSelectedBuilding(null); setSelectedNPC(npc); };
  const handleSelectBuilding = (bld) => { setSelectedNPC(null); setSelectedBuilding(bld); };
  const handleCloseSidebar = () => { setSelectedNPC(null); setSelectedBuilding(null); };

  // ── Toolbar Handlers ──────────────────────────────────────────
  const handleViewPeople = () => {
    setDrawingDistrictId(null);
    setIsDrawingFog(false);
    setActiveView(activeView === 'people' ? null : 'people');
    setShowPeopleList(!showPeopleList);
    setShowBuildingList(false);
    setShowFactionList(false);
    setShowDistrictList(false);
  };

  const handleViewBuildings = () => {
    setDrawingDistrictId(null);
    setIsDrawingFog(false);
    setActiveView(activeView === 'buildings' ? null : 'buildings');
    setShowBuildingList(!showBuildingList);
    setShowPeopleList(false);
    setShowFactionList(false);
    setShowDistrictList(false);
  };

  const handleViewFactions = () => {
    setDrawingDistrictId(null);
    setIsDrawingFog(false);
    setActiveView(activeView === 'factions' ? null : 'factions');
    setShowFactionList(!showFactionList);
    setShowPeopleList(false);
    setShowBuildingList(false);
    setShowDistrictList(false);
  };

  const handleViewDistricts = () => {
    setIsDrawingFog(false);
    setActiveView(activeView === 'districts' ? null : 'districts');
    setShowDistrictList(!showDistrictList);
    setShowPeopleList(false);
    setShowBuildingList(false);
    setShowFactionList(false);
  };

  const handleViewShops = () => {
    setDrawingDistrictId(null);
    setIsDrawingFog(false);
    setShowShopPanel(true);
  };

  const hasDashboard = imageUrl && settlement;

  // ── render ───────────────────────────────────────────────────
  return (
    <ErrorBoundary>
      {!session && !isGuest ? (
        <>
          <LandingPage
            onLoginClick={() => setShowAuthModal(true)}
            onGuestStart={() => setIsGuest(true)}
          />
          {showAuthModal && (
            <Auth
              onLogin={(user) => {
                setSession({ user });
                setShowAuthModal(false);
              }}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </>
      ) : (
        <div className={`app ${hasDashboard ? 'dashboard-mode' : ''}`}>

          {/* ── Header ──────────────────────────────────────────── */}
          <header className="app-header">
            <h1>⚔️ TTRPG Map Forge</h1>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {session ? (
                <>
                  <p>{hasDashboard ? 'Management Dashboard' : `Welcome, ${session.user.email}`}</p>
                  <button className="btn btn-sm btn-secondary" onClick={handleSignOut}>Sign Out</button>
                </>
              ) : (
                <>
                  <p>Welcome, Guest Wanderer</p>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAuthModal(true)}>Log In to Save</button>
                </>
              )}
            </div>
          </header>

          {/* ── Auth Modal for Guests ── */}
          {showAuthModal && !session && (
            <Auth
              onLogin={(user) => {
                setSession({ user });
                setShowAuthModal(false);
              }}
              onClose={() => setShowAuthModal(false)}
            />
          )}

          {/* ── Landing / Input ─────────────────────────────────── */}
          {!hasDashboard && !loading && (
            <section className="card">
              <div className="form-group">
                <label htmlFor="prompt">Map Description (optional — auto-generated from settings)</label>
                <textarea
                  id="prompt"
                  placeholder='e.g. "medieval town with cobblestone streets and a castle on a northern hill"'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="style">Map Style</label>
                  <select id="style" value={style} onChange={(e) => setStyle(e.target.value)}>
                    {STYLES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="aspectRatio">Aspect Ratio</label>
                  <select id="aspectRatio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                    {ASPECT_RATIOS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <label className="switch">
                  <input type="checkbox" checked={enhancePrompt} onChange={(e) => setEnhancePrompt(e.target.checked)} />
                  <span className="slider round"></span>
                </label>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  ✨ AI Prompt Enhancement {enhancePrompt ? '(ON)' : '(OFF)'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={() => setShowCreator(true)}>
                  🏰 Configure & Create Settlement
                </button>
                <button className="btn btn-secondary" onClick={() => setShowSaves(true)}>
                  ☁️ Load from Cloud
                </button>
              </div>
            </section>
          )}

          {/* ── Loading ─────────────────────────────────────────── */}
          {loading && (
            <section className="card spinner-wrapper">
              <div className="spinner" />
              <p>Summoning your settlement from the aether…</p>
            </section>
          )}

          {/* ── Error ───────────────────────────────────────────── */}
          {error && <div className="error-message">⚠️ {error}</div>}

          {/* ── Dashboard ───────────────────────────────────────── */}
          {hasDashboard && (
            <>
              <Toolbar
                settlement={settlement}
                onViewPeople={handleViewPeople}
                onViewBuildings={handleViewBuildings}
                onViewFactions={handleViewFactions}
                onViewDistricts={handleViewDistricts}
                onViewShops={handleViewShops}
                onExport={() => setShowExport(true)}
                activeView={activeView}
              />

              <div className="dashboard-content">
                <div className="dashboard-main">
                  {/* Map Controls */}
                  <div className="map-controls-bar">
                    <div className="toggle-group">
                      <label className="switch">
                        <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
                        <span className="slider round"></span>
                      </label>
                      <span>Grid</span>
                    </div>

                    <div className="toggle-group" style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid #444' }}>
                      <label className="switch">
                        <input type="checkbox" checked={settlement.fogEnabled || false} onChange={(e) => setSettlement(p => ({ ...p, fogEnabled: e.target.checked }))} />
                        <span className="slider round"></span>
                      </label>
                      <span>Fog of War</span>
                    </div>

                    {settlement.fogEnabled && (
                      <div className="toggle-group">
                        <button
                          className={`btn btn-sm ${isDrawingFog ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => { setIsDrawingFog(!isDrawingFog); setDrawingDistrictId(null); }}
                        >
                          {isDrawingFog ? '✅ Stop Erasing' : '✏️ Erase Fog'}
                        </button>
                        <button className="btn btn-sm" style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444' }} onClick={handleClearFog}>
                          🗑️ Reset Fog
                        </button>
                      </div>
                    )}

                    <div className="download-bar">
                      <button className="btn btn-sm btn-secondary" onClick={saveSettlementToCloud} disabled={isSaving} style={{ marginRight: '8px' }}>
                        {isSaving ? '⏳ Saving...' : '☁️ Save Cloud'}
                      </button>
                      <a className="btn btn-sm btn-secondary" href={imageUrl} download="fantasy-map.png" target="_blank" rel="noopener noreferrer">
                        ⬇ Download Image
                      </a>
                    </div>
                  </div>

                  {/* Interactive Map */}
                  <InteractiveMap
                    imageUrl={imageUrl}
                    showGrid={showGrid}
                    buildings={settlement.buildings}
                    time={settlement.time}
                    districts={settlement.districts}
                    drawingDistrictId={drawingDistrictId}
                    onUpdateDistrictPolygon={handleUpdateDistrictPolygon}
                    setDrawingDistrictId={setDrawingDistrictId}
                    fogEnabled={settlement.fogEnabled || false}
                    fogPaths={settlement.fogPaths || []}
                    isDrawingFog={isDrawingFog}
                    onAddFogPath={handleUpdateFogPaths}
                    onSelectBuilding={handleSelectBuilding}
                    onUpdateBuildingPosition={(id, pos) => handleUpdateBuilding(id, { mapPosition: pos })}
                  />

                  {/* Time System */}
                  <TimeSystem
                    time={settlement.time}
                    climate={settlement.settings.climate}
                    onAdvanceHour={advanceHour}
                    onTimeSkip={timeSkip}
                    onSetTime={setTime}
                    eventLog={eventLog}
                  />
                </div>

                {/* Sidebar */}
                {(selectedNPC || selectedBuilding) && (
                  <Sidebar
                    settlement={settlement}
                    selectedBuilding={selectedBuilding}
                    selectedNPC={selectedNPC}
                    onSelectNPC={handleSelectNPC}
                    onSelectBuilding={handleSelectBuilding}
                    onClose={handleCloseSidebar}
                    onUpdateNotes={handleUpdateNotes}
                    onUpdateNPC={handleUpdateNPC}
                    onUpdateBuilding={handleUpdateBuilding}
                    onAddNPC={handleAddNPC}
                  />
                )}
              </div>
            </>
          )}

          {/* ── Overlays ────────────────────────────────────────── */}
          {showCreator && (
            <SettlementCreator
              onClose={() => setShowCreator(false)}
              onCreate={handleCreateSettlement}
            />
          )}

          {showExport && settlement && (
            <ExportPanel
              settlement={settlement}
              imageUrl={imageUrl}
              onClose={() => setShowExport(false)}
            />
          )}

          {showPeopleList && settlement && (
            <PeopleList
              npcs={settlement.npcs}
              buildings={settlement.buildings}
              onSelectNPC={handleSelectNPC}
              onClose={() => { setShowPeopleList(false); setActiveView(null); }}
            />
          )}

          {showBuildingList && settlement && (
            <BuildingList
              buildings={settlement.buildings}
              npcs={settlement.npcs}
              onSelectBuilding={handleSelectBuilding}
              onClose={() => { setShowBuildingList(false); setActiveView(null); }}
            />
          )}

          {showFactionList && settlement && (
            <FactionList
              factions={settlement.factions}
              npcs={settlement.npcs}
              onClose={() => { setShowFactionList(false); setActiveView(null); }}
            />
          )}

          {showDistrictList && settlement && (
            <DistrictList
              districts={settlement.districts}
              buildings={settlement.buildings}
              drawingDistrictId={drawingDistrictId}
              onSetDrawing={setDrawingDistrictId}
              onUpdatePolygon={handleUpdateDistrictPolygon}
              onSelectBuilding={handleSelectBuilding}
              onClose={() => { setShowDistrictList(false); setActiveView(null); setDrawingDistrictId(null); }}
            />
          )}

          {showShopPanel && settlement && (
            <ShopPanel
              settlement={settlement}
              onClose={() => setShowShopPanel(false)}
            />
          )}

          {/* Cloud Saves Modal */}
          {showSaves && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                  <h2>Cloud Saves</h2>
                  <button className="close-btn" onClick={() => setShowSaves(false)}>✕</button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {savedSettlements.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>No saved settlements found.</p>
                  ) : (
                    savedSettlements.map(save => (
                      <div key={save.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid #444', borderRadius: '8px' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '1.1rem' }}>{save.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{new Date(save.created_at).toLocaleString()}</span>
                        </div>
                        <button className="btn btn-sm btn-primary" onClick={() => loadSettlementFromCloud(save.id)}>Load</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Footer ──────────────────────────────────────────── */}
          <footer className="app-footer">
            Powered by Stable Diffusion via NVIDIA &middot; Built with React + FastAPI
          </footer>
        </div>
      )}
    </ErrorBoundary>
  );
}
