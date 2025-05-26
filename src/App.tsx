import React, { useState, useEffect, useCallback, useRef } from "react";

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
    [0, 0, 0, 4, 4, 0, 0, 0],
    [0, 0, 4, 3, 3, 4, 0, 0],
    [0, 4, 3, 2, 2, 3, 4, 0],
    [4, 3, 2, 1, 1, 2, 3, 4], // Central, brightest part
    [4, 3, 2, 1, 1, 2, 3, 4], // Symmetric
    [0, 4, 3, 2, 2, 3, 4, 0],
    [0, 0, 4, 3, 3, 4, 0, 0],
    [0, 0, 0, 4, 4, 0, 0, 0],
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

interface Star {
  id: number;
  left: number;
  top: number;
  size: string;
  delay: number;
}

interface Asteroid {
  id: number;
  // delay: number; // Initial delay for staggering, not part of ongoing state after first startTime is set
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
}

function App() {
  const [stars, setStars] = useState<Star[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const nextAsteroidId = useRef(0); // Counter for unique asteroid IDs

  // Helper function to generate new paths for asteroids
  const generateNewPath = useCallback(() => {
    let newStartX, newStartY, newEndX, newEndY;
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left

    if (side === 0) { // Coming from top
      newStartX = Math.random() * 100;
      newStartY = -10; // Start above screen
      newEndX = Math.random() * 100;
      newEndY = 110; // End below screen
    } else if (side === 1) { // Coming from right
      newStartX = 110; // Start right of screen
      newStartY = Math.random() * 100;
      newEndX = -10; // End left of screen
      newEndY = Math.random() * 100;
    } else if (side === 2) { // Coming from bottom
      newStartX = Math.random() * 100;
      newStartY = 110; // Start below screen
      newEndX = Math.random() * 100;
      newEndY = -10; // End above screen
    } else { // Coming from left (side === 3)
      newStartX = -10; // Start left of screen
      newStartY = Math.random() * 100;
      newEndX = 110; // End right of screen
      newEndY = Math.random() * 100;
    }
    return { newStartX, newStartY, newEndX, newEndY };
  }, []);

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
      const { newStartX, newStartY, newEndX, newEndY } = generateNewPath(); // Use the helper

      return {
        id: i, // Initial IDs are 0 through 7
        size: Math.random() * 15 + 25, // Randomize size
        startX: newStartX,
        startY: newStartY,
        endX: newEndX,
        endY: newEndY,
        isExploding: false,
        currentX: newStartX,
        currentY: newStartY,
        rotation: 0,
        // Faster and randomized initial appearance times:
        // First asteroid (i=0): 0-0.5s delay.
        // Subsequent asteroids: staggered by an additional 1-1.8s each.
        startTime: Date.now() + (i * 1500) + (Math.random() * 200 - 100), // Consistent 1.5s interval with +/-100ms jitter
      };
    });
    setAsteroids(generatedAsteroids);
    nextAsteroidId.current = generatedAsteroids.length; // Set the counter for the next ID
  }, [generateNewPath]);

  // Animation and collision detection loop
  useEffect(() => {
    let animationFrameId: number;
    const ASTEROID_ANIMATION_DURATION = 20000; // 20 seconds in milliseconds

    const updateAsteroids = () => {
      const now = Date.now();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      setAsteroids((prevAsteroids: Asteroid[]) => {
        const updatedAsteroids = prevAsteroids.map((asteroid: Asteroid) => {
          if (asteroid.isExploding || !asteroid.startTime || now < asteroid.startTime) {
            return asteroid;
          }

          const timeElapsed = now - asteroid.startTime;
          let progress = timeElapsed / ASTEROID_ANIMATION_DURATION;

          if (progress >= 1) {
            // Asteroid has completed its path, mark for removal or filter out
            return null; // Mark for removal
          }

          // Ensure currentX, currentY, startX, startY, endX, endY are defined before use
          const currentX = (asteroid.startX ?? 0) + ((asteroid.endX ?? 0) - (asteroid.startX ?? 0)) * progress;
          const currentY = (asteroid.startY ?? 0) + ((asteroid.endY ?? 0) - (asteroid.startY ?? 0)) * progress;
          const rotation = 360 * progress; // Simple rotation, can be improved

          return {
            ...asteroid,
            currentX,
            currentY,
            rotation,
          };
        });

        // Filter out null (removed) asteroids
        const validAsteroids = updatedAsteroids.filter(asteroid => asteroid !== null) as Asteroid[];

        // Collision detection
        const newAsteroidsWithCollisions = [...validAsteroids];
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
  }, []);

  // New useEffect to replace exploded asteroids
  useEffect(() => {
    const explodingAsteroids = asteroids.filter((a: Asteroid) => a.isExploding);
    if (explodingAsteroids.length > 0) {
      const timer = setTimeout(() => {
        setAsteroids((prevAsteroids: Asteroid[]) =>
          prevAsteroids.filter((asteroid: Asteroid) => !asteroid.isExploding) // Remove exploded asteroids
        );
      }, 500); // Remove after 0.5s (explosion animation duration)
      return () => clearTimeout(timer);
    }
  }, [asteroids]); // Only re-run if asteroids array changes, no generateNewPath needed

  // useEffect to continuously generate new asteroids
  useEffect(() => {
    const generationInterval = setInterval(() => {
      const { newStartX, newStartY, newEndX, newEndY } = generateNewPath();
      const newAsteroid: Asteroid = {
        id: nextAsteroidId.current++,
        size: Math.random() * 15 + 25,
        startX: newStartX,
        startY: newStartY,
        endX: newEndX,
        endY: newEndY,
        isExploding: false,
        currentX: newStartX,
        currentY: newStartY,
        rotation: 0,
        startTime: Date.now(), // Start immediately
      };
      setAsteroids((prevAsteroids: Asteroid[]) => [...prevAsteroids, newAsteroid]);
    }, 2500); // Generate a new asteroid every 2.5 seconds

    return () => clearInterval(generationInterval); // Cleanup on unmount
  }, [generateNewPath]); // Dependency: generateNewPath

  const SpaceBackground = () => {
    return (
      <div className="space-background">
        <div className="stars">
          {stars.map((star: Star) => (
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
      {asteroids.map((asteroid: Asteroid) => (
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
              setAsteroids((prevAsteroids: Asteroid[]) =>
                prevAsteroids.map((a: Asteroid) =>
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
            className="text-4xl sm:text-5xl md:text-7xl font-normal mb-6 pixel-gradient-text pixelated mx-auto text-center"
            style={{
              textShadow:
                "4px 4px 0px #ff0080, -2px -2px 0px #00ffff, 2px -2px 0px #00ffff, -2px 2px 0px #00ffff, 2px 2px 0px #00ffff",
              imageRendering: "pixelated",
              fontFamily: '"Press Start 2P", monospace',
              letterSpacing: "0.15em",
            }}
          >michael</h1>

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
