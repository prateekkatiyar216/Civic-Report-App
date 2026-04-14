import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB0187ObcG55-nUqcNZnYP4Hi3fLy2rYys",
  authDomain: "civicreport-d95bc.firebaseapp.com",
  projectId: "civicreport-d95bc",
  storageBucket: "civicreport-d95bc.firebasestorage.app",
  messagingSenderId: "180781376671",
  appId: "1:180781376671:web:1c2cfa6a6e9d6d8dfb2eaa",
};

// Prevent double initialization on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: ReturnType<typeof getAuth>;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { auth };
