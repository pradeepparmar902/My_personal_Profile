import React, { useState, useRef } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function TiltCard({ children, className = "", id }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative coordinates within the card (-0.5 to +0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;
    
    // Convert to tilt angles (max 12 degrees)
    const tiltX = -relativeY * 12;
    const tiltY = relativeX * 12;
    
    setCoords({ x: tiltY, y: tiltX });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  return (
    <div
      id={id}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-2xl transition-transform duration-200 ease-out overflow-hidden ${className}`}
      style={{
        transform: isHovered 
          ? `perspective(1000px) rotateX(${coords.y}deg) rotateY(${coords.x}deg) scale3d(1.02, 1.02, 1.02)` 
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      }}
    >
      {/* Sleek reflection radial highlight effect that follows the cursor */}
      {isHovered && (
        <div 
          className="absolute inset-0 -z-10 bg-radial from-white/10 to-transparent pointer-events-none transition-opacity duration-300"
          style={{
            transform: `translate3d(${coords.x * 3}px, ${coords.y * 3}px, 0)`
          }}
        />
      )}
      {children}
    </div>
  );
}
