
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ATENÇÃO: Substitua pelas configurações reais do seu projeto Firebase!
// Você pode encontrar essas configurações no console do Firebase:
// Configurações do projeto > Geral > Seus apps > Configuração do SDK
const firebaseConfig = {
  apiKey: "AIzaSyAlrBYq7q0OImwDmpmrTKGZdvJNbMstd8I", // Substituído
  authDomain: "easyagenda-58w3h.firebaseapp.com",
  projectId: "easyagenda-58w3h",
  storageBucket: "easyagenda-58w3h.firebasestorage.app",
  messagingSenderId: "165306321642",
  appId: "1:165306321642:web:fc24690cf2c51b8e43e593",
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
if (firebaseConfig.apiKey === "AIzaSyAlrBYq7q0OImwDmpmrTKGZdvJNbMstd8I" || firebaseConfig.projectId === "easyagenda-58w3h") {
  console.warn(
    "FIREBASE NÃO CONFIGURADO: Por favor, atualize src/lib/firebase.ts com as credenciais do seu projeto Firebase para que a autenticação e outras funcionalidades do Firebase funcionem corretamente."
  );
}
