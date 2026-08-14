import InteractiveMap from "./InteractiveMap";
import MissionToolbar from "./MissionToolbar";
import MissionAnalytics from "./MissionAnalytics";
import WaypointList from "./WaypointList";
import LiveMissionMonitor from "./LiveMissionMonitor";

import "../styles/map.css";

import { useMission } from "../context/MissionContext";

import { useEffect } from "react";
export default function MapPanel() {
    const { missionName, setMissionName, inspectionArea, setInspectionArea, missionStarted } = useMission();
    useEffect(() => {
        if (!missionName) setMissionName("Mission 1");
        if (!inspectionArea) setInspectionArea("Water Tank");
    }, []);

    return (

        <div className="map-card">

            <div className="map-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '10px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
                    <h2>🛰 Mission Planner</h2>
                    <span className="map-status">LIVE GPS</span>
                </div>
                <div style={{display: 'flex', gap: '15px', width: '100%', paddingBottom: '10px'}}>
                    <input 
                        type="text" 
                        placeholder="Mission Name (e.g. Mission 1)" 
                        value={missionName} 
                        onChange={(e) => setMissionName(e.target.value)}
                        disabled={missionStarted}
                        style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ff2a4b', background: '#1a080c', color: 'white', outline: 'none'}}
                    />
                    <select 
                        value={inspectionArea} 
                        onChange={(e) => setInspectionArea(e.target.value)}
                        disabled={missionStarted}
                        style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ff2a4b', background: '#1a080c', color: 'white', outline: 'none'}}
                    >
                        <option value="">Select Inspection Area</option>
                        <option value="Water Tank">Water Tank</option>
                        <option value="River">River</option>
                        <option value="Lake">Lake</option>
                        <option value="Pipeline">Pipeline</option>
                        <option value="Ocean">Ocean</option>
                        <option value="Custom">Custom</option>
                    </select>
                </div>
            </div>

            <InteractiveMap />

            <MissionToolbar />

            

            
            

        </div>

    );

}