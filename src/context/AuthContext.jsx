import React, { createContext, useContext, useState, useEffect } from 'react';
import { CURRENT_USER } from '../data/mockSocialData';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Password strength calculation helper
export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 1, label: 'Fair', color: 'bg-yellow-500', feedback: [] };

  const feedback = [];
  let score = 1;

  if (password.length >= 6) {
    score += 1;
  }
  if (/[0-9]/.test(password)) {
    score += 1;
  }
  if (/[!@#$%^&*()_+\-=[\]{}|;:'",.<>/?]/.test(password) || /[A-Z]/.test(password)) {
    score += 1;
  }

  const levels = [
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-yellow-500' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong & Secure', color: 'bg-emerald-500' },
    { label: 'Ultra Secure', color: 'bg-purple-500' },
  ];

  return {
    score,
    percent: (score / 4) * 100,
    label: levels[Math.min(score, 4)].label,
    color: levels[Math.min(score, 4)].color,
    feedback,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('linkup_auth_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('linkup_auth_user') || true;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [googleAuthModalOpen, setGoogleAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'

  useEffect(() => {
    if (user) {
      localStorage.setItem('linkup_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('linkup_auth_user');
    }
  }, [user]);

  // Login accepting username OR email OR demo bypass
  const login = (identifier, password) => {
    if (typeof identifier === 'object' && identifier !== null) {
      setUser(identifier);
      setIsAuthenticated(true);
      setAuthModalOpen(false);
      setGoogleAuthModalOpen(false);
      return identifier;
    }

    const cleanIdentifier = (identifier || 'ashok.lingaraddi').trim();

    // Check if user exists in saved registered accounts
    const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
    const foundUser = savedDb.find(
      (u) =>
        u.username?.toLowerCase() === cleanIdentifier.toLowerCase() ||
        u.email?.toLowerCase() === cleanIdentifier.toLowerCase()
    );

    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      setAuthModalOpen(false);
      setGoogleAuthModalOpen(false);
      return foundUser;
    }

    // Default synthesized account from email / identifier
    const isEmail = cleanIdentifier.includes('@');
    const derivedName = isEmail
      ? cleanIdentifier.split('@')[0].replace(/[._]/g, ' ')
      : cleanIdentifier;
    const derivedUsername = isEmail
      ? cleanIdentifier.split('@')[0].toLowerCase()
      : cleanIdentifier.toLowerCase().replace(/\s+/g, '.');

    const newUser = {
      ...CURRENT_USER,
      id: `user-${Date.now()}`,
      name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
      username: derivedUsername,
      email: isEmail ? cleanIdentifier : `${cleanIdentifier.toLowerCase()}@gmail.com`,
    };

    setUser(newUser);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setGoogleAuthModalOpen(false);
    return newUser;
  };

  // Signup with full fallbacks
  const signup = ({ name, username, email, password, dob, gender, avatar }) => {
    const effectiveName = (name || username || 'New LinkUp User').trim();
    const effectiveUsername = (username || effectiveName.toLowerCase().replace(/\s+/g, '.') || `user_${Date.now().toString().slice(-4)}`).trim().toLowerCase();
    const effectiveEmail = (email || `${effectiveUsername}@gmail.com`).trim().toLowerCase();
    const effectivePassword = password || 'Linkup@2026';

    const newUser = {
      id: `user-${Date.now()}`,
      name: effectiveName,
      username: effectiveUsername,
      email: effectiveEmail,
      password: effectivePassword,
      dob: dob || '2003-01-01',
      gender: gender || 'Not specified',
      avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80`,
      coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      bio: 'Excited to be on LinkUp! Connecting, sharing, and listening to regional tunes 🎶',
      role: 'LinkUp Creator',
      subtitle: 'New Community Member',
      website: `linkup.dev/${effectiveUsername}`,
      work: 'LinkUp Member',
      education: '',
      hometown: 'Bengaluru, India',
      relationshipStatus: 'Single',
      joinedDate: 'Joined Today',
      postsCount: 0,
      friendsCount: 0,
      followingCount: 0,
      twoFactorEnabled: false,
      highlights: [
        { id: 'hl-1', name: 'Life', icon: '🌴', color: 'border-emerald-500/80' },
        { id: 'hl-2', name: 'Music', icon: '🎵', color: 'border-purple-500/80' },
      ],
      gallery: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
      ],
      privacy: {
        work: 'Public',
        education: 'Friends',
        hometown: 'Public',
        relationship: 'Only Me',
        postsDefault: 'Public',
      },
    };

    // Save to registered accounts list in localStorage
    const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
    savedDb.unshift(newUser);
    localStorage.setItem('linkup_registered_users', JSON.stringify(savedDb));

    setUser(newUser);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setGoogleAuthModalOpen(false);
    return newUser;
  };

  // Google OAuth Login with custom or default Gmail
  const loginWithGoogle = (customEmail = null, customName = null, customAvatar = null) => {
    const email = (customEmail || 'amruth.sai@gmail.com').trim().toLowerCase();
    const name = customName || email.split('@')[0].replace(/[._]/g, ' ');
    const username = email.split('@')[0].toLowerCase().replace(/\s+/g, '.');

    const googleUser = {
      id: `google-${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      username: username,
      email: email,
      avatar: customAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
      coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      bio: `Signed in via Google account (${email}) 🌟`,
      role: 'Verified Google User',
      subtitle: 'LinkUp Member',
      website: `linkup.dev/${username}`,
      work: 'Verified Google Account',
      education: '',
      hometown: 'Bengaluru, India',
      relationshipStatus: 'Single',
      joinedDate: 'Joined Today',
      postsCount: 0,
      friendsCount: 5,
      followingCount: 12,
      twoFactorEnabled: false,
      highlights: [
        { id: 'hl-1', name: 'Life', icon: '🌴', color: 'border-emerald-500/80' },
      ],
      gallery: [],
      privacy: {
        work: 'Public',
        education: 'Friends',
        hometown: 'Public',
        relationship: 'Only Me',
        postsDefault: 'Public',
      },
    };

    // Save to registered database
    const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
    savedDb.unshift(googleUser);
    localStorage.setItem('linkup_registered_users', JSON.stringify(savedDb));

    setUser(googleUser);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setGoogleAuthModalOpen(false);
    return googleUser;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('linkup_auth_user');
  };

  const updateUserProfile = (updatedFields) => {
    setUser((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  const toggle2FA = () => {
    setUser((prev) => ({
      ...prev,
      twoFactorEnabled: !prev?.twoFactorEnabled,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authModalOpen,
        setAuthModalOpen,
        googleAuthModalOpen,
        setGoogleAuthModalOpen,
        authMode,
        setAuthMode,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUserProfile,
        toggle2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
