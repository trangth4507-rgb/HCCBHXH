import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
const secondaryAuth = getAuth(secondaryApp);

export async function createNewUser(username: string, password: string, role: 'admin' | 'user') {
  const email = `${username}@bhxh.local`;
  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const uid = userCredential.user.uid;
  
  await setDoc(doc(db, 'users', uid), {
    uid,
    username,
    email,
    role,
    createdAt: Date.now()
  });
  
  await secondaryAuth.signOut();
}
