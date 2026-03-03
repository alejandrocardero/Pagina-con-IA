import { useRef, useCallback, useState } from 'react';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import type { BoardElement, Position } from '../types';
import { snapToGrid } from '../hooks/useDragAndDrop';
import { useClipboard } from '../hooks/useClipboard';
import { CanvasElement } from './CanvasElement';
import { CanvasGrid } from './CanvasGrid';

interface CanvasProps {
  boardId?: string;
  elements: BoardElement[];
  onUpdateElementPosition: (elementId: string, position: Position) => void;
  onCreateFromClipboard: (content: string, x: number, y: number) => void;
  onSelectElement?: (element: BoardElement | null) => void;
  selectedElementId?: string | null;
  gridSize?: number;
  snapToGrid?: boolean;
  readonly?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({
  boardId: _boardId,
  elements,
  onUpdateElementPosition,
  onCreateFromClipboard,
  onSelectElement,
  selectedElementId,
  gridSize = 10,
  snapToGrid: shouldSnapToGrid = true,
  readonly = false,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverlayPosition, setDragOverlayPosition] = useState<Position | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveDragId(active.id as string);
    
    const element = elements.find((el) => el.id === active.id);
    if (element) {
      setDragOverlayPosition(element.position);
    }
  }, [elements]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { active, delta } = event;
    const element = elements.find((el) => el.id === active.id);
    
    if (element) {
      setDragOverlayPosition({
        x: element.position.x + delta.x,
        y: element.position.y + delta.y,
      });
    }
  }, [elements]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    const elementId = active.id as string;
    
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    let newPosition: Position = {
      x: element.position.x + delta.x,
      y: element.position.y + delta.y,
    };

    if (shouldSnapToGrid) {
      newPosition = snapToGrid(newPosition, gridSize);
    }

    newPosition = {
      x: Math.max(0, newPosition.x),
      y: Math.max(0, newPosition.y),
    };

    onUpdateElementPosition(elementId, newPosition);
    setActiveDragId(null);
    setDragOverlayPosition(null);
  }, [elements, onUpdateElementPosition, shouldSnapToGrid, gridSize]);

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
    setDragOverlayPosition(null);
  }, []);

  const handleElementClick = useCallback((element: BoardElement) => {
    if (!readonly && onSelectElement) {
      onSelectElement(element.id === selectedElementId ? null : element);
    }
  }, [readonly, onSelectElement, selectedElementId]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current && onSelectElement) {
      onSelectElement(null);
    }
  }, [onSelectElement]);

  useClipboard({
    onPaste: onCreateFromClipboard,
    enabled: !readonly,
    canvasRef: canvasRef as React.RefObject<HTMLElement>,
  });

  const activeElement = activeDragId 
    ? elements.find((el) => el.id === activeDragId) 
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToParentElement]}
    >
      <div
        ref={canvasRef}
        className={`
          relative w-full h-full overflow-hidden
          bg-slate-50 cursor-default select-none
          ${readonly ? 'cursor-default' : 'cursor-crosshair'}
        `}
        onClick={handleCanvasClick}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${shouldSnapToGrid ? '#e2e8f0' : 'transparent'} 1px, transparent 1px),
            linear-gradient(to bottom, ${shouldSnapToGrid ? '#e2e8f0' : 'transparent'} 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize * 2}px ${gridSize * 2}px`,
        }}
      >
        {shouldSnapToGrid && <CanvasGrid gridSize={gridSize * 2} />}

        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={element.id === selectedElementId}
            isDragging={element.id === activeDragId}
            onClick={() => handleElementClick(element)}
            disabled={readonly}
          />
        ))}

        {activeElement && dragOverlayPosition && (
          <div
            className="absolute pointer-events-none opacity-80 z-50"
            style={{
              transform: `translate3d(${dragOverlayPosition.x}px, ${dragOverlayPosition.y}px, 0)`,
            }}
          >
            <CanvasElement
              element={activeElement}
              isSelected={false}
              isDragging={true}
              isOverlay
              disabled
            />
          </div>
        )}

        {elements.length === 0 && !readonly && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg font-medium">Your canvas is empty</p>
              <p className="text-sm mt-1">Press Ctrl+V to paste a note from clipboard</p>
              <p className="text-sm">or drag elements from the sidebar</p>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
};

export default Canvas;