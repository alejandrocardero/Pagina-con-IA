import React from 'react';

interface CanvasGridProps {
  gridSize?: number;
  color?: string;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({
  gridSize = 20,
  color = '#e2e8f0',
}) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        opacity: 0.5,
      }}
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
};

export default CanvasGrid;
