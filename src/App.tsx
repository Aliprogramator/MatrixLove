import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Heart, Zap, Palette, Type, Gauge } from 'lucide-react';

interface Drop {
  x: number;
  y: number;
  speed: number;
}

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  maxLife: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [speed, setSpeed] = useState(10);
  const [color, setColor] = useState('#ff69b4');
  const [message, setMessage] = useState('Te Amo ❤️');
  const [isAnimating, setIsAnimating] = useState(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const dropsRef = useRef<Drop[]>([]);
  const lastTimeRef = useRef(0);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 18;
    const columns = Math.floor(canvas.width / fontSize);
    
    dropsRef.current = Array.from({ length: columns }, (_, i) => ({
      x: i * fontSize,
      y: Math.random() * canvas.height,
      speed: 0.5 + Math.random() * 1.5
    }));
  }, []);

  const drawMatrix = useCallback((ctx: CanvasRenderingContext2D, currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties for crisp rendering
    ctx.fillStyle = color;
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Enable text smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Add glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    dropsRef.current.forEach((drop, i) => {
      // Draw the message with better positioning
      const text = message || 'Love';
      ctx.fillText(text, drop.x + 9, drop.y);

      // Update drop position
      drop.y += drop.speed * (speed / 5);

      // Reset drop if it goes off screen or randomly
      if (drop.y > canvas.height + 50 || Math.random() > 0.995) {
        drop.y = -50;
        drop.speed = 0.5 + Math.random() * 1.5;
      }
    });

    // Draw particles with better rendering
    particles.forEach((particle, index) => {
      const alpha = Math.floor(particle.life / particle.maxLife * 255).toString(16).padStart(2, '0');
      ctx.fillStyle = `${color}${alpha}`;
      ctx.fillText(message.charAt(index % message.length), particle.x, particle.y);
      
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.life--;
      
      if (particle.life <= 0) {
        setParticles(prev => prev.filter((_, i) => i !== index));
      }
    });

    ctx.shadowBlur = 0;
  }, [color, message, speed, particles]);

  const animate = useCallback((currentTime: number) => {
    if (currentTime - lastTimeRef.current >= 1000 / Math.max(speed, 1)) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      
      if (ctx) {
        drawMatrix(ctx, currentTime);
        lastTimeRef.current = currentTime;
      }
    }
    
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [drawMatrix, speed, isAnimating]);

  const createExplosion = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 2 + Math.random() * 4;
      
      newParticles.push({
        x,
        y,
        dx: Math.cos(angle) * velocity,
        dy: Math.sin(angle) * velocity,
        life: 80,
        maxLife: 80
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      createExplosion(x, y);
    }
  }, [createExplosion]);

  useEffect(() => {
    initializeCanvas();
    
    const handleResize = () => {
      initializeCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, isAnimating]);

  const colorPresets = [
    '#ff69b4', '#00ff41', '#0099ff', '#ff6b35', '#a855f7', '#f59e0b',
    '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#06b6d4',
    '#84cc16', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#22c55e'
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 cursor-crosshair"
        style={{ display: 'block' }}
      />
      
      {/* Control Panel */}
      <div className="absolute top-6 left-6 backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-pink-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Matrix Love
          </h1>
        </div>
        
        <div className="space-y-5">
          {/* Speed Control */}
          <div className="group">
            <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
              <Gauge className="w-4 h-4" />
              Velocidad: {speed}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, ${color} 0%, ${color} ${(speed / 100) * 100}%, rgba(255,255,255,0.1) ${(speed / 100) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
          
          {/* Color Picker */}
          <div className="group">
            <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
              <Palette className="w-4 h-4" />
              Color
            </label>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer overflow-hidden"
              />
              <span className="text-white/60 text-sm font-mono">{color.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {colorPresets.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    color === presetColor ? 'border-white/60' : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
          </div>
          
          {/* Text Input */}
          <div className="group">
            <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
              <Type className="w-4 h-4" />
              Mensaje
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200"
            />
          </div>
          
          {/* Animation Toggle */}
          <div className="group">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 w-full justify-center ${
                isAnimating
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Zap className="w-4 h-4" />
              {isAnimating ? 'Pausar' : 'Reproducir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;