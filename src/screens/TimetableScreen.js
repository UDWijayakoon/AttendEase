import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTimetable, getSubjects, addTimetableSlot } from '../storage';
import { COLORS } from '../theme';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimetableScreen() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for new slot
  const [formDay, setFormDay] = useState('Monday');
  const [subjectId, setSubjectId] = useState('');
  const [time, setTime] = useState('');
  const [room, setRoom] = useState('');

  const loadData = async () => {
    setRefreshing(true);
    const loadedTimetable = await getTimetable();
    const loadedSubjects = await getSubjects();
    setTimetable(loadedTimetable);
    setSubjects(loadedSubjects);
    if (loadedSubjects.length > 0 && !subjectId) {
      setSubjectId(loadedSubjects[0].id);
    }
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleAddSlot = async () => {
    if (!time.trim() || !room.trim() || !subjects.some(subject => subject.id === subjectId)) {
      Alert.alert('Error', 'Please fill in all fields (Subject, Time, and Room).');
      return;
    }

    const newSlot = { day: formDay, subjectId, time: time.trim(), room: room.trim() };

    try {
      const updatedTimetable = await addTimetableSlot(newSlot);
      setTimetable(updatedTimetable);
      setSelectedDay(formDay);
      setTime('');
      setRoom('');
      setShowAddForm(false);
      Alert.alert('Success', 'Timetable slot added successfully!');
    } catch (e) {
      Alert.alert('Error', 'Failed to add timetable slot. Please try again.');
    }
  };

  const filteredSlots = timetable.filter(item => item.day === selectedDay);

  const getSubjectDetails = (subId) => {
    return subjects.find(s => s.id === subId) || { code: 'N/A', name: 'Unknown Subject' };
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
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
    >
      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>Weekly Timetable</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.toggleButtonText}>{showAddForm ? 'Cancel' : '+ Add Slot'}</Text>
        </TouchableOpacity>
      </View>

      {/* Add Slot Form Modal/Card */}
      {showAddForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add Class to Timetable</Text>

          <Text style={styles.inputLabel}>Select Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.miniDaysRow}>
            {DAYS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.miniDayChip, formDay === d && styles.activeMiniDayChip]}
                onPress={() => setFormDay(d)}
              >
                <Text style={[styles.miniDayChipText, formDay === d && styles.activeMiniDayChipText]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.inputLabel}>Select Subject Code</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.miniDaysRow}>
            {subjects.length > 0 ? subjects.map(sub => (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.miniDayChip, subjectId === sub.id && styles.activeMiniDayChip]}
                  onPress={() => setSubjectId(sub.id)}
                >
                  <Text style={[styles.miniDayChipText, subjectId === sub.id && styles.activeMiniDayChipText]}>{sub.code}</Text>
                </TouchableOpacity>
              )) : (
                <Text style={styles.emptyText}>Add a subject before scheduling a class.</Text>
              )}
          </ScrollView>

          <Text style={styles.inputLabel}>Time Slot (e.g., 09:00 AM - 11:00 AM)</Text>
          <TextInput
            style={styles.input}
            placeholder="09:00 AM - 11:00 AM"
            value={time}
            onChangeText={setTime}
          />

          <Text style={styles.inputLabel}>Room / Hall (e.g., Lab 3 or Hall A)</Text>
          <TextInput
            style={styles.input}
            placeholder="Lab 3"
            value={room}
            onChangeText={setRoom}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleAddSlot}>
            <Text style={styles.saveButtonText}>Save Timetable Slot</Text>
          </TouchableOpacity>
        </View>
      )}

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
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No classes scheduled for {selectedDay}.</Text>
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background, flexGrow: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
  toggleButton: { backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  toggleButtonText: { color: COLORS.cardBg, fontWeight: 'bold', fontSize: 13 },
  formCard: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSecondary, marginBottom: 4, marginTop: 8, textTransform: 'uppercase' },
  miniDaysRow: { flexDirection: 'row', marginBottom: 4 },
  miniDayChip: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: COLORS.background, borderRadius: 6, marginRight: 6, borderWidth: 1, borderColor: COLORS.border },
  activeMiniDayChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  miniDayChipText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSecondary },
  activeMiniDayChipText: { color: COLORS.cardBg },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, fontSize: 14, color: COLORS.textPrimary },
  saveButton: { backgroundColor: COLORS.success, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 14 },
  saveButtonText: { color: COLORS.cardBg, fontWeight: 'bold', fontSize: 14 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, marginTop: 6 },
  dayChip: { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: COLORS.border, borderRadius: 8, alignItems: 'center' },
  activeDayChip: { backgroundColor: COLORS.primary },
  dayChipText: { fontSize: 13, fontWeight: 'bold', color: COLORS.textSecondary },
  activeDayChipText: { color: COLORS.cardBg },
  selectedDayHeader: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
  slotCard: { backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 5, borderLeftColor: COLORS.primary, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subjectCode: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  timeText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  subjectName: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  roomText: { fontSize: 13, color: COLORS.textSecondary },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 30, fontSize: 15 }
});