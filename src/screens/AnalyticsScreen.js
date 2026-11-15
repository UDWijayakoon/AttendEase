import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getSubjects, getAttendanceLogs, calculateSubjectStats } from '../storage';
import { COLORS } from '../theme';

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

  // Overall metrics
  const totalClassesRecorded = logs.length;
  const totalPresent = logs.filter(l => l.status === 'Present').length;
  const overallPercentage = totalClassesRecorded > 0 ? ((totalPresent / totalClassesRecorded) * 100).toFixed(1) : 100.0;
  
  const criticalSubjectsCount = subjects.filter(sub => {
    const stats = calculateSubjectStats(sub.id, logs);
    return stats.isCritical;
  }).length;

  // Session Type Breakdown (Regular, Extra, ICA, Exam)
  const sessionBreakdown = {
    Regular: logs.filter(l => l.sessionType === 'Regular' && l.status === 'Present').length,
    RegularTotal: logs.filter(l => l.sessionType === 'Regular').length,
    Extra: logs.filter(l => l.sessionType === 'Extra' && l.status === 'Present').length,
    ExtraTotal: logs.filter(l => l.sessionType === 'Extra').length,
    ICA: logs.filter(l => l.sessionType === 'ICA' && l.status === 'Present').length,
    ICATotal: logs.filter(l => l.sessionType === 'ICA').length,
    Exam: logs.filter(l => l.sessionType === 'Exam' && l.status === 'Present').length,
    ExamTotal: logs.filter(l => l.sessionType === 'Exam').length,
  };

  const getCategoryPercentage = (attended, total) => {
    return total > 0 ? (attended / total) * 100 : null;
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={COLORS.primary} />}
    >
      <Text style={styles.screenTitle}>Attendance Analytics & Graphs</Text>

      {/* Overall Summary Card */}
      <View style={styles.mainCard}>
        <Text style={styles.cardTitle}>Overall Academic Standing</Text>
        <Text style={[styles.bigPercentage, parseFloat(overallPercentage) >= 80 ? styles.textSafe : styles.textCritical]}>
          {overallPercentage}%
        </Text>
        <Text style={styles.cardSubtitle}>Total Attended: {totalPresent} / {totalClassesRecorded} sessions</Text>
      </View>

      {/* Status Breakdown Cards */}
      <View style={styles.row}>
        <View style={[styles.statBox, styles.safeBg]}>
          <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.success} style={{marginBottom: 4}} />
          <Text style={styles.statNumber}>{subjects.length - criticalSubjectsCount}</Text>
          <Text style={styles.statLabel}>Compliant (&ge;80%)</Text>
        </View>
        <View style={[styles.statBox, styles.criticalBg]}>
          <Ionicons name="warning-outline" size={22} color={COLORS.danger} style={{marginBottom: 4}} />
          <Text style={styles.statNumber}>{criticalSubjectsCount}</Text>
          <Text style={styles.statLabel}>Critical (&lt;80%)</Text>
        </View>
      </View>

      {/* Specialized Session Breakdown (ICA & Exam Analysis) */}
      <Text style={styles.sectionHeader}>Specialized Session Breakdown (ICA & Exams)</Text>
      <View style={styles.categoryCard}>
        {[
          { key: 'regular', label: 'Regular Lectures', attended: sessionBreakdown.Regular, total: sessionBreakdown.RegularTotal },
          { key: 'extra', label: 'Extra / Makeup Sessions', attended: sessionBreakdown.Extra, total: sessionBreakdown.ExtraTotal },
          { key: 'ica', label: 'ICA / Assessments', attended: sessionBreakdown.ICA, total: sessionBreakdown.ICATotal },
          { key: 'exam', label: 'Formal Exams', attended: sessionBreakdown.Exam, total: sessionBreakdown.ExamTotal },
        ].map((cat) => {
          const pct = getCategoryPercentage(cat.attended, cat.total);
          const meetsThreshold = cat.total > 0 && cat.attended * 5 >= cat.total * 4;
          return (
            <View key={cat.key} style={styles.categoryItem}>
              <View style={styles.categoryHeaderRow}>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <Text style={styles.categoryStats}>
                  {cat.attended} / {cat.total} {pct === null ? '(No data)' : `(${pct.toFixed(1)}%)`}
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${pct || 0}%`,
                      backgroundColor: pct === null
                        ? COLORS.border
                        : meetsThreshold ? COLORS.primary : COLORS.danger,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionHeader}>Subject Compliance & Graphical Progress</Text>

      {subjects.length > 0 ? subjects.map(sub => {
        const stats = calculateSubjectStats(sub.id, logs);
        const numericPct = Math.min(Math.max(parseFloat(stats.percentage), 0), 100);

        return (
          <View key={sub.id} style={[styles.subjectCard, stats.isCritical ? styles.rowCritical : styles.rowSafe]}>
            <View style={styles.subjectHeaderRow}>
              <View>
                <Text style={styles.subCode}>{sub.code}</Text>
                <Text style={styles.subName}>{sub.name}</Text>
              </View>
              <View style={styles.subStatsContainer}>
                <Text style={[styles.subPercentage, stats.isCritical ? styles.textCritical : styles.textSafe]}>
                  {stats.percentage}%
                </Text>
                <Text style={styles.subRatio}>{stats.totalAttended}/{stats.totalConducted} sess.</Text>
              </View>
            </View>

            {/* Graphical Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${numericPct}%`,
                    backgroundColor: stats.isCritical ? COLORS.danger : COLORS.success
                  }
                ]}
              />
            </View>
          </View>
        );
      }) : (
        <Text style={styles.emptyText}>No subjects registered yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background, flexGrow: 1, paddingBottom: 32 },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  mainCard: { backgroundColor: COLORS.cardBg, borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  bigPercentage: { fontSize: 38, fontWeight: 'bold', marginVertical: 4 },
  cardSubtitle: { fontSize: 13.5, color: COLORS.textSecondary },
  textSafe: { color: COLORS.success },
  textCritical: { color: COLORS.danger },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 12 },
  statBox: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1 },
  safeBg: { backgroundColor: COLORS.successBg, borderColor: '#A7F3D0' },
  criticalBg: { backgroundColor: COLORS.dangerBg, borderColor: '#FECACA' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSecondary, textAlign: 'center' },
  sectionHeader: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12, marginTop: 4 },
  categoryCard: { backgroundColor: COLORS.cardBg, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  categoryItem: { marginBottom: 14 },
  categoryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  categoryLabel: { fontSize: 13, fontWeight: 'bold', color: COLORS.textPrimary },
  categoryStats: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  subjectCard: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 5, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  rowSafe: { borderLeftColor: COLORS.success },
  rowCritical: { borderLeftColor: COLORS.danger },
  subjectHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  subCode: { fontSize: 11.5, fontWeight: 'bold', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  subName: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 2 },
  subStatsContainer: { alignItems: 'flex-end' },
  subPercentage: { fontSize: 15, fontWeight: 'bold' },
  subRatio: { fontSize: 11.5, color: COLORS.textSecondary, marginTop: 2 },
  progressBarTrack: { height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  progressBarFill: { height: '100%', borderRadius: 4 },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 20 }
});