const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixNav() {
  const docRef = doc(db, 'profiles', 'default');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    if (data.navConfig) {
      const hasStore = data.navConfig.find(n => n.id === 'store');
      if (!hasStore) {
        const newNav = [...data.navConfig];
        // insert before contact
        const contactIdx = newNav.findIndex(n => n.id === 'contact');
        if (contactIdx > -1) {
          newNav.splice(contactIdx, 0, { id: 'store', label: 'Store', isHidden: false });
        } else {
          newNav.push({ id: 'store', label: 'Store', isHidden: false });
        }
        await updateDoc(docRef, { navConfig: newNav });
        console.log('Added Store to navConfig');
      }
    }
  }
}
fixNav().catch(console.error);