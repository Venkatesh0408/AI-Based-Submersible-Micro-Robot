import React, { useEffect, useState } from "react";
import "../styles/AnimatedBackground.css";

export default function AnimatedBackground() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    // Generate 30 bubbles with random properties
    const newBubbles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage
      size: Math.random() * 15 + 5, // 5px to 20px
      duration: Math.random() * 15 + 10, // 10s to 25s
      delay: Math.random() * 10, // 0s to 10s
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="animated-bg-container">
      <div className="water-gradient"></div>
      <div className="light-rays"></div>
      
      {/* Grid scanning effect */}
      <div className="sonar-grid"></div>
      
      {/* Moving bubbles */}
      <div className="bubbles-container">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="bubble"
            style={{
              left: `${bubble.left}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
