import { useCallback, useRef } from 'react';
import {
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent,
} from '@dnd-kit/core';
import type { Position } from '../types';

interface UseCanvasDraggableOptions {
  id: string;
  position: Position;
  data?: Record<string, unknown>;
  disabled?: boolean;
}

interface UseCanvasDraggableReturn {
  attributes: ReturnType<typeof useDraggable>['attributes'];
  listeners: ReturnType<typeof useDraggable>['listeners'];
  setNodeRef: ReturnType<typeof useDraggable>['setNodeRef'];
  transform: ReturnType<typeof useDraggable>['transform'];
  isDragging: boolean;
}

export const useCanvasDraggable = ({
  id,
  position,
  data = {},
  disabled = false,
}: UseCanvasDraggableOptions): UseCanvasDraggableReturn => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      position,
      ...data,
    },
    disabled,
  });

  return {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  };
};

interface UseCanvasDroppableOptions {
  id: string;
  data?: Record<string, unknown>;
  disabled?: boolean;
}

interface UseCanvasDroppableReturn {
  setNodeRef: ReturnType<typeof useDroppable>['setNodeRef'];
  isOver: boolean;
  active: ReturnType<typeof useDroppable>['active'];
}

export const useCanvasDroppable = ({
  id,
  data = {},
  disabled = false,
}: UseCanvasDroppableOptions): UseCanvasDroppableReturn => {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    data,
    disabled,
  });

  return {
    setNodeRef,
    isOver,
    active,
  };
};

interface DragState {
  activeId: string | null;
  delta: Position | null;
}

interface UseDragAndDropHandlersOptions {
  onDragStart?: (event: DragStartEvent) => void;
  onDragMove?: (event: DragMoveEvent) => void;
  onDragEnd: (elementId: string, newPosition: Position) => void;
  onDragCancel?: () => void;
}

interface UseDragAndDropHandlersReturn {
  handleDragStart: (event: DragStartEvent) => void;
  handleDragMove: (event: DragMoveEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

export const useDragAndDropHandlers = ({
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: UseDragAndDropHandlersOptions): UseDragAndDropHandlersReturn => {
  const dragStateRef = useRef<DragState>({
    activeId: null,
    delta: null,
  });

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      dragStateRef.current.activeId = active.id as string;
      
      const initialPosition = active.data.current?.position as Position | undefined;
      if (initialPosition) {
        dragStateRef.current.delta = { x: 0, y: 0 };
      }

      onDragStart?.(event);
    },
    [onDragStart]
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const { delta } = event;
      dragStateRef.current.delta = {
        x: delta.x,
        y: delta.y,
      };
      onDragMove?.(event);
    },
    [onDragMove]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const elementId = active.id as string;
      
      const initialPosition = active.data.current?.position as Position | undefined;
      
      if (initialPosition) {
        const newPosition: Position = {
          x: initialPosition.x + delta.x,
          y: initialPosition.y + delta.y,
        };
        
        onDragEnd(elementId, newPosition);
      }

      dragStateRef.current = {
        activeId: null,
        delta: null,
      };
    },
    [onDragEnd]
  );

  const handleDragCancel = useCallback(() => {
    dragStateRef.current = {
      activeId: null,
      delta: null,
    };
    onDragCancel?.();
  }, [onDragCancel]);

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleDragCancel,
  };
};

export const snapToGrid = (position: Position, gridSize: number = 10): Position => ({
  x: Math.round(position.x / gridSize) * gridSize,
  y: Math.round(position.y / gridSize) * gridSize,
});

export const constrainPosition = (
  position: Position,
  canvasWidth: number,
  canvasHeight: number,
  elementWidth: number = 0,
  elementHeight: number = 0
): Position => ({
  x: Math.max(0, Math.min(position.x, canvasWidth - elementWidth)),
  y: Math.max(0, Math.min(position.y, canvasHeight - elementHeight)),
});

export default useDragAndDropHandlers;
