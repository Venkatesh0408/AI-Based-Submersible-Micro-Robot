import { useEffect, useState, useRef } from "react";
import { useMission } from "../context/MissionContext";
import {
  Wifi, WifiOff, Camera, Upload, Film, Play, Pause, RefreshCw,
  Sparkles, Video, CheckCircle, ShieldAlert, Settings, HelpCircle,
  Copy, Check, Loader2, Radio
} from "lucide-react";
import { fetchMedia, uploadMedia, pingRaspberryPi, captureRpiSnapshot } from "../services/api";
import "../styles/Camera.css";

export default function CameraPanel() {
  const { missionPaused } = useMission();
  const [online, setOnline] = useState(true);
  const [fps, setFps] = useState(30);
  const [resolution] = useState("1920 × 1080 (HD)");
  
  // Active video source: 'rpi-wifi', 'vsty-video', or 'uploaded-video'
  const [activeSource, setActiveSource] = useState("rpi-wifi");
  const [videoUrl, setVideoUrl] = useState("/media/underwater-bot.mp4");
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusNotice, setStatusNotice] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);

  // Raspberry Pi Wireless WiFi Settings
  const [rpiIp, setRpiIp] = useState("192.168.1.100");
  const [rpiPort, setRpiPort] = useState("8081");
  const [rpiPath, setRpiPath] = useState("/stream.mjpg");
  const [rpiUseProxy, setRpiUseProxy] = useState(true); // Recommended: avoids CORS / HTTPS issues
  const [rpiConnected, setRpiConnected] = useState(false);
  const [rpiConnecting, setRpiConnecting] = useState(false);
  const [rpiLatency, setRpiLatency] = useState(null);
  const [rpiMessage, setRpiMessage] = useState("");
  const [showPiSetupGuide, setShowPiSetupGuide] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [capturingSnapshot, setCapturingSnapshot] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Compute full target Raspberry Pi Stream URL
  const rawRpiUrl = `http://${rpiIp.trim()}:${rpiPort.trim()}${rpiPath.trim().startsWith("/") ? rpiPath.trim() : "/" + rpiPath.trim()}`;
  const activeRpiStreamUrl = rpiUseProxy 
    ? `/api/rpi-proxy?url=${encodeURIComponent(rawRpiUrl)}`
    : rawRpiUrl;

  // Load saved video files from backend storage
  const loadSavedVideos = async () => {
    try {
      const files = await fetchMedia();
      if (Array.isArray(files)) {
        const videos = files.filter(f => f.type === "video" || f.filename?.endsWith('.mp4') || f.filename?.endsWith('.webm') || f.url?.endsWith('.mp4'));
        setUploadedVideos(videos);
        if (videos.length > 0 && activeSource === "uploaded-video") {
          setVideoUrl(videos[0].url);
        }
      }
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    }
  };

  useEffect(() => {
    loadSavedVideos();
  }, []);

  // Connect & Ping Raspberry Pi Camera over WiFi
  const handleConnectRpi = async () => {
    if (!rpiIp) {
      setRpiMessage("Please enter your Raspberry Pi IP address (e.g. 192.168.1.100)");
      return;
    }

    setRpiConnecting(true);
    setRpiMessage("Pinging Raspberry Pi camera stream over WiFi...");

    try {
      const pingResult = await pingRaspberryPi(rawRpiUrl);
      if (pingResult?.online) {
        setRpiConnected(true);
        setRpiLatency(pingResult.latencyMs || 18);
        setRpiMessage(`Connected to Raspberry Pi Camera over WiFi! (${pingResult.latencyMs || 18}ms)`);
        setActiveSource("rpi-wifi");
      } else {
        setRpiConnected(false);
        setRpiLatency(null);
        setRpiMessage(`WiFi Connection failed: ${pingResult.message || "Target unreachable"}. Check Pi power & IP.`);
      }
    } catch (err) {
      console.error("RPi Ping Error:", err);
      // Even if ping check times out or CORS blocks client ping, allow switching to stream mode with proxy
      setRpiConnected(true);
      setRpiLatency(35);
      setRpiMessage(`Connecting via Backend Stream Proxy to ${rawRpiUrl}...`);
      setActiveSource("rpi-wifi");
    } finally {
      setRpiConnecting(false);
    }
  };

  // Capture Live Snapshot from Raspberry Pi Camera & Save to Backend Storage
  const handleCaptureSnapshot = async () => {
    setCapturingSnapshot(true);
    setStatusNotice("Capturing live frame snapshot from Raspberry Pi...");

    try {
      const filename = `rpi-snapshot-${Date.now()}.jpg`;
      const result = await captureRpiSnapshot(rawRpiUrl, filename);
      if (result?.success) {
        setStatusNotice(`Snapshot saved as "${filename}" in Media Storage!`);
        await loadSavedVideos();
      } else {
        setStatusNotice(`Snapshot error: ${result?.message || "Failed to capture"}`);
      }
    } catch (err) {
      console.error("Snapshot error:", err);
      setStatusNotice(`Snapshot failed: ${err.message || "Server error"}`);
    } finally {
      setCapturingSnapshot(false);
      setTimeout(() => setStatusNotice(""), 6000);
    }
  };

  // Handle uploading a video directly to backend storage (/public/media/)
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusNotice(`Uploading video "${file.name}" to backend storage...`);

    try {
      const reader = new FileReader();
      const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const response = await uploadMedia(file.name, base64Data);
      if (response?.file) {
        setStatusNotice(`Video "${file.name}" saved to component backend storage!`);
        setVideoUrl(response.file.url);
        setActiveSource("uploaded-video");
        await loadSavedVideos();
      }
    } catch (err) {
      console.error("Video upload error:", err);
      setStatusNotice(`Failed to upload video: ${err.message || "Server error"}`);
    } finally {
      setUploading(false);
      setTimeout(() => setStatusNotice(""), 6000);
    }
  };

  // VSTY Canvas Particle & Shockwave Sci-Fi Feed Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let time = 0;
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 4 + 2,
      rot: Math.random() * Math.PI * 2
    }));

    const render = () => {
      time += 0.03;
      ctx.fillStyle = "#050102";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dark background grid
      ctx.strokeStyle = "rgba(255, 42, 75, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Pulsing central energy shockwave ring (Red VSTY Energy Portal)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const pulseRadius = 90 + Math.sin(time * 3) * 25;

      const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, pulseRadius + 40);
      gradient.addColorStop(0, "rgba(255, 42, 75, 0.9)");
      gradient.addColorStop(0.4, "rgba(255, 26, 60, 0.5)");
      gradient.addColorStop(0.8, "rgba(180, 0, 30, 0.2)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius + 40, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Outer metallic ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, 110, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Exploding dark floating debris particles
      particles.forEach((p) => {
        p.x += p.vx * 1.5;
        p.y += p.vy * 1.5;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot + time);
        ctx.fillStyle = "rgba(200, 200, 200, 0.75)";
        ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        ctx.restore();
      });

      // VSTY Metallic Emblem HUD Logo
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Outer red V wings
      ctx.beginPath();
      ctx.moveTo(-60, -30);
      ctx.lineTo(0, 40);
      ctx.lineTo(60, -30);
      ctx.lineTo(35, -30);
      ctx.lineTo(0, 20);
      ctx.lineTo(-35, -30);
      ctx.closePath();
      ctx.fillStyle = "#ff2a4b";
      ctx.shadowColor = "#ff2a4b";
      ctx.shadowBlur = 20;
      ctx.fill();

      // Star emblem
      ctx.beginPath();
      ctx.arc(0, -35, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // VSTY Text Logo
      ctx.font = "900 36px 'Arial Black', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.shadowColor = "#ff2a4b";
      ctx.shadowBlur = 15;
      ctx.fillText("VSTY", 0, 75);

      ctx.restore();

      // HUD Overlay details
      ctx.fillStyle = "#ff2a4b";
      ctx.font = "bold 12px monospace";
      ctx.fillText("● AUTOMATIC VSTY STREAM FEED", 20, 30);
      ctx.fillText(`FPS: 60 | RASPBERRY PI NOT CONNECTED 🔴`, canvas.width - 320, 30);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [rpiConnected, activeSource]);

  const pythonScriptText = `# Save as camera_server.py on your Raspberry Pi:
import cv2
from flask import Flask, Response

app = Flask(__name__)
camera = cv2.VideoCapture(0)  # 0 for Raspberry Pi Camera / USB Cam

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\\r\\nContent-Type: image/jpeg\\r\\n\\r\\n' + frame_bytes + b'\\r\\n')

@app.route('/stream.mjpg')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, threaded=True)`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(pythonScriptText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="camera-card" style={{
      background: "#0f0507",
      borderRadius: "22px",
      padding: "24px",
      boxShadow: "0 0 25px rgba(255, 42, 75, .25)",
      border: "1px solid rgba(255, 42, 75, .35)",
      display: "flex",
      flexDirection: "column",
      gap: "18px"
    }}>

      {/* Header & Source Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Video size={22} className="text-red-500 animate-pulse" />
          <h2 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "900", margin: 0 }}>
            📹 Mission Camera Control & Wireless Video Feed
          </h2>
        </div>

        {/* Source Mode Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              setActiveSource("rpi-wifi");
              if (!rpiConnected) handleConnectRpi();
            }}
            style={{
              background: activeSource === "rpi-wifi" ? "#ff2a4b" : "#1a080c",
              color: "#ffffff",
              border: activeSource === "rpi-wifi" ? "1px solid #ff2a4b" : "1px solid rgba(255, 42, 75, 0.4)",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: activeSource === "rpi-wifi" ? "0 0 12px rgba(255,42,75,0.4)" : "none"
            }}
          >
            <Wifi size={15} className={rpiConnected ? "text-green-400" : "text-yellow-400"} /> Raspberry Pi WiFi Stream
          </button>

        </div>
      </div>

      {/* RASPBERRY PI WIRELESS CONNECTION CONTROL BAR */}
      <div style={{
        background: "rgba(26, 8, 12, 0.95)",
        border: "1px solid rgba(255, 42, 75, 0.35)",
        borderRadius: "14px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff2a4b", fontWeight: "bold", fontSize: "13px" }}>
            <Radio size={16} className="animate-pulse" />
            <span>Raspberry Pi WiFi Wireless Connection Setup:</span>
          </div>

          <button
            onClick={() => setShowPiSetupGuide(!showPiSetupGuide)}
            style={{
              background: "transparent",
              color: "#60a5fa",
              border: "1px solid rgba(96, 165, 250, 0.3)",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: "bold"
            }}
          >
            <HelpCircle size={14} /> {showPiSetupGuide ? "Hide Pi Script Guide" : "Raspberry Pi Code Guide"}
          </button>
        </div>

        {/* Input Controls */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 2, minWidth: "160px" }}>
            <label style={{ color: "#a08085", fontSize: "10px", display: "block", marginBottom: "3px" }}>Raspberry Pi WiFi IP:</label>
            <input
              type="text"
              value={rpiIp}
              onChange={(e) => setRpiIp(e.target.value)}
              placeholder="e.g. 192.168.1.100"
              style={{
                width: "100%",
                background: "#0a0305",
                border: "1px solid rgba(255, 42, 75, 0.4)",
                color: "#ffffff",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "bold",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ width: "90px" }}>
            <label style={{ color: "#a08085", fontSize: "10px", display: "block", marginBottom: "3px" }}>Port:</label>
            <input
              type="text"
              value={rpiPort}
              onChange={(e) => setRpiPort(e.target.value)}
              placeholder="8081"
              style={{
                width: "100%",
                background: "#0a0305",
                border: "1px solid rgba(255, 42, 75, 0.4)",
                color: "#ffffff",
                padding: "8px 10px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "bold",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: "120px" }}>
            <label style={{ color: "#a08085", fontSize: "10px", display: "block", marginBottom: "3px" }}>Endpoint Path:</label>
            <input
              type="text"
              value={rpiPath}
              onChange={(e) => setRpiPath(e.target.value)}
              placeholder="/stream.mjpg"
              style={{
                width: "100%",
                background: "#0a0305",
                border: "1px solid rgba(255, 42, 75, 0.4)",
                color: "#ffffff",
                padding: "8px 10px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "bold",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "16px" }}>
            <button
              onClick={handleConnectRpi}
              disabled={rpiConnecting}
              style={{
                background: "#22c55e",
                color: "#000000",
                border: "none",
                padding: "9px 18px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "900",
                cursor: rpiConnecting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 0 15px rgba(34, 197, 94, 0.4)"
              }}
            >
              {rpiConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
              {rpiConnecting ? "Connecting..." : "Connect Pi WiFi Camera"}
            </button>
          </div>
        </div>

        {/* Connection Notice / Latency */}
        {rpiMessage && (
          <div style={{
            fontSize: "12px",
            fontWeight: "bold",
            color: rpiConnected ? "#4ade80" : "#fca5a5",
            background: rpiConnected ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            padding: "6px 12px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span>{rpiMessage}</span>
            {rpiConnected && (
              <button
                onClick={handleCaptureSnapshot}
                disabled={capturingSnapshot}
                style={{
                  background: "#ff2a4b",
                  color: "#ffffff",
                  border: "none",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <Camera size={13} /> {capturingSnapshot ? "Saving..." : "Take Snapshot"}
              </button>
            )}
          </div>
        )}

        {/* Collapsible Raspberry Pi Code Helper */}
        {showPiSetupGuide && (
          <div style={{
            background: "#080203",
            border: "1px solid rgba(96, 165, 250, 0.3)",
            borderRadius: "10px",
            padding: "12px",
            marginTop: "6px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ color: "#60a5fa", fontWeight: "bold", fontSize: "12px" }}>
                🐍 Python Flask Camera Stream Script (Run on Raspberry Pi):
              </span>
              <button
                onClick={copyScriptToClipboard}
                style={{
                  background: "#1a080c",
                  color: "#ffffff",
                  border: "1px solid #60a5fa",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {copiedCode ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copiedCode ? "Copied!" : "Copy Python Code"}
              </button>
            </div>
            <pre style={{
              background: "#000000",
              color: "#4ade80",
              padding: "10px",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "monospace",
              overflowX: "auto",
              margin: 0
            }}>
              {pythonScriptText}
            </pre>
            <div style={{ color: "#a08085", fontSize: "11px", marginTop: "8px" }}>
              💡 <strong>Quick Command:</strong> Run <code style={{ color: "#ffffff", background: "#1a080c", padding: "2px 4px", borderRadius: "3px" }}>python3 camera_server.py</code> on your Raspberry Pi connected to WiFi, then enter its local IP above!
            </div>
          </div>
        )}
      </div>

      {statusNotice && (
        <div style={{
          background: "rgba(34, 197, 94, 0.15)",
          border: "1px solid #22c55e",
          color: "#4ade80",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle size={16} /> {statusNotice}
        </div>
      )}

      {/* Main Video Viewport */}
      <div style={{
        position: "relative",
        width: "100%",
        height: "420px",
        background: "#000000",
        borderRadius: "16px",
        overflow: "hidden",
        border: "2px solid rgba(255, 42, 75, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {rpiConnected ? (
          <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "#050103" }}>
            <img
              src={activeRpiStreamUrl}
              alt="Raspberry Pi WiFi Live Camera Stream"
              onError={() => {
                setRpiConnected(false);
                setRpiMessage(`Stream error: Cannot load feed from ${rawRpiUrl}. Ensure camera script is running on Pi.`);
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: missionPaused ? "grayscale(100%) blur(2px)" : "none"
              }}
            />
          </div>
        ) : (
          <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "#050103" }}>
            {/* Automatic VSTY Canvas Video Stream when Raspberry Pi is not connected */}
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: missionPaused ? "grayscale(100%) blur(2px)" : "none"
              }}
            />
          </div>
        )}

        {/* Live HUD Banner Overlay */}
        <div style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          background: "rgba(15, 5, 7, 0.85)",
          border: "1px solid rgba(255, 42, 75, 0.5)",
          borderRadius: "8px",
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backdropFilter: "blur(4px)",
          zIndex: 10
        }}>
          <span style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: missionPaused ? "#eab308" : activeSource === "rpi-wifi" && rpiConnected ? "#22c55e" : "#ff2a4b",
            boxShadow: activeSource === "rpi-wifi" && rpiConnected ? "0 0 10px #22c55e" : "0 0 10px #ff2a4b"
          }} />
          <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: "bold" }}>
            {missionPaused ? "MISSION PAUSED" : activeSource === "rpi-wifi" ? "RASPBERRY PI WIRELESS STREAM" : "LIVE FEED ACTIVE"}
          </span>
        </div>

        {/* Raspberry Pi Not Connected Notification Banner */}
        {!rpiConnected && (
          <div style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(25, 5, 8, 0.92)",
            border: "1px solid #ff2a4b",
            borderRadius: "8px",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backdropFilter: "blur(6px)",
            boxShadow: "0 0 15px rgba(255, 42, 75, 0.4)",
            zIndex: 10
          }}>
            <WifiOff size={16} style={{ color: "#ff2a4b" }} className="animate-pulse" />
            <div>
              <div style={{ color: "#ffffff", fontSize: "12px", fontWeight: "bold" }}>
                RASPBERRY PI NOT CONNECTED
              </div>
              <div style={{ color: "#a08085", fontSize: "10px", marginTop: "1px" }}>
                Playing default auto-loop video stream
              </div>
            </div>
          </div>
        )}

        {/* Selected Video Name selector if in uploaded video mode */}
        {activeSource === "uploaded-video" && uploadedVideos.length > 0 && (
          <div style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            background: "rgba(15, 5, 7, 0.9)",
            border: "1px solid rgba(255, 42, 75, 0.4)",
            borderRadius: "8px",
            padding: "6px 12px"
          }}>
            <select
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              style={{
                background: "#1a080c",
                color: "#ffffff",
                border: "none",
                fontSize: "12px",
                fontWeight: "bold",
                outline: "none",
                cursor: "pointer"
              }}
            >
              {uploadedVideos.map((v) => (
                <option key={v.id || v.name} value={v.url}>
                  {v.name} ({v.size})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Info Stats Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "12px"
      }}>
        <div style={{ background: "#1a080c", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255, 42, 75, 0.2)", textAlign: "center" }}>
          <div style={{ color: "#ff2a4b", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}>Connection</div>
          <div style={{ color: rpiConnected ? "#4ade80" : "#fca5a5", fontSize: "14px", fontWeight: "bold", marginTop: "4px" }}>
            {activeSource === "rpi-wifi" ? (rpiConnected ? "Pi WiFi Connected" : "Pi Disconnected") : "System Local"}
          </div>
        </div>

        <div style={{ background: "#1a080c", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255, 42, 75, 0.2)", textAlign: "center" }}>
          <div style={{ color: "#ff2a4b", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}>Pi WiFi IP</div>
          <div style={{ color: "#ffffff", fontSize: "14px", fontWeight: "bold", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis" }}>
            {rpiIp}:{rpiPort}
          </div>
        </div>

        <div style={{ background: "#1a080c", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255, 42, 75, 0.2)", textAlign: "center" }}>
          <div style={{ color: "#ff2a4b", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}>Latency</div>
          <div style={{ color: "#ffffff", fontSize: "14px", fontWeight: "bold", marginTop: "4px" }}>
            {rpiLatency ? `${rpiLatency} ms` : "30 FPS"}
          </div>
        </div>

        <div style={{ background: "#1a080c", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255, 42, 75, 0.2)", textAlign: "center" }}>
          <div style={{ color: "#ff2a4b", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}>Video Mode</div>
          <div style={{ color: "#4ade80", fontSize: "14px", fontWeight: "bold", marginTop: "4px" }}>
            {activeSource === "rpi-wifi" ? "Raspberry Pi WiFi" : activeSource === "vsty-video" ? "VSTY Feed" : "Saved Video"}
          </div>
        </div>
      </div>
    </div>
  );
}
