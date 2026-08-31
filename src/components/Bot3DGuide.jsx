import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useNavigate, useLocation } from "react-router-dom";

// Sequence of target UI focal points on screen (percentage coordinates [x, y] & auto-navigation path)
const PAGE_TARGET_STEPS = {
    "/main": [
        { x: 50, y: 65, nav: "/login", angle: 90 }, // Points down at Login / Enter button
        { x: 80, y: 15, nav: null, angle: -45 }     // Points at top right controls
    ],
    "/dashboard": [
        { x: 48, y: 12, nav: "/route-planner", angle: -90 }, // Points up at Route Planner tab in header
        { x: 80, y: 55, nav: null, angle: 45 },             // Points at joystick control panel
        { x: 25, y: 40, nav: null, angle: -135 }            // Points at camera feed panel
    ],
    "/route-planner": [
        { x: 55, y: 45, nav: null, angle: 90 },              // Points at map area for adding waypoints
        { x: 82, y: 78, nav: null, angle: 45 },              // Points at Save & Start Mission buttons
        { x: 60, y: 12, nav: "/image-analysis", angle: -90 }  // Points up at AI Image Analysis tab in header
    ],
    "/image-analysis": [
        { x: 45, y: 42, nav: null, angle: 90 },              // Points at Gemini AI upload/scan area
        { x: 72, y: 12, nav: "/history", angle: -90 }        // Points up at History tab in header
    ],
    "/history": [
        { x: 82, y: 22, nav: null, angle: -45 },             // Points at PDF Export button
        { x: 36, y: 12, nav: "/dashboard", angle: -90 }      // Points back to Dashboard tab in header
    ]
};

const DEFAULT_TARGETS = [
    { x: 85, y: 75, nav: null, angle: 0 }
];

