import { useMission } from "../context/MissionContext";
import { Navigation, Trash2 } from "lucide-react";

export default function WaypointList() {
    const { getWaypointSegments, currentWaypoint, missionStarted, removeWaypoint } = useMission();
    const segments = getWaypointSegments();

    const btnStyle = {
        background: "rgba(255, 42, 75, 0.2)",
        border: "1px solid rgba(255, 42, 75, 0.4)",
        color: "#ff2a4b",
        borderRadius: "4px",
        padding: "3px 6px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    };

    return (
        <div className="timeline-card" style={{ background: '#0f0507', border: '1px solid rgba(255, 42, 75, 0.25)', borderRadius: '16px', padding: '16px' }}>
            <h2 style={{ color: '#ff2a4b', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={18} />
                Mission Waypoints & Thruster Times
            </h2>

            {segments.length === 0 ? (
                <p style={{ color: '#888', fontSize: '12px', textAlign: 'center', padding: '12px 0' }}>
                    No waypoints placed on map yet.
                </p>
            ) : (
                segments.map((seg, index) => {
                    const isCurrent = currentWaypoint === index && missionStarted;
                    const isDone = seg.status === 'COMPLETED';

                    return (
                        <div
                            key={index}
                            className={`timeline-item ${isDone ? 'completed' : isCurrent ? 'active' : 'pending'}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 12px',
                                marginBottom: '8px',
                                background: isCurrent ? 'rgba(255, 42, 75, 0.15)' : 'rgba(26, 8, 12, 0.6)',
                                border: `1px solid ${isCurrent ? '#ff2a4b' : 'rgba(255, 42, 75, 0.15)'}`,
                                borderRadius: '10px'
                            }}
                        >
                            <div className="timeline-dot" style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: isDone ? '#4ade80' : isCurrent ? '#facc15' : '#888'
                            }}></div>

                            <div className="timeline-content" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ color: '#fff', fontSize: '13px', margin: 0, fontWeight: 'bold' }}>
                                        WP #{seg.index}: {seg.to}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#ff2a4b', fontSize: '12px', fontWeight: 'bold', fontFamily: '"Orbitron", sans-serif' }}>
                                            {seg.distanceMeters.toFixed(1)} m
                                        </span>
                                        {!missionStarted && (
                                            <button
                                                onClick={() => removeWaypoint(index)}
                                                style={btnStyle}
                                                title="Delete Waypoint"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#a08085' }}>
                                    <span>Turn Angle: <strong style={{ color: '#60a5fa' }}>{seg.bearingDeg}°</strong></span>
                                    <span>Thruster Run: <strong style={{ color: '#facc15' }}>{seg.thrusterSec.toFixed(1)}s</strong></span>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
