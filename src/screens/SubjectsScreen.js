import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Alert, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSubjects, addSubject, getAttendanceLogs, calculateSubjectStats } from '../storage';
import { COLORS } from '../theme';

export default function SubjectsScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Form state for adding a new subject
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [targetPercentage, setTargetPercentage] = useState('80');

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

  const handleAddSubject = async () => {
    if (!code.trim() || !name.trim()) {
      Alert.alert('Error', 'Please enter both a subject code and a name.');
      return;
    }

    const newSub = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      targetPercentage: parseFloat(targetPercentage) || 80
    };

    try {
      await addSubject(newSub);
      setCode('');
      setName('');
      setTargetPercentage('80');
      Alert.alert('Success', 'New subject added successfully!');
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Failed to add subject. Please try again.');
    }
  };

  const renderSubjectItem = ({ item }) => {
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
        <Text style={styles.statsDetail}>
          Attended: {stats.totalAttended} / {stats.totalConducted} sessions
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.screenTitle}>Manage Subjects</Text>

      {/* Add Subject Form Container */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add New Subject</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Subject Code (e.g., ICT3104)"
          value={code}
          onChangeText={setCode}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Subject Name (e.g., Operating Systems)"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Target % (default 80)"
          value={targetPercentage}
          onChangeText={setTargetPercentage}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddSubject}>
          <Text style={styles.addButtonText}>+ Add Subject</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Your Subject List</Text>

      <FlatList
        data={subjects}
        keyExtractor={item => item.id}
        renderItem={renderSubjectItem}
        scrollEnabled={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No subjects added yet.</Text>}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background, flexGrow: 1 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  formCard: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, fontSize: 15, marginBottom: 10, color: COLORS.textPrimary },
  addButton: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  addButtonText: { color: COLORS.cardBg, fontSize: 15, fontWeight: 'bold' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  subjectCard: { backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  safeBorder: { borderLeftColor: COLORS.success },
  criticalBorder: { borderLeftColor: COLORS.danger },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subjectCode: { fontSize: 14, fontWeight: 'bold', color: COLORS.textSecondary, textTransform: 'uppercase' },
  percentageText: { fontSize: 16, fontWeight: 'bold' },
  textSafe: { color: COLORS.success },
  textCritical: { color: COLORS.danger },
  subjectName: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  statsDetail: { fontSize: 13, color: COLORS.textSecondary },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 20, fontSize: 15 }
});