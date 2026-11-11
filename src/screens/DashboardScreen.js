import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSubjects, getAttendanceLogs, calculateSubjectStats } from '../storage';
import { COLORS } from '../theme';

export default function DashboardScreen({ navigation }) {
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

  const criticalSubjects = subjects.filter(sub => {
    const stats = calculateSubjectStats(sub.id, logs);
    return stats.isCritical;
  });

  const renderSubjectCard = ({ item }) => {
    const stats = calculateSubjectStats(item.id, logs);

    return (
      <TouchableOpacity 
        style={[styles.subjectCard, stats.isCritical ? styles.criticalBorder : styles.safeBorder]}
        onPress={() => navigation.navigate('SubjectDetail', { subject: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.subjectCode}>{item.code}</Text>
          <Text style={[styles.percentageText, stats.isCritical ? styles.textCritical : styles.textSafe]}>
            {stats.percentage}%
          </Text>
        </View>
        <Text style={styles.subjectName}>{item.name}</Text>

        {stats.isCritical && (
          <View style={styles.warningAlertBadge}>
            <Text style={styles.warningAlertText}>⚠️ DANGER: Below 80% Requirement</Text>
          </View>
        )}

        <Text style={styles.statsDetail}>
          Attended: {stats.totalAttended} / {stats.totalConducted} sessions
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      {/* Critical Status Alert Banner */}
      {criticalSubjects.length > 0 && (
        <View style={styles.dangerBanner}>
          <Text style={styles.dangerBannerTitle}>🚨 Academic Warning Notice</Text>
          <Text style={styles.dangerBannerText}>
            You have {criticalSubjects.length} subject(s) running below the mandatory 80% attendance threshold! Immediate attendance required.
          </Text>
        </View>
      )}

      {/* Action Shortcuts Header */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => navigation.navigate('Log')}>
          <Text style={styles.actionBtnText}>+ Log Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => navigation.navigate('Timetable')}>
          <Text style={styles.actionBtnSecondaryText}>📅 Timetable</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnIcon} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.actionBtnSecondaryText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.screenTitle}>Subject Overview</Text>

      <FlatList
        data={subjects}
        keyExtractor={item => item.id}
        renderItem={renderSubjectCard}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No subjects registered.</Text>}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background, flexGrow: 1 },
  dangerBanner: { backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 12, padding: 16, marginBottom: 16 },
  dangerBannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#B91C1C', marginBottom: 4 },
  dangerBannerText: { fontSize: 13, color: '#7F1D1D', lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  actionBtnPrimary: { flex: 2, backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  actionBtnSecondary: { flex: 2, backgroundColor: '#E0E7FF', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnSecondaryText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  actionBtnIcon: { flex: 1, backgroundColor: '#E2E8F0', paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  screenTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  subjectCard: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 6, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 2 },
  safeBorder: { borderLeftColor: COLORS.success },
  criticalBorder: { borderLeftColor: COLORS.danger },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subjectCode: { fontSize: 13, fontWeight: 'bold', color: COLORS.textSecondary, textTransform: 'uppercase' },
  percentageText: { fontSize: 16, fontWeight: 'bold' },
  textSafe: { color: COLORS.success },
  textCritical: { color: COLORS.danger },
  subjectName: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  warningAlertBadge: { backgroundColor: COLORS.dangerBg, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginBottom: 8, alignSelf: 'flex-start' },
  warningAlertText: { fontSize: 11, fontWeight: 'bold', color: COLORS.danger },
  statsDetail: { fontSize: 13, color: COLORS.textSecondary },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40 }
});