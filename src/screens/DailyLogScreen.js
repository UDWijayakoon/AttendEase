import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getSubjects, addAttendanceLog } from '../storage';

export default function DailyLogScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [status, setStatus] = useState('Present'); // 'Present' or 'Absent'
  const [sessionType, setSessionType] = useState('Regular'); // 'Regular' or 'Extra'
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

  const handleSaveLog = async () => {
    if (!selectedSubjectId) {
      Alert.alert('Error', 'Please select a subject first.');
      return;
    }

    const newLog = {
      subjectId: selectedSubjectId,
      date,
      status,
      sessionType,
      notes
    };

    await addAttendanceLog(newLog);
    Alert.alert('Success', 'Attendance logged successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Select Subject:</Text>
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

      <Text style={styles.label}>Attendance Status:</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, status === 'Present' && styles.presentActive]}
          onPress={() => setStatus('Present')}
        >
          <Text style={[styles.toggleText, status === 'Present' && styles.activeText]}>Present</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, status === 'Absent' && styles.absentActive]}
          onPress={() => setStatus('Absent')}
        >
          <Text style={[styles.toggleText, status === 'Absent' && styles.activeText]}>Absent</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Session Type:</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, sessionType === 'Regular' && styles.typeActive]}
          onPress={() => setSessionType('Regular')}
        >
          <Text style={[styles.toggleText, sessionType === 'Regular' && styles.activeText]}>Regular</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, sessionType === 'Extra' && styles.typeActive]}
          onPress={() => setSessionType('Extra')}
        >
          <Text style={[styles.toggleText, sessionType === 'Extra' && styles.activeText]}>Extra / Makeup</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Date (YYYY-MM-DD):</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="2026-11-04"
      />

      <Text style={styles.label}>Notes (Optional):</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="e.g. Lab session or makeup class"
        multiline
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveLog}>
        <Text style={styles.saveButtonText}>Save Attendance Record</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f9fa', flexGrow: 1 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectChip: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#e9ecef', borderRadius: 20, borderWidth: 1, borderColor: '#ced4da', marginRight: 8, marginBottom: 8 },
  selectedChip: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  chipText: { color: '#495057', fontWeight: '600' },
  selectedChipText: { color: '#fff' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  toggleButton: { flex: 1, padding: 12, backgroundColor: '#e9ecef', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ced4da' },
  presentActive: { backgroundColor: '#28a745', borderColor: '#28a745' },
  absentActive: { backgroundColor: '#dc3545', borderColor: '#dc3545' },
  typeActive: { backgroundColor: '#17a2b8', borderColor: '#17a2b8' },
  toggleText: { fontWeight: 'bold', color: '#495057' },
  activeText: { color: '#fff' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});