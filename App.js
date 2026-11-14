import React, { useEffect, useState } from 'react';
import { clearUserSession, initializeData, getUserProfile } from './src/storage';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    async function prepareApp() {
      await initializeData();
      const existingProfile = await getUserProfile();

      timeoutId = setTimeout(() => {
        if (isMounted) {
          setUserProfile(existingProfile);
          setIsLoading(false);
        }
      }, 1800);
    }

    prepareApp();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const handleLogout = async () => {
    await clearUserSession();
    setUserProfile(null);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!userProfile) {
    return <LoginScreen onLoginSuccess={(profile) => setUserProfile(profile)} />;
  }

  return <AppNavigator userProfile={userProfile} onLogout={handleLogout} />;
}