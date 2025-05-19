
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// ATENÇÃO: Configurações do Firebase foram comentadas para desativar a conexão com o backend.
// Para reativar, descomente este bloco e as importações acima,
// e substitua pelas credenciais reais do seu projeto Firebase.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE",
  measurementId: "YOUR_MEASUREMENT_ID_HERE", // Opcional, para Google Analytics
};

// Inicializar o Firebase (comentado)
let app: FirebaseApp | undefined;
// if (!getApps().length) {
//   app = initializeApp(firebaseConfig);
// } else {
//   app = getApp();
// }

// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

// Mock simple auth and db objects if needed for type consistency without full firebase
const mockAuth = { currentUser: null }; // Simplificação
const mockDb = {};
const mockStorage = {};

// export { app, auth, db, storage };
// Exportar mocks para evitar erros de importação em outros lugares, se não forem removidos
export { app, mockAuth as auth, mockDb as db, mockStorage as storage };

console.warn(
  "FIREBASE DESCONECTADO: A aplicação está operando em modo mock. As interações com o backend Firebase estão desativadas. Para conectar, atualize src/lib/firebase.ts com suas credenciais e descomente as inicializações."
);
