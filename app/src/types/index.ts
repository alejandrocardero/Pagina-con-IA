// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Board Types
export type BoardVisibility = 'private' | 'shared' | 'public';

export interface Board {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  visibility: BoardVisibility;
  settings: Record<string, unknown> | null;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
  elementCount?: number;
}

export interface BoardListResponse {
  boards: Board[];
  total: number;
}

export interface CreateBoardData {
  title: string;
  description?: string;
  visibility?: BoardVisibility;
  settings?: Record<string, unknown>;
}

export interface UpdateBoardData {
  title?: string;
  description?: string;
  visibility?: BoardVisibility;
  settings?: Record<string, unknown>;
}

// Element Types
export type ElementType = 'note' | 'image' | 'goal' | 'text' | 'link';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
  zIndex?: number;
  rotation?: number;
}

export interface BoardElement {
  id: string;
  boardId: string;
  type: ElementType;
  content: string | null;
  title: string | null;
  position: Position;
  size: Size | null;
  style: ElementStyle | null;
  imageUrl: string | null;
  metadata: Record<string, unknown> | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateElementData {
  type: ElementType;
  content?: string;
  title?: string;
  position: Position;
  size?: Size;
  style?: ElementStyle;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  order?: number;
}

export interface UpdateElementData {
  content?: string;
  title?: string;
  position?: Position;
  size?: Size;
  style?: ElementStyle;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  order?: number;
}

export interface UpdatePositionData {
  x: number;
  y: number;
}

export interface BatchPositionUpdate {
  id: string;
  position: Position;
}

export interface BatchUpdatePositionsData {
  updates: BatchPositionUpdate[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    path: string;
    [key: string]: unknown;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  details?: Record<string, unknown>;
}

// Canvas Types
export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface DragItem {
  id: string;
  type: ElementType;
  position: Position;
}

export interface DropResult {
  active: {
    id: string;
    data: {
      current: {
        position: Position;
        [key: string]: unknown;
      };
    };
  };
  delta: {
    x: number;
    y: number;
  };
}
