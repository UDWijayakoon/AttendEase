import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { provisionUserAccount } from '../storage';
import { COLORS } from '../theme';

export default function LoginScreen({ onLoginSuccess }) {
  const [fullName, setFullName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [degree, setDegree] = useState('BSc in Information & Communication Technology');
  const [institution, setInstitution] = useState('University of Vavuniya');
  const [academicLevel, setAcademicLevel] = useState('Year 3 - Semester I');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionStep, setProvisionStep] = useState('');

  const handleAutomatedLogin = async () => {
    if (!fullName.trim() || !regNumber.trim()) {
      Alert.alert('Required Details', 'Please enter your Full Name and University Registration Number.');
      return;
    }

    setIsProvisioning(true);
    setProvisionStep('Checking for an existing profile...');

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setProvisionStep('Preparing your local attendance workspace...');
      await new Promise(resolve => setTimeout(resolve, 700));
      const result = await provisionUserAccount({
        fullName,
        regNumber,
        degree,
        institution,
        academicLevel,
      });

      setProvisionStep(
        result.isNew
          ? 'New profile created!'
          : 'Welcome back! Restoring your workspace...'
      );
      await new Promise(resolve => setTimeout(resolve, 700));
      onLoginSuccess(result.profile);
    } catch (error) {
      Alert.alert('Setup Error', 'Unable to initialize your profile. Please try again.');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerSection}>
          <View style={styles.logoBadge}>
            <Ionicons name="school" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>AttendEase</Text>
          <Text style={styles.brandSubtitle}>Smart Academic Attendance & Compliance Portal</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Student Sign In</Text>
            <View style={styles.autoBadge}>
              <Ionicons name="sparkles" size={12} color={COLORS.primary} />
              <Text style={styles.autoBadgeText}>Auto-Setup</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            Set up a student profile on this device to personalize your attendance dashboard and threshold tracker.
          </Text>

          <Text style={styles.label}>FULL NAME *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., Uthsara"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
              editable={!isProvisioning}
            />
          </View>

          <Text style={styles.label}>UNIVERSITY REGISTRATION NO *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="card-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., 2022ICT70"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              value={regNumber}
              onChangeText={setRegNumber}
              editable={!isProvisioning}
            />
          </View>

          <Text style={styles.label}>DEGREE PROGRAM</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="book-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={degree}
              onChangeText={setDegree}
              editable={!isProvisioning}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>INSTITUTION</Text>
              <TextInput
                style={styles.compactInput}
                value={institution}
                onChangeText={setInstitution}
                editable={!isProvisioning}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>ACADEMIC LEVEL</Text>
              <TextInput
                style={styles.compactInput}
                value={academicLevel}
                onChangeText={setAcademicLevel}
                editable={!isProvisioning}
              />
            </View>
          </View>

          {isProvisioning ? (
            <View style={styles.provisioningBox}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.provisioningText}>{provisionStep}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleAutomatedLogin}>
              <Text style={styles.submitButtonText}>Continue to Workspace</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.footerNote}>
          Local profile setup • 80% attendance target
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  headerSection: { alignItems: 'center', marginBottom: 24 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.textPrimary, letterSpacing: 0.3 },
  brandSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 19, fontWeight: 'bold', color: COLORS.textPrimary },
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  autoBadgeText: { fontSize: 11, fontWeight: 'bold', color: COLORS.primary },
  cardDescription: { fontSize: 12.5, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: 'bold', color: COLORS.textSecondary, marginBottom: 6, letterSpacing: 0.5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 11, fontSize: 14, color: COLORS.textPrimary },
  rowInputs: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  compactInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  provisioningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  provisioningText: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  footerNote: { textAlign: 'center', fontSize: 11.5, color: COLORS.textSecondary, marginTop: 20 },
});