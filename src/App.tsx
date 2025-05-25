import { useState, useEffect } from "react";

// Add ExplosionArt component here
const ExplosionArt = ({ baseAsteroidSize }: { baseAsteroidSize: number }) => {
  const NUM_PIXELS_PER_SIDE = 8;
  const explosionScaleFactor = 1.75; // Determines explosion size relative to asteroid
  const targetExplosionCanvasSize = baseAsteroidSize * explosionScaleFactor;
  
  // Each "pixel" of our art will be an integer-sized div
  const pixelArtUnitSize = Math.max(1, Math.floor(targetExplosionCanvasSize / NUM_PIXELS_PER_SIDE));
  
  // The actual rendered size of the explosion will be based on the sum of our art pixels
  const actualExplosionRenderSize = NUM_PIXELS_PER_SIDE * pixelArtUnitSize;

  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, 100); // Start fade-out after 100ms

    return () => clearTimeout(fadeOutTimer);
  }, []);

  // Pattern: 0: transparent, 1: white, 2: yellow, 3: orange, 4: red
  const pattern = [
    [0,0,0,4,4,0,0,0],
    [0,0,4,3,3,4,0,0],
    [0,4,3,2,2,3,4,0],
    [4,3,2,1,1,2,3,4], // Central, brightest part
    [4,3,2,1,1,2,3,4], // Symmetric
    [0,4,3,2,2,3,4,0],
    [0,0,4,3,3,4,0,0],
    [0,0,0,4,4,0,0,0],
  ];

  const colorMap: { [key: number]: string | undefined } = {
    0: undefined,       // Transparent
    1: '#FFFFFF',       // White
    2: '#FFFF00',       // Yellow
    3: '#FFA500',       // Orange
    4: '#FF0000',       // Red
  };

  return (
    <div style={{
      width: actualExplosionRenderSize,
      height: actualExplosionRenderSize,
      display: 'grid',
      gridTemplateColumns: `repeat(${NUM_PIXELS_PER_SIDE}, ${pixelArtUnitSize}px)`,
      gridTemplateRows: `repeat(${NUM_PIXELS_PER_SIDE}, ${pixelArtUnitSize}px)`,
      imageRendering: 'pixelated', 
      opacity: opacity, // Apply opacity state
      transition: 'opacity 0.4s ease-out', // Smooth transition for fade-out (400ms)
    }}>
      {pattern.flat().map((cellColorId, index) => {
        const color = colorMap[cellColorId];
        // Render a div for each cell; transparent if color is not defined
        return (
          <div
            key={index}
            style={{
              width: pixelArtUnitSize,
              height: pixelArtUnitSize,
              backgroundColor: color, // Undefined backgroundColor is transparent
            }}
          />
        );
      })}
    </div>
  );
};

