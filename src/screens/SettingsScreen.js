import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { resetData } from '../storage';
import { COLORS } from '../theme';

export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all custom subjects, logs, and timetable data, restoring default mock data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetData();
              Alert.alert('Success', 'Your data has been restored to the default sample data.');
            } catch (e) {
              Alert.alert('Error', 'Failed to reset app data. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>Settings & Preferences</Text>

      {/* App Preferences */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Preferences</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Attendance Reminders</Text>
            <Text style={styles.settingSubtext}>Get daily alerts to log classes</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Offline Mode Priority</Text>
            <Text style={styles.settingSubtext}>Prioritize local AsyncStorage caching</Text>
          </View>
          <Switch
            value={offlineSync}
            onValueChange={setOfflineSync}
          />
        </View>
      </View>

      {/* Storage & Data Management */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Data Management</Text>

        <TouchableOpacity style={styles.dangerButton} onPress={handleResetData}>
          <Text style={styles.dangerButtonText}>⚠️ Reset All Local Data</Text>
        </TouchableOpacity>
      </View>

      {/* App Version Info */}
      <View style={styles.versionCard}>
        <Text style={styles.versionTitle}>AttendEase v1.0.0</Text>
        <Text style={styles.versionSubtitle}>Offline-First Student Attendance & Analytics Tracker</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background, flexGrow: 1 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  sectionCard: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  settingInfo: { flex: 1, marginRight: 12 },
  settingLabel: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary },
  settingSubtext: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  dangerButton: { backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: COLORS.dangerBg, padding: 12, borderRadius: 8, alignItems: 'center' },
  dangerButtonText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 14 },
  versionCard: { alignItems: 'center', marginTop: 20, paddingBottom: 20 },
  versionTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.textSecondary },
  versionSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' }
});