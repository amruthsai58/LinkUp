import React, { createContext, useContext, useState, useEffect } from 'react';
import { realtime } from '../services/realtimeService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to generate a standardized LinkUp ID
export const generateLinkUpId = (username = 'user') => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  const numeric = Math.abs(hash) % 90000 + 10000;
  return `LK-${numeric}`;
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

// Normalize email for strict Gmail comparison (e.g. ignoring dots and plus-tags for @gmail.com)
export const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  const clean = email.trim().toLowerCase();
  const atIndex = clean.indexOf('@');
  if (atIndex === -1) return clean;
  const local = clean.slice(0, atIndex);
  const domain = clean.slice(atIndex + 1);
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const baseLocal = local.split('+')[0].replace(/\./g, '');
    return `${baseLocal}@gmail.com`;
  }
  return `${local}@${domain}`;
};

export const AuthProvider = ({ children }) => {
  // Preserve and restore the logged-in user's saved account & session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('linkup_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username) {
          if (!parsed.linkupId) {
            parsed.linkupId = generateLinkUpId(parsed.username);
          }
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

  // Persist logged-in user session safely and connect to Realtime Network
  useEffect(() => {
    try {
      if (user) {
        // Guarantee linkupId exists
        if (!user.linkupId) {
          user.linkupId = generateLinkUpId(user.username);
        }
        localStorage.setItem('linkup_auth_user', JSON.stringify(user));
        setIsAuthenticated(true);
        // Connect to WebRTC P2P and Broadcast network
        realtime.init(user);
      } else {
        localStorage.removeItem('linkup_auth_user');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.warn('Session persistence error:', err);
    }
  }, [user]);

  // Strict Login: verifies credentials against registered database
  const login = (identifier, password) => {
    const cleanIdentifier = (identifier || '').trim();
    if (!cleanIdentifier) {
      throw new Error('Please enter your email, username, or LinkUp ID');
    }
    if (!password) {
      throw new Error('Please enter your password');
    }

    // Check registered accounts in localStorage
    const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
    const normalizedIdentifier = normalizeEmail(cleanIdentifier);
    let foundUser = savedDb.find(
      (u) =>
        u.username?.toLowerCase() === cleanIdentifier.toLowerCase() ||
        u.email?.toLowerCase() === cleanIdentifier.toLowerCase() ||
        u.linkupId?.toLowerCase() === cleanIdentifier.toLowerCase() ||
        (u.email && normalizeEmail(u.email) === normalizedIdentifier)
    );

    // Fallback: check currently saved session if not yet in savedDb
    if (!foundUser) {
      try {
        const activeRaw = localStorage.getItem('linkup_auth_user');
        if (activeRaw) {
          const parsedActive = JSON.parse(activeRaw);
          if (
            parsedActive.username?.toLowerCase() === cleanIdentifier.toLowerCase() ||
            parsedActive.email?.toLowerCase() === cleanIdentifier.toLowerCase() ||
            parsedActive.linkupId?.toLowerCase() === cleanIdentifier.toLowerCase()
          ) {
            foundUser = parsedActive;
            savedDb.unshift(parsedActive);
            localStorage.setItem('linkup_registered_users', JSON.stringify(savedDb));
          }
        }
      } catch {}
    }

    if (!foundUser) {
      throw new Error('No account found with this email/username/ID. Please create an account first.');
    }

    if (foundUser.password && password && foundUser.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    // If account was created without a password (e.g. legacy sign-in), set this password
    if (!foundUser.password && password) {
      foundUser.password = password;
      const uIdx = savedDb.findIndex((u) => u.id === foundUser.id || u.username === foundUser.username);
      if (uIdx >= 0) {
        savedDb[uIdx].password = password;
        localStorage.setItem('linkup_registered_users', JSON.stringify(savedDb));
      }
    }

    if (!foundUser.linkupId) {
      foundUser.linkupId = generateLinkUpId(foundUser.username);
    }

    setUser(foundUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('linkup_auth_user', JSON.stringify(foundUser));
    } catch {}
    setAuthModalOpen(false);
    setGoogleAuthModalOpen(false);
    return foundUser;
  };

  // Sign Up: creates and safely stores new user in persistent registered database
  const signup = ({ name, username, email, password, dob, gender, avatar }) => {
    const cleanName = (name || '').trim();
    const rawEmail = (email || '').trim();
    const cleanEmail = rawEmail.toLowerCase();
    const cleanUsername = (username || cleanName.toLowerCase().replace(/\s+/g, '.') || `user_${Date.now().toString().slice(-4)}`).trim().toLowerCase();

    if (!cleanName) {
      throw new Error('Please enter your full name');
    }
    if (!cleanEmail) {
      throw new Error('Please enter your email address');
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please enter a valid email address');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check registered users database
    const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
    const normalizedTarget = normalizeEmail(cleanEmail);
    const isGmail = cleanEmail.endsWith('@gmail.com') || cleanEmail.endsWith('@googlemail.com');

    // 1. Strictly enforce: ONLY ONE ACCOUNT PER GMAIL ADDRESS
    const existingWithEmail = savedDb.find((u) => u.email && normalizeEmail(u.email) === normalizedTarget);
    if (existingWithEmail) {
      if (isGmail) {
        throw new Error(
          `Only one LinkUp account is allowed per Gmail address. An account is already registered with this Gmail (${cleanEmail}). Please log in with your existing account.`
        );
      } else {
        throw new Error(
          `An account with this email address (${cleanEmail}) already exists. Please log in instead.`
        );
      }
    }

    // 2. Check if username is already taken
    const existingWithUsername = savedDb.find((u) => u.username?.toLowerCase() === cleanUsername);
    if (existingWithUsername) {
      throw new Error(`The username "${cleanUsername}" is already taken. Please choose another username.`);
    }

    const uniqueId = generateLinkUpId(cleanUsername);

    const newUser = {
      id: `user-${Date.now()}`,
      linkupId: uniqueId,
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
    try {
      localStorage.setItem('linkup_registered_users', JSON.stringify(savedDb));
      localStorage.setItem('linkup_auth_user', JSON.stringify(newUser));
    } catch {}

    setUser(newUser);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setGoogleAuthModalOpen(false);
    return newUser;
  };

  // Google OAuth Signup / Login: Strictly allows only one account per Gmail
  const loginWithGoogle = (customEmail = null, customName = null, customAvatar = null) => {
    const rawEmail = (customEmail || '').trim();
    const email = rawEmail.toLowerCase();
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid Google email address');
    }

    const normalizedTarget = normalizeEmail(email);
    const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
    let googleUser = savedDb.find((u) => u.email && normalizeEmail(u.email) === normalizedTarget);

    if (!googleUser) {
      const name = customName || email.split('@')[0].replace(/[._]/g, ' ');
      let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '') || 'user';
      let uniqueUsername = baseUsername;
      let counter = 1;
      while (savedDb.some((u) => u.username?.toLowerCase() === uniqueUsername.toLowerCase())) {
        uniqueUsername = `${baseUsername}${counter++}`;
      }

      googleUser = {
        id: `google-${Date.now()}`,
        linkupId: generateLinkUpId(uniqueUsername),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        username: uniqueUsername,
        email: email,
        avatar: customAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
        coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
        bio: `Signed in via Google account (${email}) 🌟`,
        role: 'Verified Google User',
        subtitle: 'LinkUp Member',
        website: `linkup.dev/${uniqueUsername}`,
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
      try {
        localStorage.setItem('linkup_registered_users', JSON.stringify(savedDb));
      } catch {}
    }

    if (!googleUser.linkupId) {
      googleUser.linkupId = generateLinkUpId(googleUser.username);
    }

    try {
      localStorage.setItem('linkup_auth_user', JSON.stringify(googleUser));
    } catch {}

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

  const deleteAccount = () => {
    const target = user;
    if (!target) return;

    // 1. Remove from localStorage registered users database
    try {
      const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
      const filteredDb = savedDb.filter(
        (u) =>
          u.id !== target.id &&
          u.username?.toLowerCase() !== target.username?.toLowerCase() &&
          u.linkupId?.toLowerCase() !== target.linkupId?.toLowerCase() &&
          (u.email ? u.email.toLowerCase() !== target.email?.toLowerCase() : true)
      );
      localStorage.setItem('linkup_registered_users', JSON.stringify(filteredDb));
    } catch (e) {
      console.warn('Error removing user from registered database:', e);
    }

    // 2. Clear current session and following data
    try {
      localStorage.removeItem('linkup_auth_user');
      localStorage.removeItem('linkup_following_usernames');
      localStorage.removeItem('linkup_active_tab');
      localStorage.removeItem('linkup_cloud_friend_requests');
    } catch (e) {}

    // 3. Remove user's own posts from local storage
    try {
      const savedPosts = JSON.parse(localStorage.getItem('linkup_posts') || '[]');
      const filteredPosts = savedPosts.filter(
        (p) =>
          p.author?.id !== target.id &&
          p.author?.username?.toLowerCase() !== target.username?.toLowerCase()
      );
      localStorage.setItem('linkup_posts', JSON.stringify(filteredPosts));
    } catch (e) {}

    // 4. Broadcast account deletion across global network so friends update their state
    try {
      realtime.broadcast('USER_ACCOUNT_DELETED', {
        id: target.id,
        username: target.username,
        linkupId: target.linkupId,
      });
    } catch (e) {}

    // 5. Reset AuthContext state
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserProfile = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };

      // Persist immediately to active session in localStorage
      try {
        localStorage.setItem('linkup_auth_user', JSON.stringify(updated));
      } catch (err) {
        console.warn('Error saving updated session:', err);
      }

      // Persist to registered users database matching by id, username, or email
      try {
        const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
        let matched = false;
        const newDb = savedDb.map((u) => {
          if (
            (u.id && prev.id && u.id === prev.id) ||
            (u.username && prev.username && u.username.toLowerCase() === prev.username.toLowerCase()) ||
            (u.email && prev.email && u.email.toLowerCase() === prev.email.toLowerCase()) ||
            (u.linkupId && prev.linkupId && u.linkupId.toLowerCase() === prev.linkupId.toLowerCase())
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

      // Broadcast profile updates across global realtime cloud network
      try {
        realtime.init(updated);
      } catch (e) {}

      return updated;
    });
  };

  const toggle2FA = () => {
    setUser((prev) => ({
      ...prev,
      twoFactorEnabled: !prev?.twoFactorEnabled,
    }));
  };

  // Find users in the registered network by query (username, name, or linkupId)
  const searchRegisteredUsers = (query) => {
    if (!query || !query.trim()) return [];
    const clean = query.trim().toLowerCase();
    const cleanAlphanum = clean.replace(/[^a-z0-9]/g, '');
    try {
      const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
      return savedDb.filter((u) => {
        const uId = (u.linkupId || '').toLowerCase();
        const uIdAlphanum = uId.replace(/[^a-z0-9]/g, '');
        const uName = (u.name || '').toLowerCase();
        const uUser = (u.username || '').toLowerCase();

        return (
          uName.includes(clean) ||
          uUser.includes(clean) ||
          uId.includes(clean) ||
          (cleanAlphanum && uIdAlphanum.includes(cleanAlphanum)) ||
          (cleanAlphanum.startsWith('lk') && uIdAlphanum.includes(cleanAlphanum.replace(/^lk/, ''))) ||
          (!cleanAlphanum.startsWith('lk') && uIdAlphanum.includes(`lk${cleanAlphanum}`))
        );
      });
    } catch {
      return [];
    }
  };

  // Change Password for Authenticated User
  const changePassword = (currentPassword, newPassword) => {
    if (!user) {
      throw new Error('You must be logged in to change your password');
    }

    // Verify current password if user has one set
    if (user.password && currentPassword !== user.password) {
      throw new Error('Current password is incorrect');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    if (user.password && currentPassword === newPassword) {
      throw new Error('New password must be different from current password');
    }

    updateUserProfile({ password: newPassword });
    return true;
  };

  // Reset Password for users (e.g. from forgot password flow)
  const resetPassword = (identifier, newPassword) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    if (!cleanId) {
      throw new Error('Please enter your email or username');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    const savedDb = JSON.parse(localStorage.getItem('linkup_registered_users') || '[]');
    const normalizedTarget = normalizeEmail(cleanId);
    const userIndex = savedDb.findIndex(
      (u) =>
        u.username?.toLowerCase() === cleanId ||
        u.email?.toLowerCase() === cleanId ||
        u.linkupId?.toLowerCase() === cleanId ||
        (u.email && normalizeEmail(u.email) === normalizedTarget)
    );

    if (userIndex === -1) {
      throw new Error('No account found with this email or username');
    }

    savedDb[userIndex].password = newPassword;
    localStorage.setItem('linkup_registered_users', JSON.stringify(savedDb));

    // If current session matches this user, update active session too
    if (user && (user.id === savedDb[userIndex].id || user.username?.toLowerCase() === savedDb[userIndex].username?.toLowerCase())) {
      const updatedUser = { ...user, password: newPassword };
      setUser(updatedUser);
      localStorage.setItem('linkup_auth_user', JSON.stringify(updatedUser));
    }

    return true;
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
        deleteAccount,
        updateUserProfile,
        changePassword,
        resetPassword,
        toggle2FA,
        searchRegisteredUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