export default function Bot3DGuide() {
    const mountRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const [stepIndex, setStepIndex] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    const [soundEnabled] = useState(true);

    // Ref to Three.js internal objects for animation controls
    const spinAnimRef = useRef(0);
    const laserBeamRef = useRef(null);

    const currentPath = location.pathname;
    const targetSteps = PAGE_TARGET_STEPS[currentPath] || DEFAULT_TARGETS;
    const currentTarget = targetSteps[stepIndex % targetSteps.length] || targetSteps[0];

    // Reset step index on route change
    useEffect(() => {
        setStepIndex(0);
    }, [currentPath]);

    // Sci-Fi Sound Synthesizer (Web Audio API)
    const playSound = (type = "thrust") => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === "thrust") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(250, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.25);
                gain.gain.setValueAtTime(0.09, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
                osc.start();
                osc.stop(ctx.currentTime + 0.28);
            } else if (type === "beam") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(900, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.06, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                osc.start();
                osc.stop(ctx.currentTime + 0.15);
            }
        } catch (e) {
            // Audio context restriction
        }
    };

    // Click Bot -> Bot performs spin, ignites thrusters, swims to next step/element or navigates
    const handleBotClick = () => {
        playSound("thrust");
        spinAnimRef.current = Math.PI * 4; // 2 full spins
        setIsMoving(true);

        const nextIdx = (stepIndex + 1) % targetSteps.length;
        setStepIndex(nextIdx);

        // If current step target has a navigation path associated, navigate after swim delay
        const target = targetSteps[nextIdx];
        if (target && target.nav) {
            setTimeout(() => {
                navigate(target.nav);
            }, 600);
        }

        setTimeout(() => setIsMoving(false), 800);
    };

    // Three.js 3D Submersible Robot Scene Setup
    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth || 180;
        const height = container.clientHeight || 180;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 7.5);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
        scene.add(ambientLight);

        const redSpot = new THREE.PointLight(0xff2a4b, 4, 25);
        redSpot.position.set(3, 4, 5);
        scene.add(redSpot);

        const cyanSpot = new THREE.PointLight(0x00d9ff, 4, 25);
        cyanSpot.position.set(-3, -2, 5);
        scene.add(cyanSpot);

        // Main 3D Robot Container Group
        const robotGroup = new THREE.Group();
        scene.add(robotGroup);

        // 1. SUBMARINE HULL
        const hullGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.2, 32);
        const hullMat = new THREE.MeshStandardMaterial({
            color: 0x120609,
            roughness: 0.2,
            metalness: 0.9,
            emissive: 0x1a0508,
            emissiveIntensity: 0.4
        });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.rotation.z = Math.PI / 2;
        robotGroup.add(hull);

        const sphereGeo = new THREE.SphereGeometry(0.85, 32, 32);
        const nose = new THREE.Mesh(sphereGeo, hullMat);
        nose.position.x = 1.1;
        robotGroup.add(nose);

        const tail = new THREE.Mesh(sphereGeo, hullMat);
        tail.position.x = -1.1;
        robotGroup.add(tail);

        // 2. FRONT DOME & CAMERA OPTIC
        const domeGeo = new THREE.SphereGeometry(0.68, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshPhysicalMaterial({
            color: 0x00d9ff,
            transmission: 0.9,
            transparent: true,
            roughness: 0.1,
            ior: 1.5
        });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.rotation.z = -Math.PI / 2;
        dome.position.x = 1.35;
        robotGroup.add(dome);

        // Glowing Red Lens Eye
        const eyeLensGeo = new THREE.SphereGeometry(0.38, 32, 32);
        const eyeLensMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
        const eyeLens = new THREE.Mesh(eyeLensGeo, eyeLensMat);
        eyeLens.position.x = 1.35;
        robotGroup.add(eyeLens);

        // 3. 3D GLOWING LASER POINTING CONE (Physical Sign/Pointer)
        const beamGeo = new THREE.ConeGeometry(0.5, 3.2, 32, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0xff2a4b,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const laserBeam = new THREE.Mesh(beamGeo, beamMat);
        laserBeam.rotation.z = -Math.PI / 2;
        laserBeam.position.set(2.8, 0, 0);
        robotGroup.add(laserBeam);
        laserBeamRef.current = laserBeam;

        // 4. DUAL SIDE THRUSTER PODS
        const createThrusterPod = (zSign) => {
            const podGroup = new THREE.Group();
            podGroup.position.set(-0.2, 0, zSign * 1.35);

            const shroudGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.9, 24);
            const shroudMat = new THREE.MeshStandardMaterial({ color: 0x24090f, metalness: 0.8, roughness: 0.3 });
            const shroud = new THREE.Mesh(shroudGeo, shroudMat);
            shroud.rotation.x = Math.PI / 2;
            podGroup.add(shroud);

            const ringGeo = new THREE.TorusGeometry(0.45, 0.04, 16, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d9ff });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            podGroup.add(ring);

            const propGroup = new THREE.Group();
            const bladeGeo = new THREE.BoxGeometry(0.72, 0.08, 0.03);
            const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 });
            const b1 = new THREE.Mesh(bladeGeo, bladeMat);
            const b2 = new THREE.Mesh(bladeGeo, bladeMat);
            b2.rotation.z = Math.PI / 2;
            propGroup.add(b1);
            propGroup.add(b2);
            podGroup.add(propGroup);

            // Plasma Thruster Tail Flame (3D Cone)
            const flameGeo = new THREE.ConeGeometry(0.35, 1.2, 16);
            const flameMat = new THREE.MeshBasicMaterial({ color: 0x00d9ff, transparent: true, opacity: 0.8 });
            const flame = new THREE.Mesh(flameGeo, flameMat);
            flame.rotation.z = Math.PI / 2;
            flame.position.x = -1.0;
            podGroup.add(flame);

            return { podGroup, propGroup, flame };
        };

        const leftThruster = createThrusterPod(1);
        const rightThruster = createThrusterPod(-1);
        robotGroup.add(leftThruster.podGroup);
        robotGroup.add(rightThruster.podGroup);

        // 5. SONAR RADAR DISK
        const scannerDiskGeo = new THREE.ConeGeometry(0.35, 0.28, 16);
        const scannerDiskMat = new THREE.MeshBasicMaterial({ color: 0x00d9ff, wireframe: true });
        const scannerDisk = new THREE.Mesh(scannerDiskGeo, scannerDiskMat);
        scannerDisk.position.set(0.2, 1.3, 0);
        robotGroup.add(scannerDisk);

        let clock = new THREE.Clock();
        let animationFrameId;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Hover floating levitation
            robotGroup.position.y = Math.sin(elapsedTime * 3) * 0.28;
            robotGroup.position.x = Math.cos(elapsedTime * 2) * 0.15;

            // 360 Spin trick
            if (spinAnimRef.current > 0) {
                robotGroup.rotation.x += 0.3;
                spinAnimRef.current -= 0.3;
            } else {
                robotGroup.rotation.x = THREE.MathUtils.lerp(robotGroup.rotation.x, 0, 0.1);
            }

            // Sway pitch/roll
            robotGroup.rotation.z = Math.sin(elapsedTime * 2.5) * 0.1;
            robotGroup.rotation.y = Math.sin(elapsedTime * 1.5) * 0.2;

            // Spin propellers fast
            leftThruster.propGroup.rotation.z += 0.6;
            rightThruster.propGroup.rotation.z += 0.6;

            // Flame pulsing opacity
            const flameScale = 0.8 + Math.sin(elapsedTime * 20) * 0.3;
            leftThruster.flame.scale.set(flameScale, flameScale, flameScale);
            rightThruster.flame.scale.set(flameScale, flameScale, flameScale);

            // Laser beam pulse & color strobe
            if (laserBeamRef.current) {
                laserBeamRef.current.material.opacity = 0.5 + Math.sin(elapsedTime * 12) * 0.3;
            }

            scannerDisk.rotation.y += 0.08;
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div
            onClick={handleBotClick}
            style={{
                position: "fixed",
                left: `${currentTarget.x}%`,
                top: `${currentTarget.y}%`,
                transform: `translate(-50%, -50%) rotate(${currentTarget.angle || 0}deg)`,
                zIndex: 9999,
                transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                cursor: "pointer",
                pointerEvents: "auto"
            }}
            className="select-none group"
            title="Click Bot to guide to next step!"
        >
            {/* Glowing Target Beacon Ring under Bot (Points to step element) */}
            <div className="absolute inset-0 -m-6 rounded-full border-2 border-red-500/80 animate-ping pointer-events-none"></div>
            <div className="absolute inset-0 -m-10 rounded-full border border-cyan-400/50 animate-pulse pointer-events-none"></div>

            {/* Glowing Neon Arrow / Pointer Reticle */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <div className="w-4 h-4 border-b-2 border-r-2 border-red-500 transform rotate-45 animate-bounce"></div>
            </div>

            {/* 3D Robot Canvas */}
            <div
                style={{
                    width: "170px",
                    height: "170px",
                    filter: isMoving
                        ? "drop-shadow(0 0 35px #00d9ff)"
                        : "drop-shadow(0 0 25px rgba(255, 42, 75, 0.7))"
                }}
                className="relative transition-all duration-300 transform group-hover:scale-110"
            >
                <div ref={mountRef} className="w-full h-full" />
            </div>
        </div>
    );
}
