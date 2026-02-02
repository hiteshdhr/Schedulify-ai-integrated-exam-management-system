import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define Preference and Academic types
interface UserPreferences {
  studyLength: number;
  breakLength: number;
  preferredTime: string;
}

interface AcademicDetails {
  institution?: string;
  branch?: string;
  semester?: number;
}

// Define the shape of the user object
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string; 
  preferences: UserPreferences; 
  academicDetails: AcademicDetails; 
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: any) => void;
  signup: (data: any) => void;
  logout: () => void;
  updateUser: (user: User) => void; 
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          // Fetch user data using the token
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user');
          }

          const responseData = await response.json();
          if (responseData.success) {
            setUser(responseData.data); // This will now include academicDetails
          } else {
            throw new Error(responseData.message || 'Failed to verify token');
          }
        } catch (error) {
          console.error('Auth error:', error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          navigate('/auth/login');
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token, navigate]);

  const handleAuthSuccess = (data: any, successMessage: string) => {
    const { token, data: userData } = data;
    
    localStorage.setItem('authToken', token);
    setToken(token);
    setUser(userData);
    toast.success(successMessage);
    navigate('/app/dashboard');
  };

  const login = (data: any) => {
    handleAuthSuccess(data, 'Login successful! Redirecting...');
  };
  
  const signup = (data: any) => {
    handleAuthSuccess(data, 'Account created successfully! Redirecting...');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    toast.success('You have been logged out.');
    navigate('/auth/login');
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, updateUser }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};