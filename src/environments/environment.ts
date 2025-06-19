import { Capacitor } from '@capacitor/core';

const isAndroid = Capacitor.getPlatform() === 'android';
export const environment = {
  production: false,
  api: isAndroid
    ? 'http://10.0.2.2:3000/api' // use this if you're using an Android emulator
    : 'http://127.0.0.1:3000/api', // default for web
  socket: isAndroid
    ? 'http://10.0.2.2:3000' // use this if you're using an Android emulator
    : 'http://127.0.0.1:3000', // default for web
};
export const environmentFirebase = {
  production: false,
  firebase: {
    apiKey: "AIzaSyClhFC0M0elAlfrNoEhCdICQ009NrTLpX8",
    authDomain: "go-fast-3116e.firebaseapp.com",
    projectId: "go-fast-3116e",
    storageBucket: "go-fast-3116e.firebasestorage.app",
    messagingSenderId: "163646447101",
    appId: "1:163646447101:web:4854e3763b67df85020d94",
    measurementId: "G-T5D8VFFMHT",
    vapidKey: 'BA5aV7Y7upRpz_ugUHJk5eoHZTnc1FxpBGYJ5VHHqSQu9vbCZgTC6xNwjD1nQYikaoJz8NJP4mrIZ7OaQjLDY_g'
  }
};