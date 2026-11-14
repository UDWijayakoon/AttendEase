import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
          <View style={[styles.percentageBadge, stats.isCritical ? styles.bgCriticalBadge : styles.bgSafeBadge]}>
            <Text style={[styles.percentageText, stats.isCritical ? styles.textCritical : styles.textSafe]}>
              {stats.percentage}%
            </Text>
          </View>
        </View>

        <Text style={styles.subjectName}>{item.name}</Text>

        {stats.isCritical ? (
          <View style={styles.warningAlertBadge}>
            <Ionicons name="warning-outline" size={13} color={COLORS.danger} />
            <Text style={styles.warningAlertText}>CRITICAL: Below 80% Eligibility Threshold</Text>
          </View>
        ) : (
          <View style={styles.safeAlertBadge}>
            <Ionicons name="checkmark-circle-outline" size={13} color={COLORS.success} />
            <Text style={styles.safeAlertText}>Compliant Status</Text>
          </View>
        )}

        <View style={styles.statsFooter}>
          <Text style={styles.statsDetail}>
            Attended: <Text style={styles.boldText}>{stats.totalAttended}</Text> / {stats.totalConducted} sessions
          </Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={COLORS.primary} />}
    >
      {/* Low Attendance Warning Banner Notification */}
      {criticalSubjects.length > 0 && (
        <View style={styles.dangerBanner} accessibilityRole="alert" accessibilityLiveRegion="assertive">
          <View style={styles.bannerHeaderRow}>
            <Ionicons name="alert-circle" size={22} color={COLORS.danger} />
            <Text style={styles.dangerBannerTitle}>Low Attendance Warning Active</Text>
          </View>
          <Text style={styles.dangerBannerText}>
            You have {criticalSubjects.length} subject(s) running below the mandatory 80% university requirement. Immediate attendance recovery is required to maintain exam eligibility.
          </Text>
        </View>
      )}

      {/* Action Shortcuts Header */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => navigation.navigate('Log')}>
          <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Log Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => navigation.navigate('Timetable')}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
          <Text style={styles.actionBtnSecondaryText}>Timetable</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnIcon} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.screenTitle}>Enrolled Subjects & Compliance</Text>
        <Text style={styles.subjectCountBadge}>{subjects.length} Active</Text>
      </View>

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
  dangerBanner: {
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.danger,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  dangerBannerTitle: { fontSize: 15, fontWeight: 'bold', color: '#B91C1C' },
  dangerBannerText: { fontSize: 12.5, color: '#7F1D1D', lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  actionBtnPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  actionBtnSecondary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnSecondaryText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  actionBtnIcon: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  screenTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  subjectCountBadge: { fontSize: 11, fontWeight: 'bold', color: COLORS.textSecondary, backgroundColor: COLORS.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  subjectCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 5,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  safeBorder: { borderLeftColor: COLORS.success },
  criticalBorder: { borderLeftColor: COLORS.danger },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subjectCode: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  percentageBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  bgSafeBadge: { backgroundColor: COLORS.successBg },
  bgCriticalBadge: { backgroundColor: COLORS.dangerBg },
  percentageText: { fontSize: 14, fontWeight: 'bold' },
  textSafe: { color: COLORS.success },
  textCritical: { color: COLORS.danger },
  subjectName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
  warningAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.dangerBg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  warningAlertText: { fontSize: 11, fontWeight: 'bold', color: COLORS.danger },
  safeAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.successBg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  safeAlertText: { fontSize: 11, fontWeight: 'bold', color: COLORS.success },
  statsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  statsDetail: { fontSize: 12.5, color: COLORS.textSecondary },
  boldText: { fontWeight: 'bold', color: COLORS.textPrimary },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40 }
});
