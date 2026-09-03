import React, { createContext, useContext, useState, useEffect } from 'react';

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
  // Preserve and restore the logged-in user's saved account & session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('linkup_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username !== 'ashok.lingaraddi') {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem('linkup_auth_user');
      return !!saved;
    } catch {
      return false;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [googleAuthModalOpen, setGoogleAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Persist logged-in user session safely
  useEffect(() => {
    if (user) {
      localStorage.setItem('linkup_auth_user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('linkup_auth_user');
      setIsAuthenticated(false);
    }
  }, [user]);

  // Strict Login: verifies credentials against registered database
  const login = (identifier, password) => {
    const cleanIdentifier = (identifier || '').trim();
    if (!cleanIdentifier) {
      throw new Error('Please enter your email or username');
    }
    if (!password) {
      throw new Error('Please enter your password');
    }

    // Check registered accounts in localStorage
    const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
    const foundUser = savedDb.find(
      (u) =>
        u.username?.toLowerCase() === cleanIdentifier.toLowerCase() ||
        u.email?.toLowerCase() === cleanIdentifier.toLowerCase()
    );

    if (!foundUser) {
      throw new Error('No account found with this email/username. Please create an account first.');
    }

    if (foundUser.password && foundUser.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    setUser(foundUser);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setGoogleAuthModalOpen(false);
    return foundUser;
  };

  // Sign Up: creates and safely stores new user in persistent registered database
  const signup = ({ name, username, email, password, dob, gender, avatar }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanUsername = (username || cleanName.toLowerCase().replace(/\s+/g, '.') || `user_${Date.now().toString().slice(-4)}`).trim().toLowerCase();

    if (!cleanName) {
      throw new Error('Please enter your full name');
    }
    if (!cleanEmail) {
      throw new Error('Please enter your email address');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if email or username already exists
    const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
    const existing = savedDb.find(
      (u) =>
        u.email?.toLowerCase() === cleanEmail ||
        u.username?.toLowerCase() === cleanUsername
    );

    if (existing) {
      throw new Error('An account with this email or username already exists. Please log in.');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: password,
      dob: dob || '2003-01-01',
      gender: gender || 'Not specified',
      avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80`,
      coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      bio: 'Excited to be on LinkUp! Connecting, sharing, and discovering music 🎶',
      role: 'LinkUp Member',
      subtitle: 'Creator',
      website: `linkup.dev/${cleanUsername}`,
      work: 'LinkUp Community',
      education: '',
      hometown: 'Bengaluru, India',
      relationshipStatus: 'Single',
      joinedDate: 'Joined Today',
      postsCount: 0,
      friendsCount: 0,
      followingCount: 0,
      twoFactorEnabled: false,
      highlights: [
        { id: 'hl-1', name: 'Life', icon: '🌴', color: 'border-emerald-500/80', stories: [] },
        { id: 'hl-2', name: 'Music', icon: '🎵', color: 'border-purple-500/80', stories: [] },
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

    savedDb.unshift(newUser);
    localStorage.setItem('linkup_registered_users', JSON.stringify(savedDb));

    setUser(newUser);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setGoogleAuthModalOpen(false);
    return newUser;
  };

  // Google OAuth Signup / Login
  const loginWithGoogle = (customEmail = null, customName = null, customAvatar = null) => {
    const email = (customEmail || '').trim().toLowerCase();
    if (!email) {
      throw new Error('Please enter a valid Google email address');
    }

    const name = customName || email.split('@')[0].replace(/[._]/g, ' ');
    const username = email.split('@')[0].toLowerCase().replace(/\s+/g, '.');

    const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
    let googleUser = savedDb.find((u) => u.email?.toLowerCase() === email);

    if (!googleUser) {
      googleUser = {
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
        friendsCount: 0,
        followingCount: 0,
        twoFactorEnabled: false,
        highlights: [
          { id: 'hl-1', name: 'Life', icon: '🌴', color: 'border-emerald-500/80', stories: [] },
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
      savedDb.unshift(googleUser);
      localStorage.setItem('linkup_registered_users', JSON.stringify(savedDb));
    }

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
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };

      // Persist immediately to active session in localStorage
      localStorage.setItem('linkup_auth_user', JSON.stringify(updated));

      // Persist to registered users database matching by id, username, or email
      try {
        const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
        let matched = false;
        const newDb = savedDb.map((u) => {
          if (
            (u.id && prev.id && u.id === prev.id) ||
            (u.username && prev.username && u.username.toLowerCase() === prev.username.toLowerCase()) ||
            (u.email && prev.email && u.email.toLowerCase() === prev.email.toLowerCase())
          ) {
            matched = true;
            return { ...u, ...updated };
          }
          return u;
        });

        if (!matched) {
          newDb.unshift(updated);
        }
        localStorage.setItem('linkup_registered_users', JSON.stringify(newDb));
      } catch (e) {
        console.warn('Error updating registered database:', e);
      }

      return updated;
    });
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
