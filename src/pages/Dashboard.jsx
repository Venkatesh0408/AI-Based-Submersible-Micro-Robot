import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MissionStatus from "../components/MissionStatus";
import MissionToolbar from "../components/MissionToolbar";
import CameraPanel from "../components/CameraPanel";
import SensorCard from "../components/SensorCard";
import InspectionPanel from "../components/InspectionPanel";
import HealthPanel from "../components/HealthPanel";
import { getSensorData } from "../services/api";

export default function Dashboard() {
    const navigate = useNavigate();
    const [sensors, setSensors] = useState([]);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getSensorData();
                setSensors(Array.isArray(data) ? data : []);
            }
            catch (err) {
                console.log(err);
            }
        }
        loadData();
        const timer = setInterval(loadData, 2000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="dashboard">
            
            <Header />
            <MissionStatus />
            {/* CAMERA + CONTROL */}
            <div className="top-section-full" style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <CameraPanel />
                <MissionToolbar />
            </div>

            <div className="three-panels" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '30px' }}>
                <InspectionPanel />

                {/* GPS CARD */}
                <div
                    className="system-card"
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    onClick={() => navigate("/route-planner")}
                >
                    <div className="system-icon">
                        🛰
                    </div>
                    <h2>
                        GPS Mission Planner
                    </h2>
                    <p>
                        Create autonomous routes, add waypoints, edit routes, simulate robot movement.
                    </p>
                    <div className="system-info">
                        <span>Waypoints : 8</span>
                        <span>ETA : 18 min</span>
                    </div>
                    <button style={{ marginTop: 'auto' }}>
                        OPEN GPS SYSTEM →
                    </button>
                </div>

                {/* AI CARD */}
                <div
                    className="system-card"
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    onClick={() => navigate("/image-analysis")}
                >
                    <div className="system-icon">
                        🤖
                    </div>
                    <h2>
                        AI Image Analysis
                    </h2>
                    <p>
                        Detect cracks, corrosion, algae, leakage, structural damage, and generate reports.
                    </p>
                    <div className="system-info">
                        <span>Objects : 12</span>
                        <span>Accuracy : 98.4%</span>
                    </div>
                    <button style={{ marginTop: 'auto' }}>
                        OPEN AI SYSTEM →
                    </button>
                </div>
            </div>
            {/* SENSOR CARDS */}
            <div className="sensor-section">
                {sensors.map((s, index) => (
                    <SensorCard
                        key={index}
                        title={s.name}
                        value={s.value}
                        unit={s.unit}
                        status={s.status}
                        error={s.error}
                        solution={s.solution}
                    />
                ))}
            </div>
            <HealthPanel />
        </div>
    );
}
