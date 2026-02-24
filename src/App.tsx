import React, { useState } from 'react';
import './styles.css';
import { useSegments } from './hooks/useSegments';
import { SegmentTable } from './components/SegmentTable';
import { Wheel } from './components/Wheel';

export default function App() {
  const { segments, updateWeight, updateLabel, updateColor, addSegment, removeSegment, setSegments } = useSegments();
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const presets = [
    { name: 'Lunch', segments: [
      { id: 'l1', label: 'Pizza', weight: 1, percentage: 33.3, color: '#FF5733' },
      { id: 'l2', label: 'Sushi', weight: 1, percentage: 33.3, color: '#33FF57' },
      { id: 'l3', label: 'Tacos', weight: 1, percentage: 33.3, color: '#3357FF' },
    ]},
    { name: 'Truth or Dare', segments: [
      { id: 'td1', label: 'Truth', weight: 1, percentage: 50, color: '#f43f5e' },
      { id: 'td2', label: 'Dare', weight: 1, percentage: 50, color: '#6366f1' },
    ]},
  ];

  const loadPreset = (preset: typeof presets[0]) => {
    setSegments(preset.segments);
    setWinner(null);
  };

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    // Calculate total weight to pick a winner
    const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
    const randomWeight = Math.random() * totalWeight;
    
    let currentWeight = 0;
    let winnerIndex = 0;
    for (let i = 0; i < segments.length; i++) {
      currentWeight += segments[i].weight;
      if (randomWeight <= currentWeight) {
        winnerIndex = i;
        break;
      }
    }

    // Determine the angle for the winner
    // Winner center angle calculation
    let winnerStartAngle = 0;
    for (let i = 0; i < winnerIndex; i++) {
      winnerStartAngle += (segments[i].percentage / 100) * 360;
    }
    const winnerAngle = (segments[winnerIndex].percentage / 100) * 360;
    const centerWinnerAngle = winnerStartAngle + winnerAngle / 2;
    
    // Total spin: at least 5 rotations + offset to bring winner to top (270 degrees)
    const extraSpins = 5 * 360;
    const targetRotation = 270 - centerWinnerAngle;
    const finalRotation = rotation + extraSpins + (targetRotation - (rotation % 360));

    setRotation(finalRotation);

    setTimeout(() => {
      setWinner(segments[winnerIndex].label);
      setIsSpinning(false);
    }, 1500); // Rough duration to match animation
  };

  return (
    <div className="app">
      <header>
        <h1>Vibe Spin</h1>
      </header>
      <main>
        <div className="controls">
          <div className="presets">
            {presets.map(p => (
              <button key={p.name} className="preset-btn" onClick={() => loadPreset(p)}>
                {p.name}
              </button>
            ))}
          </div>
          <SegmentTable 
            segments={segments} 
            onUpdateWeight={updateWeight}
            onUpdateLabel={updateLabel}
            onUpdateColor={updateColor}
            onAddSegment={addSegment}
            onRemoveSegment={removeSegment}
          />
        </div>
        <div className="wheel-container">
          <Wheel segments={segments} rotation={rotation} />
          <button className="spin-button" onClick={spin} disabled={isSpinning}>
            Spin
          </button>
          {winner && (
            <div className="winner-overlay">
              Result: {winner}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
