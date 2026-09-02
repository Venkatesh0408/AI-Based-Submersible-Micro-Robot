import { Users, Bot, GraduationCap, Library } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Main() {
    const navigate = useNavigate();

    const [memberPhotos, setMemberPhotos] = useState({});

    useEffect(() => {
        const storedPhotos = localStorage.getItem('teamPhotos');
        if (storedPhotos) {
            try {
                setMemberPhotos(JSON.parse(storedPhotos));
            } catch (e) {
                console.error("Failed to load photos", e);
            }
        }
    }, []);

    const handlePhotoUpload = (e, usn) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPhotos = { ...memberPhotos, [usn]: reader.result };
                setMemberPhotos(newPhotos);
                try {
                    localStorage.setItem('teamPhotos', JSON.stringify(newPhotos));
                } catch (e) {
                    console.warn('Could not save team photos to localStorage', e);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const [guidePhoto, setGuidePhoto] = useState(null);

    useEffect(() => {
        const storedGuide = localStorage.getItem('guidePhoto');
        if (storedGuide) {
            setGuidePhoto(storedGuide);
        }
    }, []);

    const handleGuideUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGuidePhoto(reader.result);
                try {
                    localStorage.setItem('guidePhoto', reader.result);
                } catch (e) {
                    console.warn('Could not save guide photo to localStorage', e);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const containerRef = useRef(null);

    useEffect(() => {
        // Focus the container on mount so it can immediately catch keyboard events
        if (containerRef.current) {
            containerRef.current.focus();
        }

        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                navigate('/login');
            }
        };

        // Attach to document to catch events more reliably
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [navigate]);

    const teamMates = [
        {
            name: "Venkatesh C L",
            usn: "1RR24RA402",
            roles: ["Team Leader", "Project Management", "Software Development", "Circuit Design"],
            isLeader: true
        },
        {
            name: "Soujanya M",
            usn: "1RR23RA035",
            roles: ["System Integration", "Hardware Integration"],
            isLeader: false
        },
        {
            name: "Y Ganashree",
            usn: "1RR23RA041",
            roles: ["Documentation", "Testing & Validation"],
            isLeader: false
        },
        {
            name: "Thanmay R",
            usn: "1RR23RA036",
            roles: ["Mechanical Design", "Assembly"],
            isLeader: false
        }
    ];

    const panelStyle = {
        background: "linear-gradient(145deg, #1a080c, #0a0304)",
        border: "1px solid rgba(255, 42, 75, 0.35)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(16px)",
        borderRadius: "1rem",
    };

    return (
        <div 
            ref={containerRef}
            tabIndex={0}
            className="min-h-screen w-full flex flex-col items-center justify-center overflow-auto outline-none p-4 sm:p-6 md:p-8" 
            style={{ background: 'transparent' }}
        >
            
            <div className="w-full max-w-[1400px] flex flex-col gap-6">
                
                {/* Top Banner (College Info) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 p-6 sm:p-8 relative overflow-hidden text-center sm:text-left" style={panelStyle}>
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,42,75,0.2), transparent)' }}></div>
                    
                    <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-full flex items-center justify-center p-1 sm:p-2 z-10 relative shadow-[0_0_30px_rgba(255,42,75,0.4)] border-2 border-red-500/70 shrink-0 overflow-hidden">
                        <img 
                            src="/rrce-logo.jpg" 
                            alt="College Logo" 
                            className="w-full h-full object-contain rounded-full" 
                            style={{ imageRendering: 'high-quality' }}
                        />
                    </div>
                    
                    <div className="text-center sm:text-left flex flex-col items-center sm:items-start justify-center z-10">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide uppercase drop-shadow-lg mb-2 text-center sm:text-left break-words">
                            RajaRajeswari College of Engineering
                        </h2>
                        <h3 className="text-red-500 text-xs sm:text-sm md:text-base font-bold tracking-[0.15em] uppercase mb-1.5">
                            Department of Robotics and Automation Engineering
                        </h3>
                        <p className="text-gray-400 text-[10px] sm:text-xs tracking-widest uppercase mb-1">
                            Affiliated to Visvesvaraya Technological University, Belagavi
                        </p>
                        <p className="text-gray-400 text-[10px] sm:text-xs tracking-widest uppercase">
                            Bengaluru – 560074
                        </p>
                    </div>
                </div>

                {/* Main Content Split */}
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Left: Project Hero & Guide */}
                    <div className="w-full lg:w-5/12 flex flex-col gap-6">
                        
                        {/* Project Hero Panel */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden" style={{...panelStyle, background: 'radial-gradient(circle at center, rgba(128,0,20,0.35) 0%, rgba(15,5,7,0.9) 100%)'}}>
                            <div className="absolute inset-0 flex justify-center items-center opacity-[0.04] pointer-events-none">
                                <Bot size={280} />
                            </div>
                            
                            <span className="z-10 px-4 py-1.5 rounded-full border border-red-500/50 bg-red-950/50 text-red-400 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-6">
                                Major Project Phase 2
                            </span>
                            
                            <h1 className="z-10 text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-red-200 to-red-600 tracking-tighter mb-4" style={{ filter: 'drop-shadow(0 0 25px rgba(255,42,75,0.4))', fontFamily: '"Orbitron", sans-serif' }}>
                                VSTY
                            </h1>
                            
                            <div className="z-10 w-16 h-[2px] bg-red-500/50 mb-6"></div>
                            
                            <h2 className="z-10 text-lg lg:text-xl font-bold text-white max-w-sm leading-relaxed mb-3 tracking-wide">
                                Autonomous Submersible Micro Robot for Water Inspection & Monitoring
                            </h2>
                            
                            <h3 className="z-10 text-sm font-semibold text-red-400 uppercase tracking-widest max-w-sm">
                                AI-Based Underwater Inspection System
                            </h3>
                        </div>

                        {/* Guide Panel */}
                        <div className="p-6 flex items-center justify-between gap-4" style={panelStyle}>
                            <div className="flex items-center gap-5">
                                <label className="w-16 h-16 bg-red-950/40 rounded-full flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(255,42,75,0.2)] shrink-0 cursor-pointer overflow-hidden group relative">
                                    {guidePhoto ? (
                                        <img src={guidePhoto} alt="Guide" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <GraduationCap className="text-red-400 group-hover:opacity-0 transition-opacity" size={32} />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-full">
                                        <span className="text-[9px] text-white font-bold uppercase tracking-widest text-center">Change</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                                        onChange={handleGuideUpload} 
                                    />
                                </label>
                                <div className="flex flex-col">
                                    <span className="text-xs text-red-400 font-extrabold uppercase tracking-widest mb-1">Guided By</span>
                                    <h4 className="text-xl md:text-2xl font-black text-white tracking-wide mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Dr. Vishwanath K C</h4>
                                    <p className="text-xs text-red-200/90 font-bold uppercase tracking-wider mb-0.5">Professor</p>
                                    <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">Dept. of Robotics & Automation Engineering</p>
                                </div>
                            </div>
                            
                            <div className="text-right border-l border-red-500/20 pl-5 flex flex-col justify-center h-full shrink-0">
                                <p className="text-red-500 font-bold tracking-[0.2em] uppercase text-[10px] mb-1">Academic Year</p>
                                <p className="text-white text-xl md:text-2xl font-black tracking-widest" style={{ fontFamily: '"Orbitron", sans-serif' }}>2026–27</p>
                            </div>
                        </div>
                        
                    </div>

                    {/* Right: Team Grid */}
                    <div className="w-full lg:w-7/12 flex flex-col" style={{...panelStyle, padding: '24px'}}>
                        
                        <div className="flex items-center justify-center gap-4 mb-6 pb-4 border-b border-red-500/20">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-red-500/50"></div>
                            <h2 className="text-xl md:text-2xl font-black text-white text-center tracking-[0.25em] uppercase" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                                Project Team
                            </h2>
                            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-red-500/50"></div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-full">
                            {teamMates.map((member, idx) => (
                                <div key={idx} className="flex flex-col p-5 rounded-xl transition-all border border-red-500/20 shadow-inner h-full justify-between" style={{ background: 'rgba(26, 8, 12, 0.6)' }}>
                                    
                                    {/* Top Area: Icon + Name */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <label className="w-12 h-12 rounded-full border border-red-500/30 shrink-0 flex items-center justify-center bg-black/60 shadow-[0_0_10px_rgba(255,42,75,0.2)] cursor-pointer overflow-hidden group relative">
                                            {memberPhotos[member.usn] ? (
                                                <>
                                                    <img src={memberPhotos[member.usn]} alt={member.name} className="w-full h-full object-cover rounded-full" />
                                                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center rounded-full">
                                                        <span className="text-[8px] text-white font-bold uppercase tracking-widest text-center">Change</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full hover:bg-red-900/30 transition-colors">
                                                    <Users className="text-red-400 w-6 h-6" />
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                                                onChange={(e) => handlePhotoUpload(e, member.usn)} 
                                            />
                                        </label>
                                        
                                        <div className="flex flex-col">
                                            <h3 className="text-white text-lg font-bold flex items-center gap-2 tracking-wide">
                                                {member.name}
                                                {member.isLeader && <span className="text-[8px] bg-red-900/40 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded uppercase tracking-widest">Leader</span>}
                                            </h3>
                                        </div>
                                    </div>
                                    
                                    {/* Roles / Skills List */}
                                    <div className="flex-1 flex flex-col justify-center gap-2 mb-4 pl-1">
                                        {member.roles.map((role, rIdx) => (
                                            <div key={rIdx} className="flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-red-500/70"></div>
                                                <span className="text-gray-300 text-sm font-medium tracking-wide">{role}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Bottom Footer: USN */}
                                    <div className="bg-black/80 rounded-lg p-3 border border-red-500/20 flex items-center justify-between">
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">USN</span>
                                        <span className="text-red-400 font-bold text-sm tracking-widest" style={{ fontFamily: '"Orbitron", sans-serif' }}>{member.usn}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                    </div>

                </div>
                
                <div className="flex justify-center items-center text-center w-full mt-6 mb-4 cursor-pointer" onClick={() => navigate('/login')}>
                    <span className="text-red-400 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(255,42,75,0.7)] bg-red-950/80 px-8 py-4 rounded-full border border-red-500/60 hover:bg-red-800/60 hover:text-white transition-all hover:scale-105 active:scale-95 animate-levitate mx-auto flex items-center justify-center text-center shadow-[0_0_25px_rgba(255,42,75,0.4)]">
                        Press [ENTER] to initialise mission control
                    </span>
                </div>
            </div>
        </div>
    );
}
