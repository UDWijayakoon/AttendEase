import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAttendanceLogs, calculateSubjectStats } from '../storage';
import { COLORS } from '../theme';

export default function SubjectDetailScreen({ route }) {
  const { subject } = route.params;
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalConducted: 0, totalAttended: 0, percentage: 100, isCritical: false });
  const [refreshing, setRefreshing] = useState(false);

  const loadSubjectData = async () => {
    setRefreshing(true);
    const allLogs = await getAttendanceLogs();
    const subjectLogs = allLogs.filter(l => l.subjectId === subject.id);
    setLogs(subjectLogs);
    setStats(calculateSubjectStats(subject.id, allLogs));
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadSubjectData();
    }, [subject.id])
  );

  const renderLogItem = ({ item }) => (
    <View style={[styles.logCard, item.status === 'Present' ? styles.presentCard : styles.absentCard]}>
      <View style={styles.logHeader}>
        <Text style={styles.logDate}>{item.date}</Text>
        <Text style={[styles.statusText, item.status === 'Present' ? styles.textPresent : styles.textAbsent]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.sessionType}>Type: {item.sessionType || 'Regular'}</Text>
      {item.notes ? <Text style={styles.notesText}>Note: {item.notes}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.summaryCard, stats.isCritical ? styles.criticalBorder : styles.safeBorder]}>
        <Text style={styles.subjectCode}>{subject.code}</Text>
        <Text style={styles.subjectName}>{subject.name}</Text>
        <Text style={[styles.percentageDisplay, stats.isCritical ? styles.textAbsent : styles.textPresent]}>
          {stats.percentage}% Attendance
        </Text>
        <Text style={styles.breakdownText}>
          Attended {stats.totalAttended} out of {stats.totalConducted} sessions
        </Text>
        {stats.isCritical && (
          <Text style={styles.warningAlert}>⚠️ Critical: Below 80% Threshold!</Text>
        )}
      </View>

      <Text style={styles.sectionHeader}>Attendance History</Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderLogItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadSubjectData} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No attendance logs recorded for this subject yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  summaryCard: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  safeBorder: { borderLeftWidth: 6, borderLeftColor: COLORS.success },
  criticalBorder: { borderLeftWidth: 6, borderLeftColor: COLORS.danger },
  subjectCode: { fontSize: 14, fontWeight: 'bold', color: COLORS.textSecondary, textTransform: 'uppercase' },
  subjectName: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginVertical: 4 },
  percentageDisplay: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  breakdownText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  warningAlert: { fontSize: 13, color: COLORS.danger, fontWeight: 'bold', marginTop: 10 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  listContainer: { paddingBottom: 20 },
  logCard: { backgroundColor: COLORS.cardBg, borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4 },
  presentCard: { borderLeftColor: COLORS.success },
  absentCard: { borderLeftColor: COLORS.danger },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  logDate: { fontSize: 14, fontWeight: 'bold', color: COLORS.textSecondary },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  textPresent: { color: COLORS.success },
  textAbsent: { color: COLORS.danger },
  sessionType: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 },
  notesText: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 2 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 30, fontSize: 15 }
});