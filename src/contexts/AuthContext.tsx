import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'student' | 'teacher';

interface User {
  id?: string;
  name: string;
  email: string;
  profileImage?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole, profileImage?: string | null) => Promise<boolean>;
  logout: () => void;
  isTeacher: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "http://localhost:8000"; // Ensure this matches your backend URL

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) { // Ensure both user and token exist for a valid session
      setUser(JSON.parse(storedUser));
    } else {
      // If one is missing, clear both to be safe
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Log error details from backend if available
        const errorData = await response.json().catch(() => ({ detail: "Login failed" }));
        console.error('Login failed:', errorData.detail);
        setIsLoading(false);
        return false;
      }

      const data = await response.json();
      // Backend returns: { token, profileImage, role, name }
      const loggedInUser: User = {
        name: data.name,
        email: email, // email is known from input
        profileImage: data.profileImage,
        role: data.role,
      };

      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('token', data.token);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole, 
    profileImage?: string | null
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role, profileImage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Signup failed" }));
        console.error('Signup failed:', errorData.detail);
        setIsLoading(false);
        return false;
      }
      
      // Backend returns: {"message": "Signup successful"}
      // User will need to login separately after signup
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // Clear all user-related data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('role');
    localStorage.removeItem('userProfileImage');
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, isTeacher }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
