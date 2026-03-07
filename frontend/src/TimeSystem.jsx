/**
 * TimeSystem.jsx — Enhanced Settlement Time Controller
 *
 * Features: Clock display, day/night indicator, hour advance,
 * time skip, auto-advance toggle, set-time picker, event log.
 */

import { useState, useEffect, useRef } from 'react';
import './TimeSystem.css';

export default function TimeSystem({ time, climate = 'Temperate', onAdvanceHour, onTimeSkip, onSetTime, eventLog = [] }) {
    const [autoAdvance, setAutoAdvance] = useState(false);
    const [showSetTime, setShowSetTime] = useState(false);
    const [showLog, setShowLog] = useState(false);
    const [weather, setWeather] = useState({ type: 'Clear', icon: '☀️' });
    const intervalRef = useRef(null);

    const formatHour = (h) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:00 ${period}`;
    };

    const getTimeOfDay = (h) => {
        if (h >= 5 && h < 8) return { label: 'Dawn', icon: '🌅', bg: 'dawn' };
        if (h >= 8 && h < 12) return { label: 'Morning', icon: '☀️', bg: 'day' };
        if (h >= 12 && h < 14) return { label: 'Midday', icon: '🌞', bg: 'day' };
        if (h >= 14 && h < 17) return { label: 'Afternoon', icon: '☀️', bg: 'day' };
        if (h >= 17 && h < 20) return { label: 'Evening', icon: '🌇', bg: 'evening' };
        if (h >= 20 && h < 22) return { label: 'Dusk', icon: '🌙', bg: 'dusk' };
        return { label: 'Night', icon: '🌑', bg: 'night' };
    };

    // ── Weather Generation ──
    useEffect(() => {
        // Change weather roughly every 12-24 hours deterministically based on day/hour
        const seed = time.day * 24 + time.hour;
        if (seed % 12 === 0 || time.day === 1 && time.hour === 8) {
            const rand = Math.random();
            if (climate === 'Desert' || climate === 'Savanna') {
                if (rand < 0.8) setWeather({ type: 'Clear', icon: '☀️' });
                else if (rand < 0.95) setWeather({ type: 'Windy', icon: '💨' });
                else setWeather({ type: 'Sandstorm', icon: '🟤' });
            } else if (climate === 'Tundra' || climate === 'Taiga') {
                if (rand < 0.4) setWeather({ type: 'Clear', icon: '☀️' });
                else if (rand < 0.7) setWeather({ type: 'Overcast', icon: '☁️' });
                else if (rand < 0.9) setWeather({ type: 'Light Snow', icon: '🌨️' });
                else setWeather({ type: 'Blizzard', icon: '❄️' });
            } else if (climate === 'Jungle' || climate === 'Swamp') {
                if (rand < 0.3) setWeather({ type: 'Humid', icon: '🌡️' });
                else if (rand < 0.5) setWeather({ type: 'Overcast', icon: '☁️' });
                else if (rand < 0.8) setWeather({ type: 'Rain', icon: '🌧️' });
                else setWeather({ type: 'Storm', icon: '⛈️' });
            } else {
                // Temperate / Default
                if (rand < 0.4) setWeather({ type: 'Clear', icon: '☀️' });
                else if (rand < 0.7) setWeather({ type: 'Overcast', icon: '☁️' });
                else if (rand < 0.9) setWeather({ type: 'Rain', icon: '🌧️' });
                else setWeather({ type: 'Storm', icon: '⛈️' });
            }
        }
    }, [time.day, time.hour, climate]);

    // Auto-advance timer
    useEffect(() => {
        if (autoAdvance) {
            intervalRef.current = setInterval(() => {
                onAdvanceHour();
            }, 2000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoAdvance, onAdvanceHour]);

    const tod = getTimeOfDay(time.hour);

    return (
        <div className={`time-system time-${tod.bg}`}>
            <div className="time-main-row">
                <div className="time-display">
                    <span className="time-icon">{tod.icon}</span>
                    <div className="time-info">
                        <span className="time-clock">{formatHour(time.hour)}</span>
                        <span className="time-day">Day {time.day}/{time.totalDays} · {tod.label}</span>
                    </div>
                </div>

                <div className="weather-display" title={`${climate} Climate`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{weather.icon}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{weather.type}</span>
                </div>

                <div className="time-controls">
                    <button
                        className={`time-btn ${autoAdvance ? 'active' : ''}`}
                        onClick={() => setAutoAdvance(!autoAdvance)}
                        title={autoAdvance ? 'Pause auto-advance' : 'Auto-advance time'}
                    >
                        {autoAdvance ? '⏸ Pause' : '▶️ Play'}
                    </button>
                    <button className="time-btn" onClick={onAdvanceHour} title="Advance 1 hour">
                        ⏩ +1h
                    </button>
                    <button className="time-btn" onClick={onTimeSkip} title="Skip 6 hours">
                        ⏭️ Skip
                    </button>
                    <button className="time-btn" onClick={() => setShowSetTime(!showSetTime)} title="Set specific time">
                        🕐 Set
                    </button>
                    <button
                        className={`time-btn ${showLog ? 'active' : ''}`}
                        onClick={() => setShowLog(!showLog)}
                        title="Event log"
                    >
                        📜 Log {eventLog.length > 0 && <span className="log-badge">{eventLog.length}</span>}
                    </button>
                </div>
            </div>

            {/* Set Time Picker */}
            {showSetTime && (
                <div className="time-picker">
                    {Array.from({ length: 24 }, (_, h) => (
                        <button
                            key={h}
                            className={`hour-btn ${h === time.hour ? 'current' : ''}`}
                            onClick={() => { onSetTime(h); setShowSetTime(false); }}
                        >
                            {h}:00
                        </button>
                    ))}
                </div>
            )}

            {/* Event Log */}
            {showLog && (
                <div className="event-log">
                    {eventLog.length === 0 ? (
                        <p className="log-empty">No events yet. Advance time to see activity.</p>
                    ) : (
                        eventLog.slice(-15).reverse().map((evt, i) => (
                            <div key={i} className="log-entry">
                                <span className="log-time">{formatHour(evt.hour)}</span>
                                <span className="log-text">{evt.text}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
