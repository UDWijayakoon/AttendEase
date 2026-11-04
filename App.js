import React, { useEffect } from 'react';
import { initializeData } from './src/storage';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Seed local storage with default data on first launch
    initializeData();
  }, []);

  return <AppNavigator />;
}