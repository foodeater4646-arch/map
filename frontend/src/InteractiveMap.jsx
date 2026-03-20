import { useState, useRef, useEffect, useCallback } from 'react';
import './InteractiveMap.css';

const InteractiveMap = ({
    imageUrl,
    showGrid,
    gridColor = 'rgba(255, 255, 255, 0.3)',
    gridSize = 50,
    buildings = [],          // <-- Added for building markers
    time = null,             // <-- Added for time of day filter
    districts = [],          // <-- Added for SVG drawing
    drawingDistrictId = null,// <-- Active district being drawn
    onUpdateDistrictPolygon = null,
    fogEnabled = false,
    fogPaths = [],
    isDrawingFog = false,
    onAddFogPath = null,
    fogOpacity = 0.92,
    onSelectBuilding = null, // <-- Added for click selection
    onUpdateBuildingPosition = null // <-- Added for dragging markers
}) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [clickStart, setClickStart] = useState({ x: 0, y: 0 }); // To differentiate click from drag
    const [draggedBuildingId, setDraggedBuildingId] = useState(null); // <-- ID of building currently being dragged
    const [currentFogPath, setCurrentFogPath] = useState(null); // <-- Path being drawn
    const [lastTouchDistance, setLastTouchDistance] = useState(null); // For pinch zoom
    const lastTouchPos = useRef({ x: 0, y: 0 }); // For touch panning
    const containerRef = useRef(null);
    const mapRef = useRef(null);

    // Handle Zoom (Centered on Mouse)
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const zoomSpeed = 0.0015;
        const zoomFactor = 1 - e.deltaY * zoomSpeed;

        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            setScale(prevScale => {
                const newScale = Math.min(Math.max(prevScale * zoomFactor, 0.5), 5);

                setPosition(prevPos => {
                    // Calculate point on map before zoom
                    const mapX = (mouseX - prevPos.x) / prevScale;
                    const mapY = (mouseY - prevPos.y) / prevScale;

                    // Calculate new position to keep mapX/mapY at the same mouseX/mouseY
                    return {
                        x: mouseX - mapX * newScale,
                        y: mouseY - mapY * newScale
                    };
                });

                return newScale;
            });
        }
    }, []); // Empty deps because we use functional updates

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [handleWheel]);

    // Handle Pan start
    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // Only left click

        if (isDrawingFog && mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / scale;
            const y = (e.clientY - rect.top) / scale;
            setCurrentFogPath([{ x, y }]);
            return;
        }

        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        setClickStart({ x: e.clientX, y: e.clientY });
    };

    // Handle Pan movement OR Building Drag
    const handleMouseMove = (e) => {
        if (isDrawingFog && currentFogPath && mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / scale;
            const y = (e.clientY - rect.top) / scale;
            setCurrentFogPath([...currentFogPath, { x, y }]);
            return;
        }

        if (draggedBuildingId && mapRef.current) {
            // We are dragging a building marker
            const rect = mapRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / scale;
            const y = (e.clientY - rect.top) / scale;
            if (onUpdateBuildingPosition) {
                onUpdateBuildingPosition(draggedBuildingId, { x, y });
            }
            return;
        }

        if (isDragging) {
            // We are panning the map
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    // Handle Pan or Drag end
    const handleMouseUp = (e) => {
        if (isDrawingFog && currentFogPath) {
            if (onAddFogPath) onAddFogPath(currentFogPath);
            setCurrentFogPath(null);
            return;
        }

        setIsDragging(false);
        setDraggedBuildingId(null);

        // Handle Map Click for drawing
        if (drawingDistrictId && onUpdateDistrictPolygon && mapRef.current && e) {
            // Check distance to ensure it was a click, not a pan
            const dist = Math.hypot(e.clientX - clickStart.x, e.clientY - clickStart.y);
            if (dist < 5) {
                const rect = mapRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left) / scale;
                const y = (e.clientY - rect.top) / scale;

                const activeDistrict = districts.find(d => d.id === drawingDistrictId);
                if (activeDistrict) {
                    const currentPolygon = activeDistrict.polygon || [];
                    onUpdateDistrictPolygon(drawingDistrictId, [...currentPolygon, { x, y }]);
                }
            }
        }
    };

    // --- Touch Event Handlers ---
    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];

            if (isDrawingFog && mapRef.current) {
                const rect = mapRef.current.getBoundingClientRect();
                const x = (touch.clientX - rect.left) / scale;
                const y = (touch.clientY - rect.top) / scale;
                setCurrentFogPath([{ x, y }]);
                return;
            }

            setIsDragging(true);
            setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
            setClickStart({ x: touch.clientX, y: touch.clientY });
            lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
        } else if (e.touches.length === 2) {
            // Initialize pinch zoom
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            setLastTouchDistance(dist);
            setIsDragging(false); // Stop panning when zooming
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];

            if (isDrawingFog && currentFogPath && mapRef.current) {
                const rect = mapRef.current.getBoundingClientRect();
                const x = (touch.clientX - rect.left) / scale;
                const y = (touch.clientY - rect.top) / scale;
                setCurrentFogPath([...currentFogPath, { x, y }]);
                return;
            }

            if (isDragging) {
                setPosition({
                    x: touch.clientX - dragStart.x,
                    y: touch.clientY - dragStart.y
                });
            }
        } else if (e.touches.length === 2) {
            // Handle pinch zoom
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );

            if (lastTouchDistance) {
                const zoomFactor = dist / lastTouchDistance;
                const newScale = Math.min(Math.max(scale * zoomFactor, 0.5), 5);
                setScale(newScale);
            }
            setLastTouchDistance(dist);
        }
    };

    const handleTouchEnd = () => {
        if (isDrawingFog && currentFogPath) {
            if (onAddFogPath) onAddFogPath(currentFogPath);
            setCurrentFogPath(null);
        }
        setIsDragging(false);
        setLastTouchDistance(null);
    };

    const resetView = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const getFilterOverlay = () => {
        if (!time) return null;
        const h = time.hour;
        if (h >= 20 || h < 5) return { background: 'rgba(10, 10, 40, 0.55)', mixBlendMode: 'multiply' }; // Night
        if (h >= 5 && h < 8) return { background: 'rgba(255, 120, 50, 0.25)', mixBlendMode: 'hard-light' }; // Dawn
        if (h >= 17 && h < 20) return { background: 'rgba(255, 80, 0, 0.2)', mixBlendMode: 'color-burn' }; // Dusk
        return { background: 'transparent' }; // Day
    };

    // Attach non-passive wheel event for zooming
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [scale]);

    return (
        <div className="interactive-map-wrapper">
            <div className="controls">
                <button className="btn btn-sm" onClick={resetView}>Reset View</button>
                <div className="zoom-indicator">Zoom: {Math.round(scale * 100)}%</div>
            </div>

            <div
                className={`interactive-map-container ${isDragging ? 'dragging' : ''}`}
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="map-layer"
                    ref={mapRef}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: '0 0'
                    }}
                >
                    <img src={imageUrl} alt="TTRPG Map" className="map-base" draggable="false" />

                    {time && (
                        <div
                            className="time-filter-overlay"
                            style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                pointerEvents: 'none',
                                zIndex: 5,
                                transition: 'background 2s ease, mix-blend-mode 2s ease',
                                ...getFilterOverlay()
                            }}
                        />
                    )}

                    {showGrid && (
                        <div
                            className="grid-overlay"
                            style={{
                                backgroundImage: `
                                  linear-gradient(to right, ${gridColor} 1px, transparent 1px),
                                  linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
                                `,
                                backgroundSize: `${gridSize}px ${gridSize}px`,
                                zIndex: 6
                            }}
                        />
                    )}

                    {/* Render District Polygons */}
                    {districts && districts.length > 0 && (
                        <svg
                            className="district-overlay"
                            style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                pointerEvents: 'none', zIndex: 10
                            }}
                        >
                            {districts.map(d => {
                                if (!d.polygon || d.polygon.length === 0) return null;
                                const points = d.polygon.map(p => `${p.x},${p.y}`).join(' ');
                                return (
                                    <polygon
                                        key={d.id}
                                        points={points}
                                        fill={d.color || 'rgba(0,0,0,0.3)'}
                                        stroke={d.color ? d.color.replace('0.4', '1') : 'rgba(0,0,0,1)'}
                                        strokeWidth={2 / scale}
                                    />
                                );
                            })}
                        </svg>
                    )}

                    {/* Render Fog of War */}
                    {fogEnabled && (
                        <svg
                            className="fog-overlay"
                            style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                pointerEvents: 'none', zIndex: 12
                            }}
                        >
                            <defs>
                                <mask id="fog-mask">
                                    <rect width="100%" height="100%" fill="white" />
                                    {(fogPaths || []).map((path, i) => (
                                        <polyline
                                            key={`fog-${i}`}
                                            points={path.map(p => `${p.x},${p.y}`).join(' ')}
                                            stroke="black" fill="none"
                                            strokeWidth={60} strokeLinecap="round" strokeLinejoin="round"
                                        />
                                    ))}
                                    {currentFogPath && (
                                        <polyline
                                            points={currentFogPath.map(p => `${p.x},${p.y}`).join(' ')}
                                            stroke="black" fill="none"
                                            strokeWidth={60} strokeLinecap="round" strokeLinejoin="round"
                                        />
                                    )}
                                </mask>
                            </defs>
                            <rect width="100%" height="100%" fill={`rgba(10,10,20,${fogOpacity})`} mask="url(#fog-mask)" />
                        </svg>
                    )}

                    {/* Render Interactive Building Markers */}
                    {buildings.filter(b => b.mapPosition).map(b => (
                        <div
                            key={b.id}
                            className={`building-marker ${draggedBuildingId === b.id ? 'dragging' : ''}`}
                            style={{
                                left: `${b.mapPosition.x}px`,
                                top: `${b.mapPosition.y}px`,
                                transform: `translate(-50%, -50%) scale(${1 / scale})`,
                                zIndex: 11
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectBuilding) onSelectBuilding(b);
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation(); // Prevent panning when dragging building
                                setDraggedBuildingId(b.id);
                            }}
                        >
                            <div className="building-icon">{b.icon || '🏠'}</div>
                            <div className="building-tooltip">
                                <strong>{b.name}</strong>
                                <span>{b.type} • {b.rooms.reduce((s, r) => s + r.occupants.length, 0)} people</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <p className="help-text">
                {isDrawingFog
                    ? "Drag on the map to erase the Fog of War for your players."
                    : drawingDistrictId
                        ? "Click on the map to draw the district boundary points."
                        : "Scroll to zoom • Drag to pan • Drag icons to appoint to building • Click building to edit"}
            </p>
        </div>
    );
};

export default InteractiveMap;
