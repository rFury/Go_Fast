import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'go-fast',
  webDir: 'dist/go-fast/browser',
  server: {
    cleartext: true,
    androidScheme: 'http',
    hostname: '10.0.2.2',
  }
  
};

export default config;
