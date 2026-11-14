import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import SubjectsScreen from '../screens/SubjectsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SubjectDetailScreen from '../screens/SubjectDetailScreen';
import DailyLogScreen from '../screens/DailyLogScreen';
import TimetableScreen from '../screens/TimetableScreen';
import AddEditScreen from '../screens/AddEditScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.cardBg,
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: COLORS.cardBg,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Subjects') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Analytics') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Subjects" component={SubjectsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: COLORS.primary,
          background: COLORS.background,
          card: COLORS.cardBg,
          text: COLORS.textPrimary,
          border: COLORS.border,
          notification: COLORS.danger,
        },
      }}
    >
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.cardBg,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} options={{ title: 'Subject Details' }} />
        <Stack.Screen name="Log" component={DailyLogScreen} options={{ title: 'Log Attendance' }} />
        <Stack.Screen name="Timetable" component={TimetableScreen} options={{ title: 'Weekly Timetable' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings & Preferences' }} />
        <Stack.Screen name="AddEdit" component={AddEditScreen} options={{ title: 'Add / Edit Entry' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}