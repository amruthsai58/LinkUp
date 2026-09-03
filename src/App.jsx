import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { SocialProvider, useSocial } from './context/SocialContext';

import { SplashScreen } from './components/Splash/SplashScreen';
import { Navbar } from './components/Navigation/Navbar';
import { BottomNavBar } from './components/Navigation/BottomNavBar';
import { Feed } from './components/Feed/Feed';
import { WelcomeScreen } from './components/Auth/WelcomeScreen';
import { ExploreView } from './components/Search/ExploreView';
import { ReelsView } from './components/Reels/ReelsView';
import { ProfileView } from './components/Profile/ProfileView';
import { MessagesView } from './components/Chat/MessagesView';
import { DirectChatView } from './components/Chat/DirectChatView';
import { NotificationsView } from './components/Notifications/NotificationsView';
import { MenuView } from './components/Navigation/MenuView';

import { AuthModal } from './components/Auth/AuthModal';
import { GoogleAuthModal } from './components/Auth/GoogleAuthModal';
import { CreatePostModal } from './components/Feed/CreatePostModal';
import { StoryViewerModal } from './components/Stories/StoryViewerModal';
import { StoryCreatorModal } from './components/Stories/StoryCreatorModal';
import { LiveViewerModal } from './components/Feed/LiveViewerModal';

const MainAppContent = () => {
  const {
    activeTab,
    isLiveViewerOpen,
    activeLiveStreamToWatch,
    setIsLiveViewerOpen,
  } = useSocial();
  const { user, isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // If user is not authenticated, strictly show Sign Up / Log In screen
  const isUserAuthenticated = isAuthenticated && !!user;

  const renderActiveScreen = () => {
    if (!isUserAuthenticated) {
      return <WelcomeScreen />;
    }

    switch (activeTab) {
      case 'home':
        return <Feed />;
      case 'search':
        return <ExploreView />;
      case 'reels':
        return <ReelsView />;
      case 'profile':
        return <ProfileView />;
      case 'messages':
        return <MessagesView />;
      case 'chat_direct':
        return <DirectChatView />;
      case 'notifications':
        return <NotificationsView />;
      case 'menu':
        return <MenuView />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Animated Brand Splash Screen (Plays on every page load/open) */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Top Navbar with LinkUp logo */}
      {isUserAuthenticated && <Navbar />}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-2 sm:px-4 pt-2 flex flex-col justify-start">
        {renderActiveScreen()}
      </main>

      {/* Persistent Bottom 5-Icon Navigation Bar (Only for authenticated users) */}
      {isUserAuthenticated && activeTab !== 'auth_welcome' && <BottomNavBar />}

      {/* Interactive Overlays */}
      <AuthModal />
      <GoogleAuthModal />
      <CreatePostModal />
      <StoryViewerModal />
      <StoryCreatorModal />
      <LiveViewerModal
        isOpen={isLiveViewerOpen}
        liveStream={activeLiveStreamToWatch}
        onClose={() => setIsLiveViewerOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <SocialProvider>
          <MainAppContent />
        </SocialProvider>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;
