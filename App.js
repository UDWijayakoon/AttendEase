import React, { useEffect, useState } from 'react';
import { initializeData } from './src/storage';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    async function prepareApp() {
      await initializeData();
      timeoutId = setTimeout(() => {
        if (isMounted) {
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

  return isLoading ? <SplashScreen /> : <AppNavigator />;
}
