import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, runTransaction } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Listen to stats from Realtime Database
export const listenToHomeStats = (callback) => {
  const dbRef = ref(database, 'stats');
  
  // onValue listens for real-time updates
  const unsubscribe = onValue(dbRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      console.log("No data available at 'stats' node. Will use default stats until seeded.");
      callback({
        totalVisits: 14502,
        verifiedUsers: 1432,
        totalResources: 345
      });
    }
  }, (error) => {
    console.error("Error listening to stats from Realtime Database:", error);
    callback({
      totalVisits: 14502,
      verifiedUsers: 1432,
      totalResources: 345
    });
  });

  return unsubscribe; // Return unsubscribe function for cleanup
};

// Auto-Increment and Seed Stats
export const incrementVisitCount = async () => {
    const visitsRef = ref(database, 'stats/totalVisits');
    try {
        await runTransaction(visitsRef, (currentVisits) => {
            if (currentVisits === null) {
                return 14503;
            }
            return currentVisits + 1;
        });
    } catch (e) {
        console.error("Failed to increment visits", e);
    }
}

export const incrementResourceCount = async (count = 1) => {
    const resourceRef = ref(database, 'stats/totalResources');
    try {
        await runTransaction(resourceRef, (currentCount) => {
            if (currentCount === null) {
                return 345 + count;
            }
            return currentCount + count;
        });
    } catch (e) {
        console.error("Failed to increment resources", e);
    }
}

export const incrementVerifiedUserCount = async () => {
    const verifiedUsersRef = ref(database, 'stats/verifiedUsers');
    try {
        await runTransaction(verifiedUsersRef, (currentCount) => {
            if (currentCount === null) {
                return 1433;
            }
            return currentCount + 1;
        });
    } catch (e) {
        console.error("Failed to increment verified users", e);
    }
}

export { app, database as db, analytics };
