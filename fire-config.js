// firebase-config.js
// Copy this from your Firebase console (Project Settings > SDK setup)

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_CONFIG_HERE",
  authDomain: "YOUR_FIREBASE_CONFIG_HERE",
  databaseURL: "YOUR_FIREBASE_CONFIG_HERE",
  projectId: "YOUR_FIREBASE_CONFIG_HERE",
  storageBucket: "YOUR_FIREBASE_CONFIG_HERE",
  messagingSenderId: "YOUR_FIREBASE_CONFIG_HERE",
  appId: "YOUR_FIREBASE_CONFIG_HERE"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();