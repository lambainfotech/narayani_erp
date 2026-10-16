import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSession, ApiConfiguration, CaptchaChallenge } from '../types/erp';
import {
  getStoredAuth,
  saveAuthSession,
  clearAuthSession,
  getStoredApiConfig,
  saveApiConfig,
  DEFAULT_API_CONFIG,
  erpApi,
} from '../services/api';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: {
    username: string;
    password: string;
    institution_id?: number | null;
    portal?: string | null;
    captcha?: CaptchaChallenge | null;
    rememberMe?: boolean;
  }) => Promise<{
    success: boolean;
    error?: string;
    twoFactorRequired?: boolean;
  }>;
  logout: () => Promise<void>;
  apiConfig: ApiConfiguration;
  setApiConfig: (config: ApiConfiguration) => void;
  resetApiConfig: () => void;
  connectionStatus: 'checking' | 'connected' | 'offline';
  connectionLatency: number | null;
  testConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initialization prevents blank screen on first turn
  const initialAuth = getStoredAuth();
  const [user, setUser] = useState<UserSession | null>(() => {
    if (initialAuth.user && initialAuth.user.expiresAt && initialAuth.user.expiresAt > Date.now()) {
      return initialAuth.user;
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    if (initialAuth.user && initialAuth.user.expiresAt && initialAuth.user.expiresAt > Date.now()) {
      return initialAuth.token;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiConfig, setApiConfigState] = useState<ApiConfiguration>(getStoredApiConfig());
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'offline'>('connected');
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);

  const testConnection = useCallback(async () => {
    try {
      const result = await erpApi.testConnection();
      setConnectionLatency(result.latencyMs);
      setConnectionStatus(result.success ? 'connected' : 'offline');
    } catch {
      setConnectionStatus('offline');
    }
  }, []);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  const login = async (params: {
    username: string;
    password: string;
    institution_id?: number | null;
    portal?: string | null;
    captcha?: CaptchaChallenge | null;
    rememberMe?: boolean;
  }) => {
    setIsLoading(true);
    try {
      const result = await erpApi.login(params);
      if (result.success && result.session) {
        setUser(result.session);
        setToken(result.session.token);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return {
        success: false,
        error: result.error || 'Invalid credentials or login failed',
        twoFactorRequired: result.twoFactorRequired,
      };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Network error connecting to ndedu.in' };
    }
  };

  const logout = async () => {
    await erpApi.logout();
    setUser(null);
    setToken(null);
  };

  const setApiConfig = (newConfig: ApiConfiguration) => {
    saveApiConfig(newConfig);
    setApiConfigState(newConfig);
    testConnection();
  };

  const resetApiConfig = () => {
    saveApiConfig(DEFAULT_API_CONFIG);
    setApiConfigState(DEFAULT_API_CONFIG);
    testConnection();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        apiConfig,
        setApiConfig,
        resetApiConfig,
        connectionStatus,
        connectionLatency,
        testConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
