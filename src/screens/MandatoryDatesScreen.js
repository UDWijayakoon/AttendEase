import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, Alert, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { getMandatoryDates, addMandatoryDate, getSubjects, getAbsenceEvidence, saveAbsenceEvidence } from '../storage';
import { COLORS } from '../theme';

export default function MandatoryDatesScreen() {
  const [mandatoryDates, setMandatoryDates] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [evidenceList, setEvidenceList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  // Form state for new mandatory date / ICA
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('ICA'); // 'ICA' or 'Exam'
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [dates, subs, evidence] = await Promise.all([
        getMandatoryDates(),
        getSubjects(),
        getAbsenceEvidence()
      ]);
      setMandatoryDates(dates);
      setSubjects(subs);
      setEvidenceList(evidence);
      if (subs.length > 0 && !selectedSubjectCode) {
        setSelectedSubjectCode(subs[0].code);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleSaveMandatoryDate = async () => {
    if (!title.trim() || !date.trim()) {
      Alert.alert('Required Fields', 'Please enter a title and date for the ICA/Exam.');
      return;
    }

    try {
      const newItem = {
        title: title.trim(),
        date: date.trim(),
        type,
        subjectCode: selectedSubjectCode || 'GENERAL'
      };
      const updated = await addMandatoryDate(newItem);
      setMandatoryDates(updated);
      setTitle('');
      setDate('');
      setModalVisible(false);
      Alert.alert('Success', 'ICA / Exam deadline registered successfully.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save mandatory date.');
    }
  };

  const handleUploadRealEvidence = async (mandatoryDate) => {
    setIsUploadingEvidence(true);
    let copiedFileUri;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) {
        throw new Error('Document picker returned no selected file.');
      }

      const evidenceDirectory = new Directory(Paths.document, 'absence-evidence');
      evidenceDirectory.create({ idempotent: true, intermediates: true });

      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'evidence';
      const storedFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeFileName}`;
      const storedFile = new File(file.uri);
      const destinationFile = new File(evidenceDirectory, storedFileName);
      await storedFile.copy(destinationFile);
      copiedFileUri = destinationFile.uri;

      const updated = await saveAbsenceEvidence({
        title: `Medical / Excuse for ${mandatoryDate.title}`,
        status: 'Pending Verification',
        mandatoryDateId: mandatoryDate.id,
        subjectCode: mandatoryDate.subjectCode,
        fileUri: destinationFile.uri,
        fileName: file.name,
        mimeType: file.mimeType,
        fileSize: file.size,
      });
      copiedFileUri = null;
      setEvidenceList(updated);
      Alert.alert('Success', `Saved "${file.name}" to this device's evidence folder.`);
    } catch (e) {
      if (copiedFileUri) {
        try {
          new File(copiedFileUri).delete();
        } catch (cleanupError) {
          console.error('Failed to remove unsaved absence evidence file', cleanupError);
        }
      }
      Alert.alert('Error', 'Failed to save the selected document locally. Please try again.');
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={COLORS.primary} />}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.screenTitle}>Mandatory Dates & ICAs</Text>
          <Text style={styles.screenSubtitle}>Track critical assessments & upload excuse records</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add ICA</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming ICA & Exam Deadlines */}
      <Text style={styles.sectionHeader}>Upcoming Assessments & Exams</Text>
      {mandatoryDates.length > 0 ? (
        mandatoryDates.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.badge, item.type === 'Exam' ? styles.examBadge : styles.icaBadge]}>
                <Text style={[styles.badgeText, item.type === 'Exam' ? styles.examText : styles.icaText]}>
                  {item.type}
                </Text>
              </View>
              <Text style={styles.subjectCodeTag}>{item.subjectCode}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.dateText}>Due Date: {item.date}</Text>
            </View>

            <TouchableOpacity
              style={styles.uploadEvidenceBtn}
              onPress={() => handleUploadRealEvidence(item)}
              disabled={isUploadingEvidence}
            >
              <Ionicons name="cloud-upload-outline" size={15} color={COLORS.primary} />
              <Text style={styles.uploadEvidenceText}>
                {isUploadingEvidence ? 'Saving Evidence…' : 'Upload Absence Evidence / Medical'}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No mandatory dates scheduled.</Text>
      )}

      {/* Uploaded Absence Evidence Folder */}
      <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Absence Evidence Folder</Text>
      {evidenceList.length > 0 ? (
        evidenceList.map(ev => (
          <View key={ev.id} style={styles.evidenceRow}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.evidenceTitle}>{ev.title}</Text>
              <Text style={styles.evidenceMeta}>Uploaded: {new Date(ev.uploadedAt).toLocaleDateString()}</Text>
              {ev.fileName ? <Text style={styles.evidenceFile} numberOfLines={1}>{ev.fileName}</Text> : null}
            </View>
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>{ev.status}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No excuse documents uploaded yet.</Text>
      )}

      {/* Add ICA Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule New ICA / Exam</Text>

            <Text style={styles.label}>Assessment Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Software Engineering ICA 03"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-12-05"
              placeholderTextColor="#94A3B8"
              value={date}
              onChangeText={setDate}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeOption, type === 'ICA' && styles.typeOptionActive]}
                onPress={() => setType('ICA')}
              >
                <Text style={[styles.typeOptionText, type === 'ICA' && styles.typeTextActive]}>ICA / Assessment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, type === 'Exam' && styles.typeOptionActive]}
                onPress={() => setType('Exam')}
              >
                <Text style={[styles.typeOptionText, type === 'Exam' && styles.typeTextActive]}>Formal Exam</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Subject Code</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectChipRow}>
              {subjects.map(sub => (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.subChip, selectedSubjectCode === sub.code && styles.subChipActive]}
                  onPress={() => setSelectedSubjectCode(sub.code)}
                >
                  <Text style={[styles.subChipText, selectedSubjectCode === sub.code && styles.subChipTextActive]}>
                    {sub.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSaveMandatoryDate}>
                <Text style={styles.saveModalBtnText}>Save Deadline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background, flexGrow: 1, paddingBottom: 36 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  screenSubtitle: { fontSize: 12.5, color: COLORS.textSecondary, marginTop: 2 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  sectionHeader: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  card: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  icaBadge: { backgroundColor: '#E0E7FF' },
  examBadge: { backgroundColor: COLORS.dangerBg },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  icaText: { color: COLORS.primary },
  examText: { color: COLORS.danger },
  subjectCodeTag: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSecondary },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  dateText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  uploadEvidenceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primaryLight, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#C7D2FE' },
  uploadEvidenceText: { fontSize: 12.5, fontWeight: 'bold', color: COLORS.primary },
  evidenceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  evidenceTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  evidenceMeta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  evidenceFile: { fontSize: 10.5, color: COLORS.primary, marginTop: 1 },
  statusChip: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusChipText: { fontSize: 10, fontWeight: 'bold', color: '#B45309' },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, fontStyle: 'italic', marginVertical: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.cardBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  label: { fontSize: 11.5, fontWeight: 'bold', color: COLORS.textSecondary, marginTop: 12, marginBottom: 6, letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.textPrimary },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeOption: { flex: 1, padding: 12, backgroundColor: COLORS.background, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  typeOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeOptionText: { fontWeight: 'bold', color: COLORS.textSecondary, fontSize: 13 },
  typeTextActive: { color: '#FFFFFF' },
  subjectChipRow: { flexDirection: 'row', marginVertical: 4 },
  subChip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.background, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  subChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  subChipText: { fontWeight: 'bold', color: COLORS.textSecondary, fontSize: 12 },
  subChipTextActive: { color: '#FFFFFF' },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, padding: 14, backgroundColor: COLORS.background, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelBtnText: { fontWeight: 'bold', color: COLORS.textSecondary },
  saveModalBtn: { flex: 1, padding: 14, backgroundColor: COLORS.primary, borderRadius: 10, alignItems: 'center' },
  saveModalBtnText: { fontWeight: 'bold', color: '#FFFFFF' }
});