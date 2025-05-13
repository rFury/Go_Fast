import { Capacitor } from '@capacitor/core';

const isAndroid = Capacitor.getPlatform() === 'android';

export const environment = {
  production: false,
  api: isAndroid
    ? 'https://go-fast-node.onrender.com/api' // use this if you're using an Android emulator
    : 'http://127.0.0.1:3000/api', // default for web
};
 