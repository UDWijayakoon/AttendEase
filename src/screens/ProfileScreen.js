import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAttendanceLogs, getSubjects, calculateSubjectStats } from '../storage';
import { useAuth } from '../AuthContext';
import { COLORS } from '../theme';

export default function ProfileScreen() {
  const { userProfile, signOut } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [loadedSubjects, loadedLogs] = await Promise.all([
        getSubjects(),
        getAttendanceLogs()
      ]);
      setSubjects(loadedSubjects);
      setLogs(loadedLogs);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleLogoutPress = () => {
    Alert.alert(
      'Sign Out & Switch Account',
      'You will be returned to the student portal login screen. Your attendance logs will remain saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  if (!userProfile) return null;

  const totalPresent = logs.filter(log => log.status === 'Present').length;
  const overallPercentage = logs.length > 0
    ? ((totalPresent / logs.length) * 100).toFixed(1)
    : null;
  const criticalSubjects = subjects.filter(subject =>
    calculateSubjectStats(subject.id, logs).isCritical
  ).length;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      {/* Profile Header */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {userProfile.initials || userProfile.fullName?.charAt(0) || 'ST'}
          </Text>
        </View>
        <Text style={styles.studentName}>{userProfile.fullName}</Text>
        <Text style={styles.regNo}>{userProfile.regNumber}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{userProfile.status || 'Active Enrolled'}</Text>
        </View>
      </View>

      {/* Academic Details */}
      <Text style={styles.sectionHeader}>Academic Overview</Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Degree Program</Text>
          <Text style={styles.value}>{userProfile.degree}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Institution</Text>
          <Text style={styles.value}>{userProfile.institution}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Current Academic Level</Text>
          <Text style={styles.value}>{userProfile.academicLevel}</Text>
        </View>
      </View>

      {/* App Target Goal */}
      <View style={styles.targetCard}>
        <Text style={styles.targetTitle}>🎯 Required Attendance Standard</Text>
        <Text style={styles.targetDescription}>
          Minimum required threshold for exam eligibility: <Text style={styles.boldText}>80.0%</Text>
        </Text>
      </View>

      <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Attendance Overview</Text>
      <View style={styles.attendanceCard}>
        <View style={styles.attendanceSummary}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              {overallPercentage === null ? '--' : `${overallPercentage}%`}
            </Text>
            <Text style={styles.metricLabel}>Overall attendance</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{totalPresent}/{logs.length}</Text>
            <Text style={styles.metricLabel}>Sessions attended</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.standingText}>
          {subjects.length === 0
            ? 'Add subjects to see your attendance standing.'
            : `${criticalSubjects} of ${subjects.length} ${
                subjects.length === 1 ? 'subject is' : 'subjects are'
              } below the 80% attendance standard.`}
        </Text>
      </View>

      <Text style={styles.sectionHeader}>Subject Attendance</Text>
      {subjects.length > 0 ? subjects.map(subject => {
        const stats = calculateSubjectStats(subject.id, logs);
        return (
          <View key={subject.id} style={styles.subjectRow}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectCode}>{subject.code}</Text>
              <Text style={styles.subjectName}>{subject.name}</Text>
            </View>
            <Text style={[
              styles.subjectPercentage,
              stats.isCritical ? styles.criticalText : styles.safeText
            ]}>
              {stats.percentage}%
            </Text>
          </View>
        );
      }) : (
        <Text style={styles.emptyText}>No subjects added yet.</Text>
      )}

      {/* Sign Out / Switch Account Action */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutButtonText}>Sign Out / Switch Student Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background, flexGrow: 1, paddingBottom: 32 },
  profileHeaderCard: { backgroundColor: COLORS.cardBg, borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.cardBg },
  studentName: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
  regNo: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
  statusBadge: { backgroundColor: COLORS.successBg, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 16, marginTop: 10 },
  statusText: { color: COLORS.success, fontWeight: 'bold', fontSize: 12 },
  sectionHeader: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  infoCard: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  infoRow: { paddingVertical: 8 },
  label: { fontSize: 11, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 0.5 },
  value: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 4 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  targetCard: { backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#C7D2FE' },
  targetTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },
  targetDescription: { fontSize: 13, color: COLORS.primaryDark },
  boldText: { fontWeight: 'bold' },
  attendanceCard: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  attendanceSummary: { flexDirection: 'row', justifyContent: 'space-around' },
  metric: { alignItems: 'center', paddingVertical: 8 },
  metricValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
  metricLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  standingText: { fontSize: 13.5, color: COLORS.textSecondary, marginTop: 12 },
  subjectRow: { backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subjectInfo: { flex: 1, paddingRight: 12 },
  subjectCode: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSecondary },
  subjectName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginTop: 3 },
  subjectPercentage: { fontSize: 16, fontWeight: 'bold' },
  criticalText: { color: COLORS.danger },
  safeText: { color: COLORS.success },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginBottom: 12 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: 'bold',
  },
});