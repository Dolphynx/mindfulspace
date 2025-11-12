import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mindfulspace.app',
  appName: 'MindfulSpace',
  webDir: 'out',
  server: {
    cleartext: true,
    androidScheme: 'http',
  },
};

export default config;
