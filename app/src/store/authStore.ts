import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (data: Partial<User>) => void;
}

// Simulated users database (in memory + localStorage)
const getStoredUsers = (): Record<string, { password: string; user: User }> => {
  const stored = localStorage.getItem('visionboard_users');
  return stored ? JSON.parse(stored) : {};
};

const saveUsers = (users: Record<string, { password: string; user: User }>) => {
  localStorage.setItem('visionboard_users', JSON.stringify(users));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const users = getStoredUsers();
        const userData = users[email.toLowerCase()];
        
        if (!userData) {
          set({ isLoading: false, error: 'User not found. Please check your email or register.' });
          throw new Error('User not found');
        }
        
        if (userData.password !== password) {
          set({ isLoading: false, error: 'Incorrect password. Please try again.' });
          throw new Error('Invalid password');
        }
        
        set({ 
          user: userData.user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null
        });
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const users = getStoredUsers();
        
        if (users[email.toLowerCase()]) {
          set({ isLoading: false, error: 'Email already registered. Please use a different email or login.' });
          throw new Error('Email already exists');
        }
        
        const newUser: User = {
          id: crypto.randomUUID(),
          name,
          email: email.toLowerCase(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          createdAt: new Date().toISOString(),
        };
        
        users[email.toLowerCase()] = { password, user: newUser };
        saveUsers(users);
        
        set({ 
          user: newUser, 
          isAuthenticated: true, 
          isLoading: false,
          error: null
        });
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },

      clearError: () => {
        set({ error: null });
      },

      updateProfile: (data: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...data };
          set({ user: updatedUser });
          
          // Update in users database
          const users = getStoredUsers();
          if (users[user.email]) {
            users[user.email].user = updatedUser;
            saveUsers(users);
          }
        }
      },
    }),
    {
      name: 'visionboard_auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Demo account for quick testing
export const setupDemoAccount = () => {
  const users = getStoredUsers();
  if (!users['demo@visionboard.ai']) {
    users['demo@visionboard.ai'] = {
      password: 'demo123',
      user: {
        id: 'demo-user-id',
        name: 'Demo User',
        email: 'demo@visionboard.ai',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        createdAt: new Date().toISOString(),
      }
    };
    saveUsers(users);
  }
};

export default useAuthStore;
