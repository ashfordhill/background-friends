import React, { useEffect, useRef } from 'react';
import jellyfishVideo from './assets/slow-jellyfish.mp4';

interface JellyfishInstance {
  x: number;
  y: number;
  vx: number;
  vy: number;
  video: HTMLVideoElement;
  size: number;
  rotationAngle: number; // Current rotation in radians
  targetRotationAngle: number; // Target rotation in radians
}

interface JellyfishBackgroundProps {
  count?: number;
  speed?: number;
  size?: number;
  rotationEasing?: number; // 0-1, how quickly to rotate (0.05 = slow/natural, 0.15 = faster)
  glowColor?: string;
  glowAmount?: number;
  hueShift?: number; // 0-360
  blendMode?: GlobalCompositeOperation;
}

/**
 * Normalize angle to 0-2π range
 */
function normalizeAngle(angle: number): number {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
}

/**
 * Shortest path interpolation between two angles
 */
function lerpAngle(current: number, target: number, t: number): number {
  current = normalizeAngle(current);
  target = normalizeAngle(target);

  let diff = target - current;

  // Take shortest path around circle
  if (diff > Math.PI) {
    diff -= Math.PI * 2;
  } else if (diff < -Math.PI) {
    diff += Math.PI * 2;
  }

  return current + diff * t;
}

/**
 * Calculate angle from velocity vector
 * Returns angle in radians where 0 = right, π/2 = down, π = left, -π/2 = up
 */
function getAngleFromVelocity(vx: number, vy: number): number {
  return Math.atan2(vy, vx);
}

export const Jellyfish: React.FC<JellyfishBackgroundProps> = ({
  count = 2,
  speed = 1.2,
  size = 350,
  rotationEasing = 0.08,
  glowColor = 'rgba(0, 150, 255, 0.5)',
  glowAmount = 20,
  hueShift = 0,
  blendMode = 'screen',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instancesRef = useRef<JellyfishInstance[]>([]);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Initialize instances
    const videos: HTMLVideoElement[] = [];
    for (let i = 0; i < count; i++) {
      const v = document.createElement('video');
      v.src = jellyfishVideo;
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      v.autoplay = true;
      v.play().catch(() => {});
      videos.push(v);
    }

    // Initialize with random velocity directions
    instancesRef.current = videos.map((video: HTMLVideoElement) => {
      const vx = (Math.random() > 0.5 ? 1 : -1) * speed;
      const vy = (Math.random() > 0.5 ? 1 : -1) * speed;
      const initialAngle = getAngleFromVelocity(vx, vy);

      return {
        x: Math.random() * (window.innerWidth - size),
        y: Math.random() * (window.innerHeight - size),
        vx,
        vy,
        video,
        size,
        rotationAngle: initialAngle,
        targetRotationAngle: initialAngle,
      };
    });

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      instancesRef.current.forEach((instance: JellyfishInstance) => {
        // Move
        instance.x += instance.vx;
        instance.y += instance.vy;

        // Handle collisions & update target rotation
        let collided = false;
        if (instance.x <= 0 || instance.x + instance.size >= window.innerWidth) {
          instance.vx *= -1;
          instance.vy += (Math.random() - 0.5) * speed;
          collided = true;
        }
        if (instance.y <= 0 || instance.y + instance.size >= window.innerHeight) {
          instance.vy *= -1;
          instance.vx += (Math.random() - 0.5) * speed;
          collided = true;
        }

        if (collided) {
          // Re-normalize to maintain consistent speed
          const currentSpeed = Math.sqrt(instance.vx * instance.vx + instance.vy * instance.vy);
          instance.vx = (instance.vx / currentSpeed) * speed;
          instance.vy = (instance.vy / currentSpeed) * speed;
        }

        // Update target rotation based on new velocity direction
        instance.targetRotationAngle = getAngleFromVelocity(instance.vx, instance.vy);

        // Smoothly interpolate rotation towards target
        instance.rotationAngle = lerpAngle(
          instance.rotationAngle,
          instance.targetRotationAngle,
          rotationEasing
        );

        if (offscreenCtx && instance.video.readyState >= 2) {
          offscreenCtx.clearRect(0, 0, size, size);
          offscreenCtx.drawImage(instance.video, 0, 0, instance.size, instance.size);
          const frame = offscreenCtx.getImageData(0, 0, instance.size, instance.size);
          const data = frame.data;

          // Smooth Chroma key: target the green background
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Normalize green detection
            const greenness = g - Math.max(r, b);
            if (greenness > 30) {
              // Smooth transition based on greenness
              const alpha = Math.max(0, 1 - (greenness - 30) / 40);
              data[i + 3] = Math.min(data[i + 3], alpha * 255);
            }
          }

          offscreenCtx.putImageData(frame, 0, 0);

          // Draw with rotation and glow
          const centerX = instance.x + instance.size / 2;
          const centerY = instance.y + instance.size / 2;

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(instance.rotationAngle);
          
          if (hueShift !== 0) {
            ctx.filter = `hue-rotate(${hueShift}deg)`;
          }

          if (glowAmount > 0) {
            ctx.shadowBlur = glowAmount;
            ctx.shadowColor = glowColor;
          }

          ctx.globalCompositeOperation = blendMode;

          ctx.drawImage(
            offscreenCanvas,
            -instance.size / 2,
            -instance.size / 2,
            instance.size,
            instance.size
          );
          ctx.restore();
          // Reset to default for next draw
          ctx.globalCompositeOperation = 'source-over';
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', updateCanvasSize);
      videos.forEach((v: HTMLVideoElement) => {
        v.pause();
        v.src = '';
        v.load();
      });
    };
  }, [count, speed, size, rotationEasing]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default Jellyfish;
