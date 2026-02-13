import React, { useState } from 'react';
import { Jellyfish } from 'jellyfish-component';

interface JellyfishDemoProps {}

export default function JellyfishDemo({}: JellyfishDemoProps) {
  const [count, setCount] = useState(2);
  const [speed, setSpeed] = useState(1.2);
  const [size, setSize] = useState(350);
  const [rotationEasing, setRotationEasing] = useState(0.08);
  const [hueShift, setHueShift] = useState(0);
  const [glowAmount, setGlowAmount] = useState(20);

  return (
    <>
      <Jellyfish 
        count={count}
        speed={speed}
        size={size}
        rotationEasing={rotationEasing}
        hueShift={hueShift}
        glowAmount={glowAmount}
      />
      
      <div className="demo-info">
        Jellyfish: {count} | Speed: {speed.toFixed(1)} | Hue: {hueShift}°
      </div>
      <div className="demo-title">Jellyfish Animation Demo</div>

      <div className="demo-controls">
        <div className="control-group">
          <label htmlFor="count">Count:</label>
          <input
            id="count"
            type="range"
            min="1"
            max="10"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
          />
          <span>{count}</span>
        </div>

        <div className="control-group">
          <label htmlFor="speed">Speed:</label>
          <input
            id="speed"
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
          <span>{speed.toFixed(1)}</span>
        </div>

        <div className="control-group">
          <label htmlFor="hue">Hue:</label>
          <input
            id="hue"
            type="range"
            min="0"
            max="360"
            value={hueShift}
            onChange={(e) => setHueShift(parseInt(e.target.value))}
          />
          <span>{hueShift}°</span>
        </div>

        <div className="control-group">
          <label htmlFor="glow">Glow:</label>
          <input
            id="glow"
            type="range"
            min="0"
            max="50"
            value={glowAmount}
            onChange={(e) => setGlowAmount(parseInt(e.target.value))}
          />
          <span>{glowAmount}px</span>
        </div>

        <div className="control-group">
          <label htmlFor="size">Size:</label>
          <input
            id="size"
            type="range"
            min="100"
            max="800"
            step="10"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
          />
          <span>{size}px</span>
        </div>
      </div>
    </>
  );
}
