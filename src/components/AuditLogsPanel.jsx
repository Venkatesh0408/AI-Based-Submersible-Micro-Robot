import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, Activity, Key, LogIn, Monitor } from "lucide-react";

function AuditLogsPanel() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
      async function fetchLogs() {
          try {
              const res = await fetch("/api/auth/audit-logs");
              if (!res.ok) return;
              const contentType = res.headers.get("content-type") || "";
              if (!contentType.includes("application/json")) return;
              const text = await res.text();
              if (!text || text.trim().startsWith("<")) return;
              const data = JSON.parse(text);
              if (data && data.success) {
                  setLogs(data.logs);
              }
          } catch(e) {
              console.error("AuditLogsPanel fetch error:", e);
          }
      }
      fetchLogs();
      const interval = setInterval(fetchLogs, 15000);
      return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: "#0f0507",
      borderRadius: "22px",
      padding: "25px",
      boxShadow: "0 0 25px rgba(255,42,75,.2)",
      border: "1px solid rgba(255,42,75,.3)",
      margin: "0",
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
         <h2 style={{ color: "#ff2a4b", fontSize: "24px", display: 'flex', alignItems: 'center', gap: '10px' }}>
           <Key size={26} /> Biometric Audit Logs
         </h2>
         <div style={{
             padding: '5px 15px',
             borderRadius: '20px',
             background: 'rgba(255, 42, 75, 0.2)',
             color: '#ff2a4b',
             fontWeight: 'bold',
             display: 'flex',
             alignItems: 'center',
             gap: '8px'
         }}>
            <Activity size={18} />
            {logs.length} RECORDS
         </div>
      </div>
      
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '5px' }}>
         {logs.length > 0 ? (
             logs.map((log) => (
                 <div key={log.id} style={{ 
                     background: '#1a080c', 
                     borderRadius: '12px', 
                     padding: '12px 16px', 
                     borderLeft: `4px solid ${log.success ? '#22c55e' : '#ff2a4b'}`,
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center'
                 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                         <div style={{ 
                             background: log.success ? 'rgba(34,197,94,0.2)' : 'rgba(255,42,75,0.2)',
                             color: log.success ? '#22c55e' : '#ff2a4b',
                             padding: '10px',
                             borderRadius: '50%'
                         }}>
                             {log.success ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                             <div style={{ color: 'white', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                 <LogIn size={14} color="#ff2a4b" /> 
                                 {log.note || (log.success ? "Authentication Granted" : "Authentication Denied")}
                             </div>
                             <div style={{ color: '#d19ca3', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                 <Monitor size={12} /> {log.deviceId}
                             </div>
                             <div style={{ color: '#ff2a4b', fontSize: '12px', opacity: 0.8 }}>
                                 {new Date(log.timestamp).toLocaleString()}
                             </div>
                         </div>
                     </div>
                     <div style={{ 
                         display: 'flex', 
                         flexDirection: 'column', 
                         alignItems: 'flex-end',
                         gap: '5px'
                     }}>
                         <div style={{ fontSize: '12px', color: '#d19ca3', textTransform: 'uppercase', letterSpacing: '1px' }}>Confidence</div>
                         <div style={{ 
                             fontSize: '20px', 
                             fontWeight: 'black', 
                             color: log.confidence >= 90 ? '#22c55e' : (log.confidence >= 70 ? '#ffd600' : '#ff2a4b'),
                             fontFamily: '"Orbitron", sans-serif'
                         }}>
                             {log.confidence}%
                         </div>
                     </div>
                 </div>
             ))
         ) : (
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,42,75,0.05)', borderRadius: '16px', color: '#ff2a4b', gap: '15px', padding: '40px' }}>
                <Key size={50} style={{ opacity: 0.5 }} />
                <h3 style={{ fontSize: '20px' }}>No Audit Logs</h3>
                <p style={{ color: '#d19ca3' }}>Biometric authentication attempts will appear here.</p>
             </div>
         )}
      </div>
    </div>
  );
}

export default AuditLogsPanel;
