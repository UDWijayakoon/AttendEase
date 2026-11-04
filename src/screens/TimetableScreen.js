import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTimetable, getSubjects } from '../storage';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimetableScreen() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const loadedTimetable = await getTimetable();
    const loadedSubjects = await getSubjects();
    setTimetable(loadedTimetable);
    setSubjects(loadedSubjects);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Filter slots for the selected day
  const filteredSlots = timetable.filter(item => item.day === selectedDay);

  const getSubjectDetails = (subjectId) => {
    return subjects.find(s => s.id === subjectId) || { code: 'N/A', name: 'Unknown Subject' };
  };

  const renderSlotItem = ({ item }) => {
    const subject = getSubjectDetails(item.subjectId);

    return (
      <View style={styles.slotCard}>
        <View style={styles.slotHeader}>
          <Text style={styles.subjectCode}>{subject.code}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={styles.subjectName}>{subject.name}</Text>
        <Text style={styles.roomText}>📍 Room: {item.room || 'TBD'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Weekly Timetable</Text>
      
      {/* Day Selector Chips */}
      <View style={styles.daysRow}>
        {DAYS.map(day => (
          <TouchableOpacity
            key={day}
            style={[styles.dayChip, selectedDay === day && styles.activeDayChip]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayChipText, selectedDay === day && styles.activeDayChipText]}>
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.selectedDayHeader}>{selectedDay} Classes</Text>

      <FlatList
        data={filteredSlots}
        keyExtractor={item => item.id}
        renderItem={renderSlotItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No classes scheduled for {selectedDay}.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: '#212529', marginBottom: 12 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dayChip: { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#e9ecef', borderRadius: 8, alignItems: 'center' },
  activeDayChip: { backgroundColor: '#007AFF' },
  dayChipText: { fontSize: 13, fontWeight: 'bold', color: '#495057' },
  activeDayChipText: { color: '#fff' },
  selectedDayHeader: { fontSize: 18, fontWeight: 'bold', color: '#343a40', marginBottom: 10 },
  listContainer: { paddingBottom: 20 },
  slotCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dee2e6', borderLeftWidth: 5, borderLeftColor: '#007AFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subjectCode: { fontSize: 15, fontWeight: 'bold', color: '#007AFF' },
  timeText: { fontSize: 13, fontWeight: '600', color: '#6c757d' },
  subjectName: { fontSize: 17, fontWeight: 'bold', color: '#212529', marginBottom: 6 },
  roomText: { fontSize: 13, color: '#495057' },
  emptyText: { textAlign: 'center', color: '#adb5bd', marginTop: 40, fontSize: 15 }
});