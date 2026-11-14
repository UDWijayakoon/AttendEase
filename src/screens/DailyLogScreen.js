import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSubjects, addAttendanceLog, calculateSubjectStats } from '../storage';
import { COLORS } from '../theme';

export default function DailyLogScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [status, setStatus] = useState('Present'); // 'Present' or 'Absent'
  const [sessionType, setSessionType] = useState('Regular'); // 'Regular', 'Extra', 'ICA', 'Exam'
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const loaded = await getSubjects();
    setSubjects(loaded);
    if (loaded.length > 0) {
      setSelectedSubjectId(loaded[0].id);
    }
  };

  // For an 80% threshold, (attended + x) / (conducted + x) >= 0.8
  // simplifies to x >= 4 * conducted - 5 * attended.
  const calculateRecoveryClasses = (attended, conducted) => {
    if (conducted === 0 || attended * 5 >= conducted * 4) return 0;
    return 4 * conducted - 5 * attended;
  };

  const handleSaveLog = async () => {
    if (!selectedSubjectId) {
      Alert.alert('Required Selection', 'Please select a subject first.');
      return;
    }

    const newLog = {
      subjectId: selectedSubjectId,
      date,
      status,
      sessionType,
      notes,
    };

    try {
      const updatedLogs = await addAttendanceLog(newLog);
      const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
      const stats = calculateSubjectStats(selectedSubjectId, updatedLogs);

      // Trigger Low Attendance Warning Notification if below 80% with exact recovery count
      if (stats.isCritical) {
        const classesNeeded = calculateRecoveryClasses(stats.totalAttended, stats.totalConducted);
        Alert.alert(
          '⚠️ Low Attendance Warning (Critical)',
          `${selectedSubject?.code || 'Subject'} is below the mandatory 80% threshold.\n\n• Attended: ${stats.totalAttended} / ${stats.totalConducted}\n• Action Required: Attend the next ${classesNeeded} consecutive ${classesNeeded === 1 ? 'class' : 'classes'} without absence to restore your exam eligibility.`,
          [{ text: 'Understood', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Attendance Recorded',
          `${selectedSubject?.code || 'Subject'} updated successfully (${stats.percentage}% compliant).`,
          [{ text: 'Done', onPress: () => navigation.goBack() }]
        );
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save attendance. Please try again.');
    }
  };

  const sessionTypes = [
    { key: 'Regular', label: 'Regular' },
    { key: 'Extra', label: 'Extra / Makeup' },
    { key: 'ICA', label: 'ICA / Assessment' },
    { key: 'Exam', label: 'Exam' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>SELECT SUBJECT</Text>
      <View style={styles.pickerRow}>
        {subjects.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            style={[styles.subjectChip, selectedSubjectId === sub.id && styles.selectedChip]}
            onPress={() => setSelectedSubjectId(sub.id)}
          >
            <Text style={[styles.chipText, selectedSubjectId === sub.id && styles.selectedChipText]}>
              {sub.code}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>ATTENDANCE STATUS</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, status === 'Present' && styles.presentActive]}
          onPress={() => setStatus('Present')}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={status === 'Present' ? '#FFFFFF' : COLORS.textSecondary}
          />
          <Text style={[styles.toggleText, status === 'Present' && styles.activeText]}>Present</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, status === 'Absent' && styles.absentActive]}
          onPress={() => setStatus('Absent')}
        >
          <Ionicons
            name="close-circle-outline"
            size={18}
            color={status === 'Absent' ? '#FFFFFF' : COLORS.textSecondary}
          />
          <Text style={[styles.toggleText, status === 'Absent' && styles.activeText]}>Absent</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>SESSION CATEGORY</Text>
      <View style={styles.categoryGrid}>
        {sessionTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[styles.categoryChip, sessionType === type.key && styles.typeActive]}
            onPress={() => setSessionType(type.key)}
          >
            <Text style={[styles.toggleText, sessionType === type.key && styles.activeText]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>DATE (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="2026-11-14"
        placeholderTextColor="#94A3B8"
      />

      <Text style={styles.label}>SESSION NOTES (OPTIONAL)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="e.g., ICA 02 practical evaluation or makeup lecture"
        placeholderTextColor="#94A3B8"
        multiline
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveLog}>
        <Ionicons name="save-outline" size={18} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>Save Attendance Record</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background, flexGrow: 1, paddingBottom: 32 },
  label: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontWeight: 'bold', fontSize: 13 },
  selectedChipText: { color: '#FFFFFF' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 13,
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presentActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  absentActive: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    width: '48.5%',
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  toggleText: { fontWeight: 'bold', color: COLORS.textSecondary, fontSize: 13 },
  activeText: { color: '#FFFFFF' },
  input: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 28,
    elevation: 2,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});