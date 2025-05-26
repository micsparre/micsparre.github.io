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
  const MAX_ASTEROIDS_ON_SCREEN = 10;

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
      setAsteroids((prevAsteroids) => {
        const activeAsteroids = prevAsteroids.filter(
          (a) => !a.isExploding && a.startTime && Date.now() >= a.startTime
        ).length;

        const probability = 1 - (Math.log(activeAsteroids + 1) / Math.log(MAX_ASTEROIDS_ON_SCREEN + 1));

        if (Math.random() < probability && activeAsteroids < MAX_ASTEROIDS_ON_SCREEN) {
          const { newStartX, newStartY, newEndX, newEndY } = generateNewPath();
          const newAsteroid: Asteroid = {
            id: nextAsteroidId.current++, // nextAsteroidId is a ref, safe to use
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
          return [...prevAsteroids, newAsteroid];
        }
        return prevAsteroids; // If no new asteroid, return the previous state unchanged
      });
    }, 500); // Check every 500ms

    return () => clearInterval(generationInterval); // Cleanup on unmount
  }, [generateNewPath, MAX_ASTEROIDS_ON_SCREEN]); // Dependencies no longer include `asteroids`

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
    const commonSvgStyle: React.CSSProperties = { pointerEvents: 'none' };

    const renderIcon = () => {
      switch (type) {
        case "instagram":
          return (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="currentColor"
              className="pixelated"
              style={commonSvgStyle}
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M14.151 0.310866C13.9935 0.468357 13.8647 1.11264 13.8647 1.7426V2.88799H11.6455C10.2376 2.88799 9.32151 2.99275 9.13992 3.17434C8.98243 3.33183 8.85357 3.97612 8.85357 4.60608V5.75147H7.35025C6.49908 5.75147 5.7226 5.87579 5.56057 6.03782C5.39855 6.19984 5.27422 6.97632 5.27422 7.82749V9.33082H4.12883C3.49887 9.33082 2.85459 9.45967 2.6971 9.61716C2.51765 9.79661 2.41075 10.6883 2.41075 12.0034V14.1033H1.50398C1.00526 14.1033 0.468357 14.2321 0.310866 14.3896C-0.103622 14.8041 -0.103622 49.4345 0.310866 49.849C0.468357 50.0065 1.00526 50.1354 1.50398 50.1354H2.41075V52.1159C2.41075 53.3382 2.52028 54.206 2.6971 54.3828C2.85459 54.5403 3.49887 54.6692 4.12883 54.6692H5.27422V56.1725C5.27422 57.0237 5.39855 57.8002 5.56057 57.9622C5.7226 58.1242 6.49908 58.2485 7.35025 58.2485H8.85357V59.3939C8.85357 60.0239 8.98243 60.6682 9.13992 60.8257C9.32151 61.0073 10.2376 61.112 11.6455 61.112H13.8647V62.2574C13.8647 62.8874 13.9935 63.5316 14.151 63.6891C14.5655 64.1036 49.4345 64.1036 49.849 63.6891C50.0065 63.5316 50.1354 62.8874 50.1354 62.2574V61.112H52.2352C53.5503 61.112 54.442 61.0051 54.6215 60.8257C54.779 60.6682 54.9078 60.0239 54.9078 59.3939V58.2485H56.4111C57.2623 58.2485 58.0388 58.1242 58.2008 57.9622C58.3628 57.8002 58.4872 57.0237 58.4872 56.1725V54.6692H59.6325C60.2625 54.6692 60.9068 54.5403 61.0643 54.3828C61.2411 54.206 61.3506 53.3382 61.3506 52.1159V50.1354H62.3767C62.9411 50.1354 63.5316 50.0065 63.6891 49.849C64.1036 49.4345 64.1036 14.8041 63.6891 14.3896C63.5316 14.2321 62.9411 14.1033 62.3767 14.1033H61.3506V12.0034C61.3506 10.6883 61.2437 9.79661 61.0643 9.61716C60.9068 9.45967 60.2625 9.33082 59.6325 9.33082H58.4872V7.82749C58.4872 6.97632 58.3628 6.19984 58.2008 6.03782C58.0388 5.87579 57.2623 5.75147 56.4111 5.75147H54.9078V4.60608C54.9078 3.97612 54.779 3.33183 54.6215 3.17434C54.442 2.9949 53.5503 2.88799 52.2352 2.88799H50.1354V1.7426C50.1354 1.11264 50.0065 0.468357 49.849 0.310866C49.4345 -0.103622 14.5655 -0.103622 14.151 0.310866ZM14.5805 6.89686C14.5805 7.52683 14.4517 8.17111 14.2942 8.3286C14.1322 8.49062 13.3557 8.61495 12.5045 8.61495H11.0012V9.76034C11.0012 10.3903 10.8723 11.0346 10.7148 11.1921C10.5573 11.3496 9.91306 11.4784 9.28309 11.4784H8.1377V12.9817C8.1377 14.7318 7.90528 15.0578 6.65824 15.0578H5.75147V32V48.9422H6.65824C7.90528 48.9422 8.1377 49.2682 8.1377 51.0183V52.5216H9.28309C9.91306 52.5216 10.5573 52.6504 10.7148 52.8079C10.8723 52.9654 11.0012 53.6097 11.0012 54.2397V55.3851H12.5045C13.3557 55.3851 14.1322 55.5094 14.2942 55.6714C14.4517 55.8289 14.5805 56.4732 14.5805 57.1031V58.2485H31.8807H49.1809V57.1031C49.1809 56.4732 49.3097 55.8289 49.4672 55.6714C49.6292 55.5094 50.4057 55.3851 51.2569 55.3851H52.7602V54.2397C52.7602 53.6097 52.8891 52.9654 53.0466 52.8079C53.204 52.6504 53.8483 52.5216 54.4783 52.5216H55.6237V51.0183C55.6237 50.1671 55.748 49.3906 55.91 49.2286C56.0675 49.0711 56.6581 48.9422 57.2225 48.9422H58.2485V32V15.0578H57.2225C56.6581 15.0578 56.0675 14.9289 55.91 14.7714C55.748 14.6094 55.6237 13.8329 55.6237 12.9817V11.4784H54.4783C53.8483 11.4784 53.204 11.3496 53.0466 11.1921C52.8891 11.0346 52.7602 10.3903 52.7602 9.76034V8.61495H51.2569C50.4057 8.61495 49.6292 8.49062 49.4672 8.3286C49.3097 8.17111 49.1809 7.52683 49.1809 6.89686V5.75147H31.8807H14.5805V6.89686ZM46.3651 12.4806C46.1821 12.6637 46.0788 13.5943 46.0788 15.0578C46.0788 16.5212 46.1821 17.4519 46.3651 17.6349C46.755 18.0248 51.1295 18.0248 51.5194 17.6349C51.9093 17.245 51.9093 12.8705 51.5194 12.4806C51.1295 12.0907 46.755 12.0907 46.3651 12.4806ZM24.4118 16.06C24.2498 16.222 24.1254 16.9985 24.1254 17.8497V19.353H22.0256C20.7105 19.353 19.8188 19.4599 19.6393 19.6393C19.4599 19.8188 19.353 20.7105 19.353 22.0256V24.1254H17.7303C16.7864 24.1254 15.9879 24.2452 15.8214 24.4118C15.4121 24.821 15.4121 39.179 15.8214 39.5882C15.9879 39.7548 16.7864 39.8746 17.7303 39.8746H19.353V41.8551C19.353 43.0774 19.4625 43.9452 19.6393 44.1221C19.8188 44.3015 20.7105 44.4084 22.0256 44.4084H24.1254V46.031C24.1254 46.975 24.2452 47.7735 24.4118 47.94C24.821 48.3493 39.179 48.3493 39.5882 47.94C39.7548 47.7735 39.8746 46.975 39.8746 46.031V44.4084H41.8551C43.0774 44.4084 43.9452 44.2989 44.1221 44.1221C44.2989 43.9452 44.4084 43.0774 44.4084 41.8551V39.8746H46.031C46.975 39.8746 47.7735 39.7548 47.94 39.5882C48.3493 39.179 48.3493 24.821 47.94 24.4118C47.7735 24.2452 46.975 24.1254 46.031 24.1254H44.4084V22.0256C44.4084 20.7105 44.3015 19.8188 44.1221 19.6393C43.9452 19.4625 43.0774 19.353 41.8551 19.353H39.8746V17.8497C39.8746 16.9985 39.7502 16.222 39.5882 16.06C39.179 15.6507 24.821 15.6507 24.4118 16.06ZM25.0799 23.0039C25.0799 23.8551 24.9556 24.6316 24.7936 24.7936C24.627 24.9601 23.8286 25.0799 22.8846 25.0799H21.262V31.8807V38.6814H22.8846C23.8286 38.6814 24.627 38.8012 24.7936 38.9678C24.9601 39.1344 25.0799 39.9328 25.0799 40.8768V42.4994H31.8807H38.6814V40.8768C38.6814 39.9328 38.8012 39.1344 38.9678 38.9678C39.1344 38.8012 39.9328 38.6814 40.8768 38.6814H42.4994V31.8807V25.0799H40.8768C39.9328 25.0799 39.1344 24.9601 38.9678 24.7936C38.8058 24.6316 38.6814 23.8551 38.6814 23.0039V21.5006H31.8807H25.0799V23.0039Z"
                fill="currentColor"
              />
            </svg>
          );
        case "linkedin":
          return (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="currentColor"
              className="pixelated"
              style={commonSvgStyle}
            >
              <g clip-path="url(#clip0_102_5)">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M8 2V4H6H4V6V8H2H0V32V56H2H4V58V60H6H8V62V64H32H56V62V60H58H60V58.0031V56.0062L62.0312 55.9719L64.0625 55.9375L64.0943 31.9375L64.126 7.9375L62.063 7.97463L60 8.01163V6.00588V4H58H56V2V0H32H8V2ZM0.06125 32C0.06125 45.2344 0.075875 50.6485 0.09375 44.0312C0.111625 37.4141 0.111625 26.586 0.09375 19.9688C0.075875 13.3516 0.06125 18.7656 0.06125 32ZM12 16V20H16H20V16V12H16H12V16ZM12 38V52H16H20V38V24H16H12V38ZM28 38V52H32H36V42V32H40H44V42V52H48H52V40V28H50H48V26V24H44H40V26V28H38H36V26V24H32H28V38Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_102_5">
                  <rect
                    width="64"
                    height="64"
                    fill="white"
                  />
                </clipPath>
              </defs>
            </svg>
          );
        case "github":
          return (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="currentColor"
              className="pixelated"
              style={commonSvgStyle}
            >
              <g clip-path="url(#clip0_101_5)">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M16 2V4H14H12V6V8H10H8V10V12H6.00125H4.00238L3.97 17.9688L3.9375 23.9375L1.96875 23.9719L0 24.0064V34.0031V44H2H4V48V52H6H8V54V56H10H12V58V60H14H16V62V64H22H28V60V56H22.0625H16.125V54V52H22.0625H28V50V48H24H20V46V44H18.0656H16.1314L16.0969 42.0312L16.0625 40.0625L14.0312 40.0281L12 39.9938V32V24.0063L14.0312 23.9719L16.0625 23.9375L16.095 17.9688L16.1274 12H18.0637H20V14.0625V16.125H32H44V14.0625V12H46H48V18V24H50H52V32V40H50H48V42V44H46H44V46V48H40H36V50V52H38H40V58V64H44.0625H48.125V62V60H50.0625H52V58V56H54H56V54V52H58H60V48.0031V44.0062L62.0312 43.9719L64.0625 43.9375L64.0946 33.9375L64.1266 23.9375H62.0946H60.0625L60.03 17.9688L59.9976 12H57.9987H56V10V8H54H52V6V4H50.0625H48.125V2V0H32.0625H16V2ZM0.059625 34C0.059625 39.5344 0.075 41.7985 0.09375 39.0312C0.1125 36.2641 0.1125 31.736 0.09375 28.9688C0.075 26.2016 0.059625 28.4656 0.059625 34ZM12 50.0625V52H14H16V50.0625V48.125H14H12V50.0625Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_101_5">
                  <rect
                    width="64"
                    height="64"
                    fill="white"
                  />
                </clipPath>
              </defs>
            </svg>
          );
        case "email":
          return (
            <svg
              width="64"
              height="50"
              viewBox="0 0 64 50"
              fill="currentColor"
              className="pixelated"
              style={commonSvgStyle}
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0 25.0008V49.3755L32.0312 49.344L64.0625 49.3125L64.0941 24.9375L64.1256 0.5625L32.0629 0.59425L0 0.626V25.0008ZM0.06125 25C0.06125 38.4406 0.075875 43.939 0.09375 37.2188C0.111625 30.4984 0.111625 19.5015 0.09375 12.7812C0.075875 6.06087 0.06125 11.5594 0.06125 25ZM4.25 6.25V7.625H5.625H7V9.6875V11.75H9.75H12.5V13.8101V15.8703L15.2812 15.9039L18.0625 15.9375L18.0968 18.0312L18.131 20.125H15.3155H12.5V18.0649V16.0047L9.71875 15.9711L6.9375 15.9375L6.90325 13.8438L6.869 11.75H5.5595H4.25V28.4375V45.125H32H59.75V28.4375V11.75H58.4405H57.131L57.0967 13.8438L57.0625 15.9375L54.2812 15.9711L51.5 16.0047V18.0649V20.125H48.6845H45.869L45.9033 18.0312L45.9375 15.9375L48.7188 15.9039L51.5 15.8703V13.8101V11.75H54.25H57V9.6875V7.625H58.375H59.75V6.25V4.875H32H4.25V6.25ZM18.125 22.25V24.375H20.875H23.625V26.4375V28.5H26.4375H29.25V30.5625V32.625H32H34.75V30.5625V28.5H37.5625H40.375V26.4375V24.375H43.125H45.875V22.25V20.125H43.125H40.375V22.1875V24.25H37.5625H34.75V26.375V28.5H32H29.25V26.375V24.25H26.4375H23.625V22.1875V20.125H20.875H18.125V22.25Z"
                fill="currentColor"
              />
            </svg>
          );
        case "resume":
          return (
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="currentColor"
              className="pixelated"
              style={commonSvgStyle}
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.24996 1.41115V2.65628H7.20829H6.16663V32.1244V61.5925H7.20829H8.24996V62.7963V64L32.5625 63.9792L56.875 63.9582L56.889 62.7961L56.9029 61.634L57.9931 61.6108L59.0833 61.5877V36.7314V11.8751L57.9791 11.8519L56.875 11.8287L56.8648 10.9156C56.8592 10.4134 56.8498 9.89979 56.844 9.77428L56.8333 9.54601H55.625H54.4166V8.42539V7.30477H53.25H52.0833V6.14265V4.98052H50.9166H49.75V3.85991V2.73929H48.5416H47.3333V1.45265V0.166016H27.7916H8.24996V1.41115ZM8.68738 32.1036L8.70829 61.385L32.6875 61.4059L56.6666 61.4267V37.9352V14.4435H50.9583H45.25V13.1984V11.9533H44.0833H42.9166V7.38778V2.8223H25.7915H8.66638L8.68738 32.1036ZM45.4166 7.34627V11.8703H49.8244C53.274 11.8703 54.2407 11.8477 54.2715 11.7665C54.2931 11.7095 54.3065 11.2332 54.3012 10.7081L54.2916 9.75353L53.1458 9.73045L52 9.70737V8.54758V7.38778H50.8333H49.6666V6.22566V5.06353H48.4583H47.25V3.94291V2.8223H46.3333H45.4166V7.34627ZM20.25 8.5499V9.71202H19.1299C18.505 9.71202 17.988 9.74722 17.9604 9.79163C17.9252 9.84841 17.8887 16.7024 17.915 18.3242C17.9162 18.402 18.198 18.4279 19.0416 18.4279H20.1666V19.6316V20.8352H17.9166H15.6666V21.9536V23.072L14.4375 23.0949L13.2083 23.1179V27.5174V31.9169H24.6666H36.125L36.1465 27.4966L36.1681 23.0764H34.959H33.75V21.9558V20.8352H31.4166H29.0833V19.6316V18.4279H30.2916H31.5V14.1204C31.5 10.269 31.486 9.80748 31.3681 9.76241C31.2956 9.73468 30.7519 9.71202 30.1598 9.71202H29.0833V8.5499V7.38778H24.6666H20.25V8.5499ZM20.3333 14.2338V18.3404L21.5208 18.3634L22.7083 18.3864L22.7314 19.6108L22.7544 20.8352H24.6272H26.5V19.5901V18.3449H27.75H29V14.236V10.1271H24.6666H20.3333V14.2338ZM15.6666 26.4383V29.4681H24.6666H33.6666V26.4383V23.4085H24.6666H15.6666V26.4383ZM13.2035 35.9667C13.1805 36.0266 13.172 36.5781 13.185 37.1921L13.2083 38.3085L16.3147 38.3303L19.4211 38.352L19.398 37.1267L19.375 35.9013L16.3102 35.8795C13.8416 35.8619 13.2374 35.879 13.2035 35.9667ZM22.639 35.9149C22.6084 35.9454 22.5833 36.5058 22.5833 37.1603V38.35H37.3355H52.0877L52.0647 37.1257L52.0416 35.9013L37.3682 35.8803C29.2979 35.8687 22.6698 35.8844 22.639 35.9149ZM13.1666 42.5835C13.1666 43.5236 13.1921 43.8289 13.2708 43.8297C13.3979 43.831 51.5315 43.8309 51.8541 43.8295L52.0833 43.8286V42.5835V41.3384H32.625H13.1666V42.5835ZM13.2222 46.8723C13.1916 46.9027 13.1666 47.4817 13.1666 48.1589V49.3902H32.625H52.0833V48.1036V46.8169H32.6805C22.009 46.8169 13.2527 46.8418 13.2222 46.8723ZM13.1666 53.7482V54.9518H29.2916H45.4166V53.7482V52.5445H29.2916H13.1666V53.7482Z"
                fill="currentColor"
              />
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

          <div className="flex flex-wrap items-center gap-8 justify-center md:justify-start">
            <a
              href="https://instagram.com/micsparre"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff0080] hover:text-[#ffffff] transition-colors transform hover:scale-110"
            >
              <PixelIcon type="instagram" />
            </a>

            <a
              href="https://linkedin.com/in/micsparre"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff0080] hover:text-[#ffffff] transition-colors transform hover:scale-110"
            >
              <PixelIcon type="linkedin" />
            </a>

            <a
              href="https://github.com/micsparre"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff0080] hover:text-[#ffffff] transition-colors transform hover:scale-110"
            >
              <PixelIcon type="github" />
            </a>

            <a
              href="mailto:micsparre@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff0080] hover:text-[#ffffff] transition-colors transform hover:scale-110"
            >
              <PixelIcon type="email" />
            </a>

            <a
              href="./michael-resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
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
