AttendEase 📱🎓

AttendEase is a cross-platform mobile application built with React Native and Expo designed to help university students track their lecture attendance, monitor minimum attendance thresholds, manage weekly timetables, and securely store absence evidence for mandatory assessments (ICAs and exams).

✨ Key Features

📊 Attendance Tracking & Analytics:

Log daily attendance (Present or Absent) for regular and extra makeup sessions.

Real-time calculation of attendance percentages per subject with automatic critical-threshold alerts (defaulting to the 80% university requirement).

📅 Weekly Timetable Management:

Organize daily lecture schedules with course codes, time slots, and lecture hall/lab locations.

⏰ Mandatory Dates & ICAs:

Track upcoming Continuous Assessments (ICAs) and formal examination deadlines.

Add or remove assessment schedules seamlessly with confirmation prompts.

📂 Offline Absence Evidence Folder:

Upload and store medical certificates or excuse letters (PDFs and images) directly on the device's local sandboxed storage (absence-evidence/).

Track verification statuses (Pending Verification) for missed mandatory dates.

👤 Student Account Provisioning:

Personalized student profile storing registration numbers, degree programs, academic levels, and institutional details (tailored for the University of Vavuniya).

🛠️ Tech Stack

Framework: React Native (Expo SDK)

Navigation: React Navigation (@react-navigation/native)

Local Persistence: @react-native-async-storage/async-storage

File Management & Picking: expo-document-picker & expo-file-system

Icons: @expo/vector-icons (Ionicons)

🚀 Getting Started

Prerequisites

Make sure you have the following installed on your development machine:

Node.js (LTS recommended)

Git

Expo Go app installed on your Android or iOS device (or an Android/iOS emulator).

Installation & Setup

Clone the repository:

git clone https://github.com/UDWijayakoon/AttendEase.git
cd AttendEase


Install dependencies:

npm install


Start the Expo development server:

npx expo start -c


Run on your device:

Scan the QR code in your terminal using the Expo Go app (Android) or Camera app (iOS).

Press a in the terminal to launch on an Android emulator, or i for an iOS simulator.

📁 Project Structure

AttendEase/
├── src/
│   ├── screens/
│   │   ├── MandatoryDatesScreen.js   # Tracks ICAs, exams & absence evidence uploads
│   │   └── ...                       # Dashboard, Subjects, Timetable, & Profile screens
│   ├── storage.js                    # AsyncStorage CRUD operations & stats calculation
│   └── theme.js                      # Application color palette & styling constants
├── App.js                            # Main entry point & navigation container
├── package.json                      # Dependencies and Expo scripts
└── README.md                         # Project documentation


🔒 Data Privacy & Offline Storage

All attendance logs, timetables, student profiles, and uploaded medical/excuse documents are stored 100% locally on the user's device using AsyncStorage and Expo's private document directory (Paths.document), ensuring full offline availability and data privacy.

🤝 Contributing

Create a new feature branch (git checkout -b feature/your-feature-name).

Commit your changes (git commit -m "Add your feature").

Push to the branch (git push origin feature/your-feature-name).

Open a Pull Request to merge into main.