import React, { useEffect, useState } from 'react';
import { initializeData } from './src/storage';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    initializeData().then(() => {
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return isReady ? <AppNavigator /> : <SplashScreen />;
}
