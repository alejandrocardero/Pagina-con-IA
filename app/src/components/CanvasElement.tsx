import React, { useMemo } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useCanvasDraggable } from '../hooks/useDragAndDrop';
import type { BoardElement } from '../types';

interface CanvasElementProps {
  element: BoardElement;
  isSelected: boolean;
  isDragging: boolean;
  isOverlay?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  isDragging,
  isOverlay = false,
  onClick,
  disabled = false,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useCanvasDraggable({
    id: element.id,
    position: element.position,
    data: {
      type: element.type,
      content: element.content,
    },
    disabled: disabled || isOverlay,
  });

  const style = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.position.x,
      top: element.position.y,
      width: element.size?.width || 200,
      height: element.size?.height || 'auto',
      zIndex: element.style?.zIndex || 1,
      transform: transform ? CSS.Translate.toString(transform) : undefined,
      transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    };

    return baseStyle;
  }, [element.position, element.size, element.style?.zIndex, transform, isDragging]);

  const renderContent = () => {
    switch (element.type) {
      case 'note':
        return <NoteElement element={element} />;
      case 'image':
        return <ImageElement element={element} />;
      case 'goal':
        return <GoalElement element={element} />;
      case 'text':
        return <TextElement element={element} />;
      case 'link':
        return <LinkElement element={element} />;
      default:
        return <NoteElement element={element} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${isDragging ? 'cursor-grabbing scale-105 shadow-lg' : 'cursor-grab'}
        ${disabled ? 'cursor-default' : ''}
        ${isOverlay ? 'shadow-2xl' : 'shadow-md hover:shadow-lg'}
        transition-shadow duration-200
      `}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      {renderContent()}
      
      {isSelected && !disabled && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
      )}
      
      {!disabled && !isOverlay && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      )}
    </div>
  );
};

const NoteElement: React.FC<{ element: BoardElement }> = ({ element }) => {
  const backgroundColor = element.style?.backgroundColor || '#fef3c7';
  const textColor = element.style?.textColor || '#1f2937';
  const fontSize = element.style?.fontSize || 14;
  const borderRadius = element.style?.borderRadius || 4;

  return (
    <div
      className="p-4 min-h-[100px] break-words"
      style={{
        backgroundColor,
        color: textColor,
        fontSize: `${fontSize}px`,
        borderRadius: `${borderRadius}px`,
        minWidth: '150px',
        maxWidth: '300px',
      }}
    >
      {element.title && (
        <h4 className="font-semibold mb-2 text-sm">{element.title}</h4>
      )}
      <p className="whitespace-pre-wrap">{element.content}</p>
    </div>
  );
};

const ImageElement: React.FC<{ element: BoardElement }> = ({ element }) => {
  const borderRadius = element.style?.borderRadius || 8;

  if (!element.imageUrl) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300"
        style={{
          width: element.size?.width || 200,
          height: element.size?.height || 150,
          borderRadius: `${borderRadius}px`,
        }}
      >
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: `${borderRadius}px`,
      }}
    >
      <img
        src={element.imageUrl}
        alt={element.title || 'Image'}
        className="w-full h-full object-cover"
        style={{
          width: element.size?.width || 200,
          height: element.size?.height || 150,
        }}
        loading="lazy"
      />
      {element.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
          {element.title}
        </div>
      )}
    </div>
  );
};

const GoalElement: React.FC<{ element: BoardElement }> = ({ element }) => {
  const backgroundColor = element.style?.backgroundColor || '#d1fae5';
  const textColor = element.style?.textColor || '#065f46';
  const borderRadius = element.style?.borderRadius || 8;
  const progress = (element.metadata?.progress as number) || 0;

  return (
    <div
      className="p-4"
      style={{
        backgroundColor,
        color: textColor,
        borderRadius: `${borderRadius}px`,
        minWidth: '200px',
        maxWidth: '280px',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <h4 className="font-semibold">{element.title || 'Goal'}</h4>
      </div>
      <p className="text-sm mb-3">{element.content}</p>
      
      <div className="w-full bg-white/50 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs mt-1 block">{progress}% complete</span>
    </div>
  );
};

const TextElement: React.FC<{ element: BoardElement }> = ({ element }) => {
  const textColor = element.style?.textColor || '#1f2937';
  const fontSize = element.style?.fontSize || 16;
  const fontWeight = element.style?.fontWeight || 'normal';

  return (
    <div
      className="p-2"
      style={{
        color: textColor,
        fontSize: `${fontSize}px`,
        fontWeight,
        minWidth: '100px',
        maxWidth: '400px',
      }}
    >
      <p className="whitespace-pre-wrap">{element.content}</p>
    </div>
  );
};

const LinkElement: React.FC<{ element: BoardElement }> = ({ element }) => {
  const backgroundColor = element.style?.backgroundColor || '#eff6ff';
  const borderRadius = element.style?.borderRadius || 8;
  const url = (element.metadata?.url as string) || element.content || '#';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 hover:bg-blue-100 transition-colors"
      style={{
        backgroundColor,
        borderRadius: `${borderRadius}px`,
        minWidth: '200px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-blue-700 truncate">{element.title || 'Link'}</p>
          <p className="text-sm text-blue-500 truncate">{url}</p>
        </div>
      </div>
    </a>
  );
};

export default CanvasElement;
