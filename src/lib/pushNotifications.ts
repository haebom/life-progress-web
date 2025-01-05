import { 
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const initPushNotifications = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // 권한 요청
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive === 'granted') {
        // 푸시 알림 등록
        await PushNotifications.register();

        // 푸시 토큰 수신 리스너
        PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push registration success:', token.value);
          // TODO: 토큰을 서버에 저장
        });

        // 푸시 알림 수신 리스너
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push received:', notification);
        });

        // 푸시 알림 응답 리스너
        PushNotifications.addListener('pushNotificationActionPerformed', (response: ActionPerformed) => {
          console.log('Push action performed:', response.notification);
        });
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }
};

export const removePushNotificationListeners = () => {
  if (Capacitor.isNativePlatform()) {
    PushNotifications.removeAllListeners();
  }
}; 