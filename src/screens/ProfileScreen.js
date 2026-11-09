import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAttendanceLogs, getSubjects, calculateSubjectStats } from '../storage';

export default function ProfileScreen() {
  const [subjects, setSubjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const studentInfo = {
    name: 'Uthsara',
    regNo: '2022ICT70',
    degree: 'BSc in Information & Communication Technology',
    university: 'University of Vavuniya',
    semester: 'Year 3 - Semester I',
    status: 'Active Enrolled'
  };

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
          <Text style={styles.avatarText}>{studentInfo.name.charAt(0)}</Text>
        </View>
        <Text style={styles.studentName}>{studentInfo.name}</Text>
        <Text style={styles.regNo}>{studentInfo.regNo}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{studentInfo.status}</Text>
        </View>
      </View>

      {/* Academic Details */}
      <Text style={styles.sectionHeader}>Academic Overview</Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Degree Program</Text>
          <Text style={styles.value}>{studentInfo.degree}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Institution</Text>
          <Text style={styles.value}>{studentInfo.university}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Current Academic Level</Text>
          <Text style={styles.value}>{studentInfo.semester}</Text>
        </View>
      </View>

      {/* App Target Goal */}
      <View style={styles.targetCard}>
        <Text style={styles.targetTitle}>🎯 Required Attendance Standard</Text>
        <Text style={styles.targetDescription}>
          Minimum required threshold for exam eligibility: <Text style={styles.boldText}>80.0%</Text>
        </Text>
      </View>

      <Text style={styles.sectionHeader}>Attendance Overview</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fa', flexGrow: 1 },
  profileHeaderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#dee2e6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  studentName: { fontSize: 22, fontWeight: 'bold', color: '#212529' },
  regNo: { fontSize: 14, color: '#6c757d', marginTop: 2, fontWeight: '600' },
  statusBadge: { backgroundColor: '#e8f5e9', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 16, marginTop: 10 },
  statusText: { color: '#28a745', fontWeight: 'bold', fontSize: 12 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#343a40', marginBottom: 12 },
  infoCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#dee2e6' },
  infoRow: { paddingVertical: 8 },
  label: { fontSize: 13, color: '#6c757d', textTransform: 'uppercase', fontWeight: 'bold' },
  value: { fontSize: 15, fontWeight: 'bold', color: '#212529', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#e9ecef', marginVertical: 4 },
  targetCard: { backgroundColor: '#e7f1ff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#b6d4fe' },
  targetTitle: { fontSize: 15, fontWeight: 'bold', color: '#055160', marginBottom: 4 },
  targetDescription: { fontSize: 13, color: '#084298' },
  boldText: { fontWeight: 'bold' },
  attendanceCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#dee2e6' },
  attendanceSummary: { flexDirection: 'row', justifyContent: 'space-around' },
  metric: { alignItems: 'center', paddingVertical: 8 },
  metricValue: { fontSize: 22, fontWeight: 'bold', color: '#212529' },
  metricLabel: { fontSize: 13, color: '#6c757d', marginTop: 4 },
  standingText: { fontSize: 14, color: '#495057', marginTop: 12 },
  subjectRow: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#dee2e6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subjectInfo: { flex: 1, paddingRight: 12 },
  subjectCode: { fontSize: 12, fontWeight: 'bold', color: '#6c757d' },
  subjectName: { fontSize: 15, fontWeight: '600', color: '#212529', marginTop: 3 },
  subjectPercentage: { fontSize: 16, fontWeight: 'bold' },
  criticalText: { color: '#dc3545' },
  safeText: { color: '#28a745' },
  emptyText: { color: '#6c757d', textAlign: 'center', marginBottom: 12 }
});