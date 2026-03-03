import { useState, useCallback, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { UserMenu } from './components/UserMenu';
import { useAuthStore, setupDemoAccount } from './store/authStore';
import type { BoardElement, Position, ElementType } from './types';

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Sample initial elements
const initialElements: BoardElement[] = [
  {
    id: '1',
    boardId: 'demo',
    type: 'note',
    content: 'Welcome to VisionBoard AI! 🎉\n\nDrag me around to organize your ideas.',
    title: 'Getting Started',
    position: { x: 100, y: 100 },
    size: { width: 220, height: 150 },
    style: {
      backgroundColor: '#fef3c7',
      textColor: '#1f2937',
      fontSize: 14,
      borderRadius: 8,
      zIndex: 1,
    },
    imageUrl: null,
    metadata: null,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    boardId: 'demo',
    type: 'goal',
    content: 'Complete the MVP development',
    title: 'Q1 Goal',
    position: { x: 400, y: 80 },
    size: { width: 250, height: 140 },
    style: {
      backgroundColor: '#d1fae5',
      textColor: '#065f46',
      borderRadius: 8,
      zIndex: 1,
    },
    imageUrl: null,
    metadata: { progress: 75 },
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    boardId: 'demo',
    type: 'note',
    content: 'Press Ctrl+V anywhere on the canvas to paste a new note! 📋',
    title: 'Pro Tip',
    position: { x: 150, y: 320 },
    size: { width: 200, height: 120 },
    style: {
      backgroundColor: '#dbeafe',
      textColor: '#1e40af',
      fontSize: 13,
      borderRadius: 8,
      zIndex: 1,
    },
    imageUrl: null,
    metadata: null,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    boardId: 'demo',
    type: 'image',
    content: null,
    title: 'Inspiration',
    position: { x: 450, y: 280 },
    size: { width: 200, height: 150 },
    style: {
      borderRadius: 12,
      zIndex: 1,
    },
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=300&fit=crop',
    metadata: null,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    boardId: 'demo',
    type: 'text',
    content: 'VisionBoard AI - Organize your ideas creatively',
    title: null,
    position: { x: 700, y: 150 },
    size: { width: 300, height: 60 },
    style: {
      textColor: '#4b5563',
      fontSize: 18,
      fontWeight: '600',
      zIndex: 1,
    },
    imageUrl: null,
    metadata: null,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function App() {
  const [elements, setElements] = useState<BoardElement[]>(initialElements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Setup demo account on mount
  useEffect(() => {
    setupDemoAccount();
  }, []);

  // Update element position
  const handleUpdatePosition = useCallback((elementId: string, position: Position) => {
    setElements((prev) =>
      prev.map((el) =>
        el.id === elementId ? { ...el, position, updatedAt: new Date().toISOString() } : el
      )
    );
  }, []);

  // Create element from clipboard
  const handleCreateFromClipboard = useCallback((content: string, x: number, y: number) => {
    const newElement: BoardElement = {
      id: generateId(),
      boardId: 'demo',
      type: 'note',
      content: content.slice(0, 500),
      title: null,
      position: { x: Math.max(0, x - 100), y: Math.max(0, y - 50) },
      size: { width: 200, height: 150 },
      style: {
        backgroundColor: '#fef3c7',
        textColor: '#1f2937',
        fontSize: 14,
        borderRadius: 8,
        zIndex: elements.length + 1,
      },
      imageUrl: null,
      metadata: null,
      order: elements.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setElements((prev) => [...prev, newElement]);
  }, [elements.length]);

  // Add new element
  const handleAddElement = useCallback((type: ElementType) => {
    const colors: Record<ElementType, string> = {
      note: '#fef3c7',
      goal: '#d1fae5',
      image: '#f3f4f6',
      text: 'transparent',
      link: '#eff6ff',
    };

    const newElement: BoardElement = {
      id: generateId(),
      boardId: 'demo',
      type,
      content: type === 'note' ? 'New note' : type === 'goal' ? 'New goal' : 'New text',
      title: type === 'goal' ? 'Goal' : null,
      position: { 
        x: 100 + Math.random() * 300, 
        y: 100 + Math.random() * 200 
      },
      size: { width: type === 'image' ? 200 : 220, height: type === 'image' ? 150 : 120 },
      style: {
        backgroundColor: colors[type],
        textColor: '#1f2937',
        fontSize: 14,
        borderRadius: 8,
        zIndex: elements.length + 1,
      },
      imageUrl: type === 'image' ? `https://picsum.photos/400/300?random=${Date.now()}` : null,
      metadata: type === 'goal' ? { progress: 0 } : null,
      order: elements.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setElements((prev) => [...prev, newElement]);
  }, [elements.length]);

  // Delete selected element
  const handleDeleteElement = useCallback(() => {
    if (selectedElementId) {
      setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
      setSelectedElementId(null);
    }
  }, [selectedElementId]);

  // Clear all elements
  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to clear all elements?')) {
      setElements([]);
      setSelectedElementId(null);
    }
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Show auth forms if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md">
          {showLogin ? (
            <LoginForm onToggleForm={() => setShowLogin(false)} />
          ) : (
            <RegisterForm onToggleForm={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    );
  }

  // Main app (authenticated)
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">VisionBoard AI</h1>
            </div>
            <span className="text-sm text-gray-500 hidden sm:inline">Demo Board</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Toolbar */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleAddElement('note')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all flex items-center gap-1"
                title="Add Note"
              >
                <span>📝</span>
                <span className="hidden sm:inline">Note</span>
              </button>
              <button
                onClick={() => handleAddElement('goal')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all flex items-center gap-1"
                title="Add Goal"
              >
                <span>🎯</span>
                <span className="hidden sm:inline">Goal</span>
              </button>
              <button
                onClick={() => handleAddElement('image')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all flex items-center gap-1"
                title="Add Image"
              >
                <span>🖼️</span>
                <span className="hidden sm:inline">Image</span>
              </button>
              <button
                onClick={() => handleAddElement('text')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all flex items-center gap-1"
                title="Add Text"
              >
                <span>📄</span>
                <span className="hidden sm:inline">Text</span>
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Actions */}
            {selectedElementId && (
              <button
                onClick={handleDeleteElement}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete selected"
              >
                🗑️
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Clear all"
            >
              Clear
            </button>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Help"
            >
              ❓
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <Canvas
          boardId="demo"
          elements={elements}
          onUpdateElementPosition={handleUpdatePosition}
          onCreateFromClipboard={handleCreateFromClipboard}
          onSelectElement={(el) => setSelectedElementId(el?.id || null)}
          selectedElementId={selectedElementId}
          gridSize={10}
          snapToGrid={true}
        />

        {/* Help Panel */}
        {showHelp && (
          <div className="absolute top-4 right-4 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 animate-fade-in z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">How to use</h3>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span><strong>Drag</strong> elements to move them around</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span><strong>Click</strong> to select an element</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span><strong>Ctrl+V</strong> to paste a note from clipboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span><strong>Click canvas</strong> to deselect</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Use toolbar to add new elements</span>
              </li>
            </ul>
          </div>
        )}

        {/* Welcome Toast */}
        {user && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md border border-gray-200 px-4 py-3 animate-fade-in">
            <p className="text-sm text-gray-700">
              Welcome back, <span className="font-semibold">{user.name}</span>! 👋
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>{elements.length} element{elements.length !== 1 ? 's' : ''}</span>
            {selectedElementId && (
              <span className="text-blue-600">
                Selected: {elements.find(e => e.id === selectedElementId)?.type}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>Grid: 10px</span>
            <span>Snap: On</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
