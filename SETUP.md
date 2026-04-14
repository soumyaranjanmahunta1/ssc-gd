# SSC GD Mock Test 2026 – Setup Guide

## ✅ What's Been Built

| Component | Status |
|-----------|--------|
| React Native 0.84.1 project | ✅ |
| Redux Toolkit (auth, test, bookmark slices) | ✅ |
| axios + offline cache (AsyncStorage) | ✅ |
| Firebase auth service | ✅ |
| Firestore service (results, stats, bookmarks) | ✅ |
| Node.js + Express + MongoDB backend | ✅ |
| 40+ question seed data | ✅ |
| All 9 screens | ✅ |
| Navigation (Stack + Bottom Tab) | ✅ |

---

## 🔥 STEP 1 – Firebase Setup (REQUIRED)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project → Add Android app
   - Package name: `com.sscgd`
3. Download `google-services.json`
4. Place it at: `android/app/google-services.json`
5. Enable **Email/Password** authentication in Firebase Console → Authentication
6. Enable **Firestore** in test mode

---

## ⚙️ STEP 2 – Android Gradle Config

In `android/build.gradle`, ensure inside `buildscript > dependencies`:
```groovy
classpath('com.google.gms:google-services:4.4.2')
```

In `android/app/build.gradle`, add at the bottom:
```groovy
apply plugin: 'com.google.gms.google-services'
```

And add Firebase BoM in dependencies:
```groovy
implementation platform('com.google.firebase:firebase-bom:33.1.0')
```

---

## 🔢 STEP 3 – Update API Base URL

In `src/utils/constants.js`, change `API_BASE_URL`:

```js
// Android Emulator
export const API_BASE_URL = 'http://10.0.2.2:5000/api';
// Physical device → find your PC IP:
export const API_BASE_URL = 'http://192.168.X.X:5000/api';
```

To find your PC's IP: run `ipconfig` in PowerShell → look for `IPv4 Address`

---

## 🛢️ STEP 4 – Start Backend

```powershell
cd d:\ReactNative\SSCGD\backend
npm install
node seed.js        # Seeds 40 questions
node server.js      # Starts on port 5000
```

Test: Open browser → http://localhost:5000/api/questions?subject=GK&limit=5

---

## 📱 STEP 5 – Run the App

```powershell
cd d:\ReactNative\SSCGD
npm install
npx react-native run-android
```

> Make sure an Android Emulator is running or a physical device is connected (USB debugging ON).

---

## 💡 Tips

- **Metro bundler:** Run `npx react-native start` in a separate terminal first
- **Clean build:** `cd android && ./gradlew clean`
- **Physical device:** Use `adb devices` to verify connection

---

## 📁 Project Structure

```
SSCGD/
├── backend/               ← Node.js + Express + MongoDB
│   ├── server.js
│   ├── models/Question.js
│   ├── routes/questions.js
│   └── seed.js
├── src/
│   ├── screens/           ← All 9 screens
│   ├── components/        ← (ready to add custom components)
│   ├── redux/             ← store + 3 slices
│   ├── services/          ← Firebase auth, Firestore, Axios
│   ├── navigation/        ← AppNavigator
│   └── utils/             ← theme, constants, helpers
├── App.tsx                ← Root app (JS, not TS)
└── android/app/
    └── google-services.json  ← ADD THIS FROM FIREBASE
```
