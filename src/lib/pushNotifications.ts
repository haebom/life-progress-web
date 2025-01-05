import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Firebase } from './firebase';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  PushNotificationSchema,
  Token,
  ActionPerformed
} from '@capacitor/push-notifications';

export const usePushNotifications = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const { user } = useAuthStore();

  const registerPush = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // 권한 요청
      const permissionStatus = await PushNotifications.requestPermissions();
      if (permissionStatus.receive === 'granted') {
        // 푸시 알림 등록
        await PushNotifications.register();
        setIsRegistered(true);
      }
    } catch (error) {
      console.error('푸시 알림 등록 실패:', error);
    }
  };

  useEffect(() => {
    if (!user || isRegistered) return;

    // 이벤트 리스너 등록
    PushNotifications.addListener('registration', async (token: Token) => {
      // FCM 토큰을 서버에 저장
      if (user) {
        try {
          await Firebase.updateUserProfile(user.uid, {
            fcmToken: token.value
          });
        } catch (error) {
          console.error('FCM 토큰 저장 실패:', error);
        }
      }
    });

    PushNotifications.addListener('pushNotificationReceived', 
      (notification: PushNotificationSchema) => {
        // 알림 수신 처리
        console.log('알림 수신:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        // 알림 액션 처리
        console.log('알림 액션:', action);
    });

    registerPush();

    return () => {
      // 이벤트 리스너 제거
      PushNotifications.removeAllListeners();
    };
  }, [user, isRegistered]);

  return { isRegistered };
}; 