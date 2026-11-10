import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBJECTS_KEY = '@attendease_subjects';
const LOGS_KEY = '@attendease_logs';
const TIMETABLE_KEY = '@attendease_timetable';

const INITIAL_SUBJECTS = [
  { id: '1', code: 'ICT3101', name: 'Software Engineering', targetPercentage: 80 },
  { id: '2', code: 'ICT3102', name: 'Database Management Systems', targetPercentage: 80 },
  { id: '3', code: 'ICT3103', name: 'Computer Networks', targetPercentage: 80 }
];

const INITIAL_LOGS = [
  { id: 'l1', subjectId: '1', date: '2026-11-01', status: 'Present', sessionType: 'Regular', notes: 'Intro lecture' },
  { id: 'l2', subjectId: '1', date: '2026-11-03', status: 'Absent', sessionType: 'Regular', notes: 'Missed class' },
  { id: 'l3', subjectId: '2', date: '2026-11-02', status: 'Present', sessionType: 'Extra', notes: 'Saturday makeup class' }
];

const INITIAL_TIMETABLE = [
  { id: 't1', day: 'Monday', subjectId: '1', time: '09:00 AM - 11:00 AM', room: 'Lab 3' },
  { id: 't2', day: 'Monday', subjectId: '2', time: '01:00 PM - 03:00 PM', room: 'Hall A' },
  { id: 't3', day: 'Tuesday', subjectId: '3', time: '10:00 AM - 12:00 PM', room: 'Lab 1' },
  { id: 't4', day: 'Wednesday', subjectId: '1', time: '08:30 AM - 10:30 AM', room: 'Hall B' },
  { id: 't5', day: 'Thursday', subjectId: '2', time: '01:00 PM - 03:00 PM', room: 'Lab 2' },
  { id: 't6', day: 'Friday', subjectId: '3', time: '09:00 AM - 11:00 AM', room: 'Hall C' }
];

export const initializeData = async () => {
  try {
    const existingSubjects = await AsyncStorage.getItem(SUBJECTS_KEY);
    if (!existingSubjects) {
      await AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(INITIAL_SUBJECTS));
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_LOGS));
      await AsyncStorage.setItem(TIMETABLE_KEY, JSON.stringify(INITIAL_TIMETABLE));
    }
  } catch (e) {
    console.error('Failed to initialize local data', e);
  }
};

export const resetData = async () => {
  await AsyncStorage.multiRemove([SUBJECTS_KEY, LOGS_KEY, TIMETABLE_KEY]);
  await AsyncStorage.multiSet([
    [SUBJECTS_KEY, JSON.stringify(INITIAL_SUBJECTS)],
    [LOGS_KEY, JSON.stringify(INITIAL_LOGS)],
    [TIMETABLE_KEY, JSON.stringify(INITIAL_TIMETABLE)]
  ]);
};

export const getSubjects = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SUBJECTS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error fetching subjects', e);
    return [];
  }
};

export const addSubject = async (subject) => {
  try {
    const currentSubjects = await getSubjects();
    const newSubject = {
      ...subject,
      id: Date.now().toString(),
      targetPercentage: subject.targetPercentage ? parseFloat(subject.targetPercentage) : 80
    };
    const updatedSubjects = [newSubject, ...currentSubjects];
    await AsyncStorage.setItem(SUBJECTS_KEY, JSON.stringify(updatedSubjects));
    return updatedSubjects;
  } catch (e) {
    console.error('Error adding subject', e);
    throw e;
  }
};

export const getAttendanceLogs = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(LOGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error fetching attendance logs', e);
    return [];
  }
};

export const addAttendanceLog = async (newLog) => {
  try {
    const currentLogs = await getAttendanceLogs();
    const logWithId = { ...newLog, id: Date.now().toString() };
    const updatedLogs = [logWithId, ...currentLogs];
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
    return updatedLogs;
  } catch (e) {
    console.error('Error adding attendance log', e);
    throw e;
  }
};

export const getTimetable = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(TIMETABLE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error fetching timetable', e);
    return [];
  }
};

export const addTimetableSlot = async (slot) => {
  try {
    const current = await getTimetable();
    const newSlot = { ...slot, id: Date.now().toString() };
    const updated = [newSlot, ...current];
    await AsyncStorage.setItem(TIMETABLE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error adding timetable slot', e);
    throw e;
  }
};

export const calculateSubjectStats = (subjectId, logs) => {
  const subjectLogs = logs.filter(l => l.subjectId === subjectId);
  const totalConducted = subjectLogs.length;
  const totalAttended = subjectLogs.filter(l => l.status === 'Present').length;
  const percentage = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : 100.0;
  
  return {
    totalConducted,
    totalAttended,
    percentage: parseFloat(percentage),
    isCritical: parseFloat(percentage) < 80.0
  };
};