import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAttendanceLogs, getSubjects } from '../storage';
import { COLORS } from '../theme';

export default function CalendarScreen() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dateInput, setDateInput] = useState(todayStr);
  const [dateError, setDateError] = useState('');
  const [logs, setLogs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [loadedLogs, loadedSubjects] = await Promise.all([
        getAttendanceLogs(),
        getSubjects()
      ]);
      setLogs(loadedLogs);
      setSubjects(loadedSubjects);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleDateChange = () => {
    const date = dateInput.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!match) {
      setDateError('Enter a date in YYYY-MM-DD format.');
      return;
    }

    const [, year, month, day] = match;
    const parsedDate = new Date(0);
    parsedDate.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
    if (
      parsedDate.getUTCFullYear() !== Number(year) ||
      parsedDate.getUTCMonth() !== Number(month) - 1 ||
      parsedDate.getUTCDate() !== Number(day)
    ) {
      setDateError('Enter a valid calendar date.');
      return;
    }

    setDateError('');
    setDateInput(date);
    setSelectedDate(date);
  };

  const dayLogs = logs.filter(log => log.date === selectedDate);
  const presentCount = dayLogs.filter(log => log.status === 'Present').length;
  const absentCount = dayLogs.length - presentCount;

  const getSubjectDetails = (subjectId) => {
    return subjects.find(s => s.id === subjectId) || { code: 'N/A', name: 'Unknown Subject' };
  };

  const renderLogItem = ({ item }) => {
    const subject = getSubjectDetails(item.subjectId);
    const isPresent = item.status === 'Present';

    return (
      <View style={[styles.logCard, isPresent ? styles.presentCard : styles.absentCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.subjectCode}>{subject.code}</Text>
          <Text style={[styles.statusBadge, isPresent ? styles.textPresent : styles.textAbsent]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.subjectName}>{subject.name}</Text>
        <Text style={styles.sessionType}>Session: {item.sessionType || 'Regular'}</Text>
        {item.notes ? <Text style={styles.notesText}>Note: {item.notes}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Date Selector Box */}
      <View style={styles.dateSelectorCard}>
        <Text style={styles.dateLabel}>Select Date (YYYY-MM-DD)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.dateInput}
            value={dateInput}
            onChangeText={value => {
              setDateInput(value);
              setDateError('');
            }}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
            onSubmitEditing={handleDateChange}
            accessibilityLabel="Attendance date, YYYY-MM-DD"
          />
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleDateChange}
            accessibilityRole="button"
          >
            <Text style={styles.applyButtonText}>View</Text>
          </TouchableOpacity>
        </View>
        {dateError ? <Text style={styles.dateError}>{dateError}</Text> : null}

        <TouchableOpacity
          style={styles.todayChip}
          onPress={() => {
            setDateInput(todayStr);
            setSelectedDate(todayStr);
            setDateError('');
          }}
          accessibilityRole="button"
        >
          <Text style={styles.todayChipText}>Set Today</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>Logs for {selectedDate}</Text>
        {dayLogs.length > 0 ? (
          <Text style={styles.summaryText}>
            {dayLogs.length} session{dayLogs.length === 1 ? '' : 's'} - {presentCount} present - {absentCount} absent
          </Text>
        ) : null}
      </View>

      <FlatList
        data={dayLogs}
        keyExtractor={item => item.id}
        renderItem={renderLogItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No attendance records logged for this date.</Text>
            <Text style={styles.emptySubText}>Choose another date or log a new session from the dashboard.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  dateSelectorCard: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  dateLabel: { fontSize: 13, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  dateInput: { flex: 1, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, color: COLORS.textPrimary, fontWeight: 'bold' },
  dateError: { color: COLORS.danger, fontSize: 13, marginBottom: 10 },
  applyButton: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  applyButtonText: { color: COLORS.cardBg, fontWeight: 'bold', fontSize: 14 },
  todayChip: { alignSelf: 'flex-start', backgroundColor: COLORS.background, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 16 },
  todayChipText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },
  sectionHeaderRow: { marginBottom: 12 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  summaryText: { fontSize: 13, color: COLORS.textSecondary },
  listContainer: { paddingBottom: 20 },
  logCard: { backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 5 },
  presentCard: { borderLeftColor: COLORS.success },
  absentCard: { borderLeftColor: COLORS.danger },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subjectCode: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  statusBadge: { fontSize: 14, fontWeight: 'bold' },
  textPresent: { color: COLORS.success },
  textAbsent: { color: COLORS.danger },
  subjectName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  sessionType: { fontSize: 13, color: COLORS.textSecondary },
  notesText: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 30, paddingHorizontal: 20 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  emptySubText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 6 }
});