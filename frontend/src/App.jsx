/**
 * App.jsx — TTRPG Map Forge: Full Settlement Dashboard
 *
 * Integrates map generation, settlement creation modal, NPC/building
 * management, editing controls, export tools, time simulation, and map editor.
 * Build ID: 2026-03-07-T13-50
 */

import React, { useState, useCallback, useEffect } from "react";
import "./App.css";
import logo from "./assets/logo.png";
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
import SettingsPanel from "./SettingsPanel";
import { generateSettlement, generateNPC } from "./npcGenerator";
import Auth from "./Auth";
import LandingPage from "./LandingPage";
import { supabase } from "./supabaseClient";
import usePremium from "./usePremium";

// ── constants ────────────────────────────────────────────────────
const API_URL = "/generate-map";

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
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState(null); // Tracks mobile sidebar/view active state
  const [drawingDistrictId, setDrawingDistrictId] = useState(null); // Tracks district being edited
  const [showAuthModal, setShowAuthModal] = useState(false); // Controls login/signup modal

  // App Settings
  const [appSettings, setAppSettings] = useState({
    gridSize: 50,
    gridOpacity: 0.3,
    fogOpacity: 0.92,
    showTooltips: true,
    enableAnimations: true,
    llmModel: 'meta/llama-3.1-8b-instruct',
  });
  const [isDrawingFog, setIsDrawingFog] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // To satisfy some legacy prop requirements if any

  // Supabase Auth/DB state
  const [session, setSession] = useState(null);
  const [savedSettlements, setSavedSettlements] = useState([]);
  const [showSaves, setShowSaves] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Premium tier
  const { isPremium, isGuest, isLoggedIn } = usePremium(session);

  // ── Auth Init ───────────────────────────────────────────────
  useEffect(() => {
    // Initial check for session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        fetchSavedSettlements(session.user.id);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchSavedSettlements(session.user.id);
      } else {
        setSavedSettlements([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── History API Handling ─────────────────────────────────────
  useEffect(() => {
    const handlePopState = (event) => {
      // If we go back and there's no state or state.view is null, return to landing
      if (!event.state || !event.state.hasSettlement) {
        setSettlement(null);
        setImageUrl(null);
        setActiveView(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setSettlement(null);
      setImageUrl(null);
      setSavedSettlements([]);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

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

    // Free users: max 10 saves
    if (!isPremium && savedSettlements.length >= 10) {
      alert('Free accounts can save up to 10 settlements. Upgrade to Premium for unlimited saves!');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('settlements').insert([
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
      alert('Could not save to cloud.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSettlementFromCloud = async (id) => {
    if (!id) {
      setShowCreator(true);
      return;
    }
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

      // Push state to history
      window.history.pushState({ hasSettlement: true }, "", "");
    } catch (err) {
      console.error('Load error:', err);
      alert('Failed to load settlement data.');
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, aspect_ratio: aspectRatio, enhance: enhancePrompt }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setImageUrl(data.image_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Settlement Creation ─────────────────────────────────────
  const handleCreateSettlement = async (settings) => {
    setShowCreator(false);
    setError(null);
    setImageUrl(null);
    setLoading(true);

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

      const newSettlement = generateSettlement(settings);
      newSettlement.buildings = newSettlement.buildings.map(b => ({
        ...b,
        mapPosition: { x: Math.floor(Math.random() * 600) + 100, y: Math.floor(Math.random() * 600) + 100 }
      }));

      setSettlement(newSettlement);
      setEventLog([]);

      // Push state to history
      window.history.pushState({ hasSettlement: true }, "", "");
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
        setEventLog(l => [...l, ...newEvents.slice(0, 5)]);
      }
      return next;
    });
  }, [settlement]);

  const timeSkip = useCallback(() => {
    if (!settlement) return;
    const skipHours = 6 - (settlement.time.hour % 6);
    for (let i = 0; i < skipHours; i++) advanceHour();
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
    setEventLog(l => [...l, { hour, day: settlement.time.day, text: `Time set to ${hour}:00.` }]);
  }, [settlement]);

  // ── NPC/Building Editing ───────────────────────────────────────
  const handleUpdateNPC = (id, updates) => {
    setSettlement(prev => ({
      ...prev,
      npcs: prev.npcs.map(n => n.id === id ? { ...n, ...updates } : n),
    }));
    if (selectedNPC?.id === id) setSelectedNPC(p => ({ ...p, ...updates }));
  };

  const handleUpdateBuilding = (id, updates) => {
    setSettlement(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
    if (selectedBuilding?.id === id) setSelectedBuilding(p => ({ ...p, ...updates }));
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

  const handleClearFog = () => setSettlement(p => ({ ...p, fogPaths: [] }));

  const handleAddNPC = (newNPC, bldId, roomName) => {
    setSettlement(prev => {
      const updatedBuildings = prev.buildings.map(b => {
        if (b.id === bldId) {
          return {
            ...b,
            rooms: b.rooms.map(r => r.name === roomName ? { ...r, occupants: [...r.occupants, newNPC.id] } : r),
          };
        }
        return b;
      });
      return { ...prev, npcs: [...prev.npcs, newNPC], buildings: updatedBuildings };
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

  // ── View Transitions ──────────────────────────────────────────
  const handleViewPeople = () => {
    setDrawingDistrictId(null); setIsDrawingFog(false);
    setActiveView(activeView === 'people' ? null : 'people');
    setShowPeopleList(!showPeopleList);
    setShowBuildingList(false); setShowFactionList(false); setShowDistrictList(false);
  };
  const handleViewBuildings = () => {
    setDrawingDistrictId(null); setIsDrawingFog(false);
    setActiveView(activeView === 'buildings' ? null : 'buildings');
    setShowBuildingList(!showBuildingList);
    setShowPeopleList(false); setShowFactionList(false); setShowDistrictList(false);
  };
  const handleViewFactions = () => {
    setDrawingDistrictId(null); setIsDrawingFog(false);
    setActiveView(activeView === 'factions' ? null : 'factions');
    setShowFactionList(!showFactionList);
    setShowPeopleList(false); setShowBuildingList(false); setShowDistrictList(false);
  };
  const handleViewDistricts = () => {
    setIsDrawingFog(false);
    setActiveView(activeView === 'districts' ? null : 'districts');
    setShowDistrictList(!showDistrictList);
    setShowPeopleList(false); setShowBuildingList(false); setShowFactionList(false);
  };
  const handleViewShops = () => { setDrawingDistrictId(null); setIsDrawingFog(false); setShowShopPanel(true); };
  const handleViewSettings = () => setShowSettings(true);
  const handleUpdateAppSettings = (u) => setAppSettings(p => ({ ...p, ...u }));
  const handleBack = () => {
    // Always reset to landing page
    setSettlement(null);
    setActiveView(null);
    setImageUrl(null);
    setShowPeopleList(false);
    setShowBuildingList(false);
    setShowFactionList(false);
    setShowDistrictList(false);
    setShowCreator(false);
    setShowExport(false);
    setShowShopPanel(false);
    setShowSettings(false);
    setSelectedNPC(null);
    setSelectedBuilding(null);
    setDrawingDistrictId(null);
    setIsDrawingFog(false);
    setError(null);
  };

  const hasDashboard = imageUrl && settlement;

  return (
    <ErrorBoundary>
      <div className="app-container">
        {!settlement ? (
          <div className="landing-wrapper">
            <LandingPage
              prompt={prompt}
              setPrompt={setPrompt}
              loading={loading}
              handleGenerate={handleGenerate}
              onLoadCloud={() => setShowSaves(true)}
              onLoginClick={() => setShowAuthModal(true)}
              onGuestStart={() => { setSettlement({ name: 'Untitled Settlement', loading: true }); setShowCreator(true); }}
              session={session}
              savedSettlements={savedSettlements}
              onLoadSave={loadSettlementFromCloud}
              onLogout={handleSignOut}
            />
          </div>
        ) : (
          <div className="app dashboard-mode">
            <header className="app-header-main">
              <div className="header-top">
                <button className="btn btn-sm btn-secondary header-back-btn" onClick={handleBack} style={{ marginRight: '10px', zIndex: 100 }}>⬅ Back</button>
                <div className="user-status">
                  {session ? (
                    <span>Welcome, {session.user.email} <button className="btn btn-sm btn-secondary" onClick={handleSignOut} style={{ marginLeft: '10px' }}>Sign Out</button></span>
                  ) : (
                    <span>Welcome, Guest Wanderer <button className="btn btn-sm btn-primary" onClick={() => setShowAuthModal(true)} style={{ marginLeft: '10px' }}>LOG IN TO SAVE</button></span>
                  )}
                </div>
                <div className="app-logo">
                  <img src={logo} alt="Map Forge Logo" className="header-logo-img" />
                  <span>TTRPG MAP FORGE</span>
                </div>
                <div className="header-spacer"></div>
              </div>
              <p className="app-tagline">Your Infinite Regional Map Generator</p>
            </header>

            {loading && (
              <section className="card spinner-wrapper">
                <div className="spinner" />
                <p>Summoning your settlement from the aether…</p>
              </section>
            )}

            {error && <div className="error-message">⚠️ {error}</div>}

            {hasDashboard && (
              <>
                <Toolbar
                  settlement={settlement}
                  onViewPeople={handleViewPeople}
                  onViewBuildings={handleViewBuildings}
                  onViewFactions={handleViewFactions}
                  onViewDistricts={handleViewDistricts}
                  onViewShops={handleViewShops}
                  onViewSettings={handleViewSettings}
                  onExport={() => setShowExport(true)}
                  onBack={handleBack}
                  activeView={activeView}
                />

                <div className={`mobile-overlay ${activeView ? 'active' : ''}`} onClick={() => setActiveView(null)} />

                <div className="dashboard-content">
                  <div className="dashboard-main">
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

                    <InteractiveMap
                      imageUrl={imageUrl}
                      showGrid={showGrid}
                      gridSize={appSettings.gridSize}
                      gridColor={`rgba(255, 255, 255, ${appSettings.gridOpacity})`}
                      fogEnabled={settlement.fogEnabled || false}
                      fogPaths={settlement.fogPaths || []}
                      fogOpacity={appSettings.fogOpacity}
                      isDrawingFog={isDrawingFog}
                      onAddFogPath={handleUpdateFogPaths}
                      buildings={settlement.buildings}
                      time={settlement.time}
                      districts={settlement.districts}
                      drawingDistrictId={drawingDistrictId}
                      onUpdateDistrictPolygon={handleUpdateDistrictPolygon}
                      onSelectBuilding={handleSelectBuilding}
                      onUpdateBuildingPosition={(id, pos) => handleUpdateBuilding(id, { mapPosition: pos })}
                    />

                    <TimeSystem
                      time={settlement.time}
                      climate={settlement.settings.climate}
                      onAdvanceHour={advanceHour}
                      onTimeSkip={timeSkip}
                      onSetTime={setTime}
                      eventLog={eventLog}
                    />
                  </div>

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
            
            <footer className="app-footer">
              Powered by Stable Diffusion via NVIDIA &middot; Built with React + FastAPI &middot; v1.0.4-FIX-MOBILE
            </footer>
          </div>
        )}

        {/* ── Modals & Overlays ── */}
        {showCreator && (
          <SettlementCreator
            onClose={() => setShowCreator(false)}
            onCreate={handleCreateSettlement}
            isPremium={isPremium}
          />
        )}
        
        {showAuthModal && (
          <Auth
            onLogin={(user) => { 
                setShowAuthModal(false); 
                // Delay slightly to allow session to settle, then open creator
                setTimeout(() => setShowCreator(true), 300);
            }}
            onClose={() => setShowAuthModal(false)}
          />
        )}
        
        {showExport && settlement && (
          <ExportPanel
            settlement={settlement}
            imageUrl={imageUrl}
            onClose={() => setShowExport(false)}
            isPremium={isPremium}
            isGuest={isGuest}
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
        
        {showSettings && (
          <SettingsPanel
            settings={appSettings}
            onUpdate={handleUpdateAppSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

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
                    <div key={save.id} className="save-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid #444', borderRadius: '8px' }}>
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
      </div>
    </ErrorBoundary>
  );
}