function App() {
  const [stars, setStars] = useState<
    Array<{
      id: number;
      left: number;
      top: number;
      size: string;
      delay: number;
    }>
  >([]);
  const [asteroids, setAsteroids] = useState<
    Array<{
      id: number;
      delay: number;
      size: number;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      isExploding?: boolean;
      currentX?: number;
      currentY?: number;
      rotation?: number;
      startTime?: number;
    }>
  >([]);

  useEffect(() => {
    // Generate stars once on mount
    const generatedStars = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: ["small", "medium", "large"][Math.floor(Math.random() * 3)],
      delay: Math.random() * 3,
    }));
    setStars(generatedStars);

    // Generate asteroids once on mount with proper spacing
    const generatedAsteroids = Array.from({ length: 8 }, (_, i) => {
      let startX, startY, endX, endY;
      const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left

      if (side === 0) { // Coming from top
        startX = Math.random() * 100;
        startY = -10; // Start above screen
        endX = Math.random() * 100;
        endY = 110; // End below screen
      } else if (side === 1) { // Coming from right
        startX = 110; // Start right of screen
        startY = Math.random() * 100;
        endX = -10; // End left of screen
        endY = Math.random() * 100;
      } else if (side === 2) { // Coming from bottom
        startX = Math.random() * 100;
        startY = 110; // Start below screen
        endX = Math.random() * 100;
        endY = -10; // End above screen
      } else { // Coming from left (side === 3)
        startX = -10; // Start left of screen
        startY = Math.random() * 100;
        endX = 110; // End right of screen
        endY = Math.random() * 100;
      }

      return {
        id: i,
        delay: i * 3 + 1, // Start after 1 second, space 3 seconds apart
        size: Math.random() * 15 + 25, // Slightly larger and more consistent
        startX,
        startY,
        endX,
        endY,
        isExploding: false,
        currentX: startX,
        currentY: startY,
        rotation: 0,
        startTime: Date.now() + (i * 3 + 1) * 1000,
      };
    });
    setAsteroids(generatedAsteroids);
  }, []);

  // Animation and collision detection loop
  useEffect(() => {
    let animationFrameId: number;
    const ASTEROID_ANIMATION_DURATION = 20000; // 20 seconds in milliseconds

    const updateAsteroids = () => {
      const now = Date.now();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      setAsteroids((prevAsteroids) => {
        const updatedAsteroids = prevAsteroids.map((asteroid) => {
          if (asteroid.isExploding || !asteroid.startTime || now < asteroid.startTime) {
            return asteroid;
          }

          const timeElapsed = now - asteroid.startTime;
          let progress = timeElapsed / ASTEROID_ANIMATION_DURATION;

          if (progress >= 1) {
            // Reset asteroid to start a new path or remove (for now, reset)
            // To make it disappear and reappear, we could generate new start/end points
            // and a new startTime in the future. For simplicity, let's just reset progress for continuous looping.
             // This means we need to update startTime to reflect the new loop.
            const newStartTime = asteroid.startTime + ASTEROID_ANIMATION_DURATION * Math.floor(progress);
            const newTimeElapsed = now - newStartTime;
            progress = newTimeElapsed / ASTEROID_ANIMATION_DURATION;

            return {
              ...asteroid,
              currentX: asteroid.startX,
              currentY: asteroid.startY,
              rotation: 0,
              startTime: newStartTime, 
            };

          }

          const currentX = asteroid.startX + (asteroid.endX - asteroid.startX) * progress;
          const currentY = asteroid.startY + (asteroid.endY - asteroid.startY) * progress;
          const rotation = 360 * progress; // Simple rotation, can be improved

          return {
            ...asteroid,
            currentX,
            currentY,
            rotation,
          };
        });

        // Collision detection
        const newAsteroidsWithCollisions = [...updatedAsteroids];
        for (let i = 0; i < newAsteroidsWithCollisions.length; i++) {
          const a1 = newAsteroidsWithCollisions[i];
          if (a1.isExploding || !a1.startTime || now < a1.startTime || a1.currentX === undefined || a1.currentY === undefined) continue;

          // Convert a1 position from vw/vh to pixels
          const a1PixelX = (a1.currentX / 100) * viewportWidth;
          const a1PixelY = (a1.currentY / 100) * viewportHeight;
          const a1Radius = a1.size / 2; // a1.size is already in pixels

          for (let j = i + 1; j < newAsteroidsWithCollisions.length; j++) {
            const a2 = newAsteroidsWithCollisions[j];
            if (a2.isExploding || !a2.startTime || now < a2.startTime || a2.currentX === undefined || a2.currentY === undefined) continue;

            // Convert a2 position from vw/vh to pixels
            const a2PixelX = (a2.currentX / 100) * viewportWidth;
            const a2PixelY = (a2.currentY / 100) * viewportHeight;
            const a2Radius = a2.size / 2; // a2.size is already in pixels

            const distanceX = a1PixelX - a2PixelX;
            const distanceY = a1PixelY - a2PixelY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < a1Radius + a2Radius) {
              // Collision detected
              if (newAsteroidsWithCollisions[i]) newAsteroidsWithCollisions[i].isExploding = true;
              if (newAsteroidsWithCollisions[j]) newAsteroidsWithCollisions[j].isExploding = true;
            }
          }
        }
        return newAsteroidsWithCollisions;
      });

      animationFrameId = requestAnimationFrame(updateAsteroids);
    };

    animationFrameId = requestAnimationFrame(updateAsteroids);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  // New useEffect to remove exploded asteroids
  useEffect(() => {
    if (asteroids.some(a => a.isExploding)) {
      const timer = setTimeout(() => {
        setAsteroids((prevAsteroids) =>
          prevAsteroids.filter((asteroid) => !asteroid.isExploding)
        );
      }, 500); // Remove after 0.5s (explosion animation duration)
      return () => clearTimeout(timer);
    }
  }, [asteroids]);

  const SpaceBackground = () => {
    return (
      <div className="space-background">
        <div className="stars">
          {stars.map((star) => (
            <div
              key={star.id}
              className={`star ${star.size}`}
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const PixelIcon = ({ type }: { type: string }) => {
    const renderIcon = () => {
      switch (type) {
        case "instagram":
          return (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              className="pixelated"
            >
              {/* <!-- Outer Camera Shape -->  */}
              <rect x="0" y="0" width="64" height="64" fill="currentColor" />

              {/* <!-- Lens (Outer Ring) --> */}
              <rect x="20" y="20" width="24" height="24" fill="#000000" />
              {/* <!-- Lens (Inner Circle) --> */}
              <rect x="26" y="26" width="12" height="12" fill="currentColor" />

              {/* <!-- Viewfinder dot (Top-right corner) --> */}
              <rect x="44" y="12" width="8" height="8" fill="#000000" />
            </svg>
          );
        case "linkedin":
          return (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              className="pixelated"
            >
              {/* <!-- Background --> */}
              <rect x="0" y="0" width="64" height="64" fill="currentColor" />

              {/* <!-- 'i' --> */}
              <rect x="16" y="20" width="8" height="8" fill="#000000" />
              <rect x="16" y="32" width="8" height="20" fill="#000000" />

              {/* <!-- 'n' --> */}
              <rect x="28" y="20" width="8" height="32" fill="#000000" />
              <rect x="36" y="20" width="8" height="8" fill="#000000" /> 
              <rect x="44" y="20" width="8" height="32" fill="#000000" />
            </svg>
          );
        case "github":
          return (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              className="pixelated"
            >
              {/* Background for the Octocat shape */}
              <rect x="0" y="0" width="64" height="64" fill="#000000" />

              {/* Octocat Face/Head */}
              <rect x="20" y="16" width="24" height="24" fill="currentColor" />
              <rect x="16" y="20" width="32" height="16" fill="currentColor" />
              
              {/* Ears */}
              <rect x="16" y="12" width="8" height="8" fill="currentColor" />
              <rect x="40" y="12" width="8" height="8" fill="currentColor" />

              {/* Eyes */}
              <rect x="24" y="24" width="4" height="8" fill="#000000" />
              <rect x="36" y="24" width="4" height="8" fill="#000000" />

              {/* Arm */}
              <rect x="12" y="40" width="16" height="8" fill="currentColor" /> 
              <rect x="20" y="32" width="8" height="8" fill="currentColor" />
            </svg>
          );
        case "email":
          return (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              className="pixelated"
            >
              {/* Envelope Body (Pink) */}
              <rect x="8" y="18" width="48" height="28" fill="currentColor" />

              {/* White Letter Part */}
              <rect x="12" y="22" width="40" height="8" fill="currentColor" />

              {/* V-Flap (Black) */}
              {/* Top Line of V-Flap */}
              <rect x="12" y="22" width="40" height="2" fill="#000000" />

              {/* Left Diagonal Components */}
              <rect x="12" y="24" width="4" height="10" fill="#000000" /> {/* Outer part */}
              <rect x="16" y="28" width="4" height="6" fill="#000000" />  {/* Middle part */}
              <rect x="20" y="32" width="4" height="2" fill="#000000" />  {/* Inner part */}

              {/* Right Diagonal Components (Symmetric) */}
              <rect x="48" y="24" width="4" height="10" fill="#000000" /> {/* Outer part */}
              <rect x="44" y="28" width="4" height="6" fill="#000000" />  {/* Middle part */}
              <rect x="40" y="32" width="4" height="2" fill="#000000" />  {/* Inner part */}

              {/* Bottom Tip of V-Flap */}
              <rect x="24" y="34" width="16" height="2" fill="#000000" />
            </svg>
          );
        case "resume":
          return (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              className="pixelated"
            >
              {/* Document background */}
              <rect x="12" y="8" width="40" height="48" fill="currentColor" />
              <rect x="16" y="12" width="32" height="40" fill="#000000" />
              {/* Document corner fold */}
              <rect x="44" y="8" width="8" height="8" fill="#000000" />
              <rect x="44" y="12" width="4" height="4" fill="currentColor" />
              {/* Text lines */}
              <rect x="20" y="16" width="24" height="4" fill="currentColor" />
              <rect x="20" y="24" width="18" height="2" fill="currentColor" />
              <rect x="20" y="28" width="24" height="2" fill="currentColor" />
              <rect x="20" y="32" width="22" height="2" fill="currentColor" />
              <rect x="20" y="36" width="16" height="2" fill="currentColor" />
              <rect x="20" y="40" width="24" height="2" fill="currentColor" />
              <rect x="20" y="44" width="18" height="2" fill="currentColor" />
            </svg>
          );
        default:
          return null;
      }
    };

    return renderIcon();
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Press_Start_2P'] overflow-x-hidden relative">
      <SpaceBackground />

      {/* Render Asteroids here, outside of SpaceBackground but within the main div */}
      {asteroids.map((asteroid) => (
        <div
          key={asteroid.id}
          className={`asteroid ${asteroid.isExploding ? 'exploding' : ''}`}
          style={{
            transform: `translate(${asteroid.currentX}vw, ${asteroid.currentY}vh) rotate(${asteroid.rotation}deg)`,
            opacity: (asteroid.startTime && Date.now() >= asteroid.startTime) ? 1 : 0,
            cursor: asteroid.isExploding ? 'default' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          } as React.CSSProperties}
          onClick={() => {
            if (!asteroid.isExploding) {
              setAsteroids((prevAsteroids) =>
                prevAsteroids.map((a) =>
                  a.id === asteroid.id ? { ...a, isExploding: true } : a
                )
              );
            }
          }}
        >
          {asteroid.isExploding ? (
            <ExplosionArt baseAsteroidSize={asteroid.size} />
          ) : (
            <svg
              width={asteroid.size}
              height={asteroid.size}
              viewBox="0 0 32 32"
              className="pixelated"
            >
              <rect x="8" y="4" width="16" height="6" fill="#666666" />
              <rect x="4" y="10" width="6" height="12" fill="#555555" />
              <rect x="10" y="10" width="12" height="12" fill="#777777" />
              <rect x="22" y="10" width="6" height="12" fill="#555555" />
              <rect x="8" y="22" width="16" height="6" fill="#666666" />
              <rect x="12" y="14" width="8" height="4" fill="#888888" />
              <rect x="6" y="6" width="4" height="4" fill="#444444" />
              <rect x="22" y="24" width="4" height="4" fill="#444444" />
            </svg>
          )}
        </div>
      ))}

      {/* Main content */}
      <div className="container mx-auto px-8 py-16 max-w-4xl relative z-20">
        {/* Main title */}
        <div className="text-center mb-6">
          <h1
            className="text-5xl md:text-7xl font-normal mb-6 pixel-gradient-text pixelated mx-auto"
            style={{
              textShadow:
                "4px 4px 0px #ff0080, -2px -2px 0px #00ffff, 2px -2px 0px #00ffff, -2px 2px 0px #00ffff, 2px 2px 0px #00ffff",
              imageRendering: "pixelated",
              fontFamily: '"Press Start 2P", monospace',
              letterSpacing: "0.15em",
            }}
          >
            michael
          </h1>

          {/* Subtitle */}
          <div className="inline-block border-[#000000] px-8 py-4 pixelated">
            <span className="text-[#00ff41] text-sm md:text-xl font-normal tracking-wider">
              SOFTWARE ENGINEER
            </span>
          </div>
        </div>

        {/* About section */}
        <div className="p-6">
          <h2 className="text-[#00ff41] text-xl md:text-2xl font-normal mb-6">
            ABOUT ME
          </h2>
          <p className="text-[#00ffff] text-sm md:text-base leading-relaxed">
          Hello! I'm Michael - a software engineer who enjoys building things and solving interesting problems. 
          When I'm not coding, you'll probably find me watching or playing soccer. Feel free to say hi!
          </p>
        </div>

        {/* Links section */}
        <div className="p-6">
          <h2 className="text-[#00ff41] text-xl md:text-2xl font-normal mb-8">
            LINKS
          </h2>

          <div className="flex flex-wrap gap-8 justify-center md:justify-start">
            <a
              href="https://instagram.com/micsparre"
              className="text-[#ff0080] hover:text-[#ffffff] transition-colors transform hover:scale-110"
            >
              <PixelIcon type="instagram" />
            </a>

            <a
              href="https://linkedin.com/in/micsparre"
              className="text-[#ff0080] hover:text-[#ffffff] transition-colors transform hover:scale-110"
            >
              <PixelIcon type="linkedin" />
            </a>

            <a
              href="https://github.com/micsparre"
              className="text-[#ff0080] hover:text-[#ffffff] transition-colors transform hover:scale-110"
            >
              <PixelIcon type="github" />
            </a>

            <a
              href="mailto:micsparre@gmail.com"
              className="text-[#ff0080] hover:text-[#ffffff] transition-colors transform hover:scale-110"
            >
              <PixelIcon type="email" />
            </a>

            <a
              href="https://micsparre.github.io/msparre-res.pdf"
              className="text-[#ff0080] hover:text-[#ffffff] transition-colors transform hover:scale-110"
            >
              <PixelIcon type="resume" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
