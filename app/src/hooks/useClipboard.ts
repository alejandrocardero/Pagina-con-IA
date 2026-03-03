import { useEffect, useCallback, useRef } from 'react';

interface UseClipboardOptions {
  onPaste: (content: string, x: number, y: number) => void | Promise<void>;
  enabled?: boolean;
  canvasRef: React.RefObject<HTMLElement>;
}

interface UseClipboardReturn {
  isEnabled: boolean;
}

export const useClipboard = ({
  onPaste,
  enabled = true,
  canvasRef,
}: UseClipboardOptions): UseClipboardReturn => {
  const lastMousePosition = useRef<{ x: number; y: number }>({ x: 100, y: 100 });

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      lastMousePosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, canvasRef]);

  useEffect(() => {
    if (!enabled) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused = 
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      if (isInputFocused) return;

      e.preventDefault();

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      let content = clipboardData.getData('text/plain');

      if (!content.trim()) {
        content = clipboardData.getData('text/html');
      }

      if (content.trim()) {
        await onPaste(content, lastMousePosition.current.x, lastMousePosition.current.y);
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [enabled, onPaste]);

  return {
    isEnabled: enabled,
  };
};

export const useCopyToClipboard = (): {
  copy: (text: string) => Promise<boolean>;
} => {
  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }, []);

  return { copy };
};

export default useClipboard;
