import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateInspectionReport } from "../utils/pdfGenerator";
import Header from "../components/Header";
import "../styles/History.css";

export default function History() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/analysis-history");
            if (!res.ok) return;
            const contentType = res.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) return;
            const text = await res.text();
            if (!text || text.trim().startsWith("<")) return;
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
                setHistory(data);
            }
        } catch(e) {
            console.error("History fetch error:", e);
        }
    };

    return (
        <div className="history-page">
            <Header />
            <div className="page-toolbar" style={{ margin: '20px' }}>
                <button 
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
            </div>
            
            <div className="history-header">
                <h1>📁 Analysis History</h1>
                <p>Review past underwater inspections and AI reports</p>
            </div>

            <div className="history-grid">
                {history.length === 0 ? (
                    <div style={{color: '#c7ddff', fontSize: '1.2rem', padding: '20px'}}>No history found. Run AI analysis to save reports here.</div>
                ) : (
                    history.map((item) => (
                        <div key={item.id} className="history-file-card" onClick={() => setSelectedItem(item)}>
                            <div className="gallery-thumbnail">
                                <img src={item.image} alt={item.missionName || "Inspection"} />
                            </div>
                            <div className="file-details">
                                <div className="file-name">{item.missionName || "MANUAL"} ({item.inspectionArea || "Unknown"})</div>
                                <div className="file-date">{new Date(item.timestamp).toLocaleString()}</div>
                                <div className="file-status" style={{color: item.overallCondition === 'GOOD' ? '#00e676' : (item.overallCondition === 'CRITICAL' ? '#ff1744' : '#ff9800')}}>
                                    Condition: {item.overallCondition || 'UNKNOWN'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedItem && (
                <div className="history-modal" onClick={() => setSelectedItem(null)}>
                    <div className="history-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedItem(null)}>✕</button>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingRight: '40px'}}>
        <h2 style={{color: 'white', margin: 0}}>Inspection Details - {selectedItem.missionName} ({selectedItem.inspectionArea})</h2>
        <div style={{display: 'flex', gap: '15px'}}>
            <button 
                onClick={() => generateInspectionReport(selectedItem)}
                style={{ background: '#ff2a4b', color: '#ffffff', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
                📄 Download PDF
            </button>
            <button 
                onClick={async () => {
                    if(window.confirm('Are you sure you want to delete this inspection?')) {
                        await fetch('/api/analysis-history/' + selectedItem.id, { method: 'DELETE' });
                        setSelectedItem(null);
                        fetchHistory();
                    }
                }}
                style={{ background: '#ff1744', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
                🗑️ Delete
            </button>
        </div>
    </div>
                        <div className="modal-body">
                            <div className="modal-left">
                                <img src={selectedItem.image} alt="Inspection" />
                            </div>
                            <div className="modal-right">
                                <h3>AI Solutions Report</h3>
                                <div className="modal-scroll">
                                    {selectedItem.detections?.length > 0 ? (
                                        selectedItem.detections.map((det, idx) => (
                                            <div key={idx} style={{background: '#22344d', padding: '20px', borderRadius: '12px', borderLeft: `4px solid ${det.color}`, marginBottom: '15px'}}>
                                                <h4 style={{color: det.color, marginBottom: '12px', fontSize: '1.2rem'}}>{det.type} - Confidence: {det.confidence}%</h4>
                                                <div style={{marginBottom: '15px'}}>
                                                    <strong style={{color: '#c7ddff', display: 'block', marginBottom: '5px'}}>🇬🇧 English Solution:</strong>
                                                    <p style={{color: 'white', fontSize: '15px', lineHeight: '1.5'}}>{det.solutionEnglish}</p>
                                                </div>
                                                <div>
                                                    <strong style={{color: '#c7ddff', display: 'block', marginBottom: '5px'}}>🇮🇳 Kannada Solution (ಪರಿಹಾರ):</strong>
                                                    <p style={{color: 'white', fontSize: '15px', lineHeight: '1.5'}}>{det.solutionKannada}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{color: '#c7ddff', fontSize: '1.2rem', background: '#22344d', padding: '20px', borderRadius: '12px'}}>
                                            No anomalies detected in this image.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
