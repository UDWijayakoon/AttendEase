import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSubjects, getAttendanceLogs, calculateSubjectStats } from '../storage';
import { COLORS } from '../theme';

export default function DashboardScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load data whenever the screen comes into focus
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

  // Render individual subject card
  const renderSubjectCard = ({ item }) => {
    const stats = calculateSubjectStats(item.id, logs);

    return (
      <TouchableOpacity 
        style={[styles.card, stats.isCritical ? styles.criticalCard : styles.safeCard]}
        onPress={() => navigation.navigate('SubjectDetail', { subject: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.subjectCode}>{item.code}</Text>
          <Text style={[styles.percentageText, stats.isCritical ? styles.textCritical : styles.textSafe]}>
            {stats.percentage}%
          </Text>
        </View>
        <Text style={styles.subjectName}>{item.name}</Text>
        <Text style={styles.statsText}>
          Attended: {stats.totalAttended} / Conducted: {stats.totalConducted}
        </Text>
        {stats.isCritical && (
          <Text style={styles.warningText}>⚠️ Below 80% Threshold!</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>AttendEase Dashboard</Text>
        <Text style={styles.headerSubtitle}>Target Threshold: 80%</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('DailyLog')}
        >
          <Text style={styles.buttonText}>+ Log Attendance</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Timetable')}
        >
          <Text style={styles.secondaryButtonText}>Timetable</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Your Subjects</Text>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={renderSubjectCard}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16, paddingTop: 50 },
  headerContainer: { marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  primaryButton: { flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  secondaryButton: { flex: 1, backgroundColor: COLORS.border, padding: 12, borderRadius: 8, alignItems: 'center', marginLeft: 8 },
  buttonText: { color: COLORS.cardBg, fontWeight: 'bold', fontSize: 16 },
  secondaryButtonText: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: COLORS.textSecondary },
  listContainer: { paddingBottom: 20 },
  card: { backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  safeCard: { borderLeftWidth: 6, borderLeftColor: COLORS.success },
  criticalCard: { borderLeftWidth: 6, borderLeftColor: COLORS.danger },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectCode: { fontSize: 16, fontWeight: 'bold', color: COLORS.textSecondary },
  subjectName: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginVertical: 4 },
  percentageText: { fontSize: 18, fontWeight: 'bold' },
  textSafe: { color: COLORS.success },
  textCritical: { color: COLORS.danger },
  statsText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  warningText: { fontSize: 12, color: COLORS.danger, fontWeight: 'bold', marginTop: 6 }
});