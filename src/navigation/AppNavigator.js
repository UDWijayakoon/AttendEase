import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Subjects" component={SubjectsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs">
        <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} options={{ title: 'Subject Details' }} />
        <Stack.Screen name="DailyLog" component={DailyLogScreen} options={{ title: 'Daily Check-In' }} />
        <Stack.Screen name="Timetable" component={TimetableScreen} options={{ title: 'Timetable Manager' }} />
        <Stack.Screen name="AddEdit" component={AddEditScreen} options={{ title: 'Add / Edit Entry' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}