importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyClhFC0M0elAlfrNoEhCdICQ009NrTLpX8",
    authDomain: "go-fast-3116e.firebaseapp.com",
    projectId: "go-fast-3116e",
    storageBucket: "go-fast-3116e.firebasestorage.app",
    messagingSenderId: "163646447101",
    appId: "1:163646447101:web:4854e3763b67df85020d94",
    measurementId: "G-T5D8VFFMHT",
    vapidKey: 'BA5aV7Y7upRpz_ugUHJk5eoHZTnc1FxpBGYJ5VHHqSQu9vbCZgTC6xNwjD1nQYikaoJz8NJP4mrIZ7OaQjLDY_g'
  };

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});