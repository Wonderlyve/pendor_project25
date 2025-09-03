import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5414f15481db4b3999e121c2ba0c24d6',
  appName: 'pronos-palace',
  webDir: 'dist',
  server: {
    url: 'https://5414f154-81db-4b39-99e1-21c2ba0c24d6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  }
};

export default config;