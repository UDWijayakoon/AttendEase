import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSubjects, getAttendanceLogs, calculateSubjectStats } from '../storage';

export default function AnalyticsScreen() {
  const [subjects, setSubjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const loadedSubjects = await getSubjects();
    const loadedLogs = await getAttendanceLogs();
    setSubjects(loadedSubjects);
    setLogs(loadedLogs);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Calculate overall metrics
  const totalClassesRecorded = logs.length;
  const totalPresent = logs.filter(l => l.status === 'Present').length;
  const overallPercentage = totalClassesRecorded > 0 ? ((totalPresent / totalClassesRecorded) * 100).toFixed(1) : 100.0;
  
  const criticalSubjectsCount = subjects.filter(sub => {
    const stats = calculateSubjectStats(sub.id, logs);
    return stats.isCritical;
  }).length;

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <Text style={styles.screenTitle}>Attendance Analytics</Text>

      {/* Overall Summary Card */}
      <View style={styles.mainCard}>
        <Text style={styles.cardTitle}>Overall Performance</Text>
        <Text style={[styles.bigPercentage, parseFloat(overallPercentage) >= 80 ? styles.textSafe : styles.textCritical]}>
          {overallPercentage}%
        </Text>
        <Text style={styles.cardSubtitle}>Total Attended: {totalPresent} / {totalClassesRecorded} sessions</Text>
      </View>

      {/* Status Breakdown Cards */}
      <View style={styles.row}>
        <View style={[styles.statBox, styles.safeBg]}>
          <Text style={styles.statNumber}>{subjects.length - criticalSubjectsCount}</Text>
          <Text style={styles.statLabel}>Safe Subjects (&ge;80%)</Text>
        </View>
        <View style={[styles.statBox, styles.criticalBg]}>
          <Text style={styles.statNumber}>{criticalSubjectsCount}</Text>
          <Text style={styles.statLabel}>Critical (&lt;80%)</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Subject Compliance Breakdown</Text>

      {subjects.map(sub => {
        const stats = calculateSubjectStats(sub.id, logs);
        return (
          <View key={sub.id} style={[styles.subjectRow, stats.isCritical ? styles.rowCritical : styles.rowSafe]}>
            <View>
              <Text style={styles.subCode}>{sub.code}</Text>
              <Text style={styles.subName}>{sub.name}</Text>
            </View>
            <View style={styles.subStatsContainer}>
              <Text style={[styles.subPercentage, stats.isCritical ? styles.textCritical : styles.textSafe]}>
                {stats.percentage}%
              </Text>
              <Text style={styles.subRatio}>{stats.totalAttended}/{stats.totalConducted}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fa', flexGrow: 1 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: '#212529', marginBottom: 16 },
  mainCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#dee2e6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#6c757d', marginBottom: 8 },
  bigPercentage: { fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
  cardSubtitle: { fontSize: 14, color: '#495057' },
  textSafe: { color: '#28a745' },
  textCritical: { color: '#dc3545' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 12 },
  statBox: { flex: 1, borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1 },
  safeBg: { backgroundColor: '#e8f5e9', borderColor: '#c8e6c9' },
  criticalBg: { backgroundColor: '#ffebee', borderColor: '#ffcdd2' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#212529', marginBottom: 4 },
  statLabel: { fontSize: 13, fontWeight: '600', color: '#495057', textAlign: 'center' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#343a40', marginBottom: 12 },
  subjectRow: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#dee2e6', borderLeftWidth: 5 },
  rowSafe: { borderLeftColor: '#28a745' },
  rowCritical: { borderLeftColor: '#dc3545' },
  subCode: { fontSize: 13, fontWeight: 'bold', color: '#6c757d', textTransform: 'uppercase' },
  subName: { fontSize: 16, fontWeight: 'bold', color: '#212529', marginTop: 2 },
  subStatsContainer: { alignItems: 'flex-end' },
  subPercentage: { fontSize: 16, fontWeight: 'bold' },
  subRatio: { fontSize: 12, color: '#6c757d', marginTop: 2 }
});