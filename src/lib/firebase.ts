import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ATENÇÃO: Substitua pelas configurações reais do seu projeto Firebase!
// Você pode encontrar essas configurações no console do Firebase:
// Configurações do projeto > Geral > Seus apps > Configuração do SDK
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE", // Substitua
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Substitua
  projectId: "YOUR_PROJECT_ID_HERE", // Substitua
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Substitua
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE", // Substitua
  appId: "YOUR_APP_ID_HERE", // Substitua
  measurementId: "YOUR_MEASUREMENT_ID_HERE" // Opcional, para Google Analytics
};

// Inicializar o Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

// Verificação para garantir que as credenciais foram alteradas
if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE" || firebaseConfig.projectId === "YOUR_PROJECT_ID_HERE") {
  console.warn(
    "FIREBASE NÃO CONFIGURADO: Por favor, atualize src/lib/firebase.ts com as credenciais do seu projeto Firebase para que a autenticação e outras funcionalidades do Firebase funcionem corretamente."
  );
}
