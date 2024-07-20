
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {getDatabase} from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyA3wQYjRTXM1wft017zO4SzVPV5ptgR2ic",
  authDomain: "course-6af9f.firebaseapp.com",
  databaseURL: "https://course-6af9f-default-rtdb.firebaseio.com",
  projectId: "course-6af9f",
  storageBucket: "course-6af9f.appspot.com",
  messagingSenderId: "749809649190",
  appId: "1:749809649190:web:92f4d4dfe1718c9bc688e7"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { auth, db, storage, rtdb };
export default app;
