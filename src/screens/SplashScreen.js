import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* App Logo / Monogram */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>AE</Text>
      </View>
      <Text style={styles.appName}>AttendEase</Text>
      <Text style={styles.tagline}>Professional Offline-First Attendance Tracker</Text>
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>University of Vavuniya</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logoContainer: { width: 90, height: 90, borderRadius: 24, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 },
  logoText: { fontSize: 40, fontWeight: '900', color: COLORS.primary },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 0.5 },
  tagline: { fontSize: 13, color: '#C7D2FE', marginTop: 6, textAlign: 'center', fontWeight: '500' },
  badgeContainer: { marginTop: 40, backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' }
});
