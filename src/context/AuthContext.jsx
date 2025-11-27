import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/auth";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get fresh user profile
          const profileResult = await authService.getProfile();
          if (profileResult.success) {
            setUser(profileResult.user);
            setIsAuthenticated(true);
          } else {
            // Clear invalid auth data
            authService.clearAuthData();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear potentially corrupted auth data
        authService.clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      }
      
      throw new Error("Login failed");
    } catch (error) {
      console.error("Login error:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password, role = 'volunteer') => {
    try {
      setLoading(true);
      const result = await authService.register(name, email, password, role);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      }
      
      throw new Error("Registration failed");
    } catch (error) {
      console.error("Registration error:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Google OAuth login
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const urlResult = await authService.getGoogleAuthURL();
      
      if (urlResult.success) {
        // Redirect to Google OAuth
        window.location.href = urlResult.authUrl;
        return { success: true };
      }
      
      throw new Error("Failed to get Google auth URL");
    } catch (error) {
      console.error("Google login error:", error);
      setLoading(false);
      throw error;
    }
  };

  // Handle Google OAuth callback
  const handleGoogleCallback = async (code) => {
    try {
      setLoading(true);
      const result = await authService.handleGoogleCallback(code);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      }
      
      throw new Error("Google authentication failed");
    } catch (error) {
      console.error("Google callback error:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      const result = await authService.updateProfile(updates);
      
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      }
      
      throw new Error("Profile update failed");
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      return result;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && ['admin', 'superadmin'].includes(user.role);
  };

  // Get display name
  const getDisplayName = () => {
    return user ? (user.name || user.email?.split('@')[0] || 'User') : '';
  };

  // Make authenticated request
  const makeAuthenticatedRequest = async (url, options = {}) => {
    return authService.makeAuthenticatedRequest(url, options);
  };

  const contextValue = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    loginWithGoogle,
    handleGoogleCallback,
    updateProfile,
    changePassword,
    isAdmin,
    getDisplayName,
    makeAuthenticatedRequest,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
