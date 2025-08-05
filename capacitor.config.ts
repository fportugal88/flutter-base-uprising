import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ee506ff2f35d41309ddbfd3727716c89',
  appName: 'Fusion Data Bridge',
  webDir: 'dist',
  server: {
    url: 'https://ee506ff2-f35d-4130-9ddb-fd3727716c89.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;