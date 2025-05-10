import { Capacitor } from '@capacitor/core';

const isAndroid = Capacitor.getPlatform() === 'android';

export const environment = {
  production: false,
  api: isAndroid
    ? 'http://10.0.2.2:3000/api' // use this if you're using an Android emulator
    : 'https://go-fast-node.onrender.com/api', // default for web
};
