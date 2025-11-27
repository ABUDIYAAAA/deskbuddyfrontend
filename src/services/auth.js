// Custom authentication service to replace Firebase
class AuthService {
  constructor() {
    this.API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.TOKEN_KEY = 'deskbuddy_token';
    this.REFRESH_TOKEN_KEY = 'deskbuddy_refresh_token';
    this.USER_KEY = 'deskbuddy_user';
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get stored refresh token
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Get stored user data
  getUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Store authentication data
  storeAuthData(token, refreshToken, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Login with email and password
  async login(email, password) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store authentication data
      this.storeAuthData(data.token, data.refreshToken, data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register new user
  async register(name, email, password, role = 'volunteer') {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store authentication data
      this.storeAuthData(data.token, data.refreshToken, data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        // Call backend logout endpoint
        await fetch(`${this.API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      this.clearAuthData();
    }
  }

  // Refresh authentication token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed');
      }

      // Store new authentication data
      this.storeAuthData(data.token, data.refreshToken, data.user);

      return { success: true, token: data.token, user: data.user };
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear invalid tokens
      this.clearAuthData();
      throw error;
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${this.API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try to refresh
          await this.refreshToken();
          // Retry the request
          return this.getProfile();
        }
        throw new Error(data.error || 'Failed to get profile');
      }

      // Update stored user data
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${this.API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshToken();
          return this.updateProfile(updates);
        }
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update stored user data
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${this.API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshToken();
          return this.changePassword(currentPassword, newPassword);
        }
        throw new Error(data.error || 'Failed to change password');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Google OAuth - get auth URL
  async getGoogleAuthURL() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/google/url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get Google auth URL');
      }

      return { success: true, authUrl: data.authUrl };
    } catch (error) {
      console.error('Get Google auth URL error:', error);
      throw error;
    }
  }

  // Google OAuth - handle callback with code
  async handleGoogleCallback(code) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/google/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Google authentication failed');
      }

      // Store authentication data
      this.storeAuthData(data.token, data.refreshToken, data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Google callback error:', error);
      throw error;
    }
  }

  // Make authenticated API request
  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      if (response.status === 401) {
        // Token might be expired, try to refresh
        await this.refreshToken();
        
        // Retry with new token
        const newToken = this.getToken();
        const retryOptions = {
          ...defaultOptions,
          ...options,
          headers: {
            ...defaultOptions.headers,
            'Authorization': `Bearer ${newToken}`,
            ...(options.headers || {}),
          },
        };
        
        return fetch(url, retryOptions);
      }

      return response;
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  }

  // Check if user is admin
  isAdmin() {
    const user = this.getUser();
    return user && ['admin', 'superadmin'].includes(user.role);
  }

  // Get user display name
  getDisplayName() {
    const user = this.getUser();
    return user ? (user.name || user.email?.split('@')[0] || 'User') : '';
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;