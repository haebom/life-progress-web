declare module '@capacitor/core' {
  export interface PluginRegistry {
    PushNotifications: any;
  }

  export class Capacitor {
    static platform: string;
    static isNativePlatform(): boolean;
    static isPluginAvailable(name: string): boolean;
    static convertFileSrc(filePath: string): string;
    static getPlatform(): string;
  }
}

declare module '@capacitor/push-notifications' {
  export interface PushNotificationSchema {
    title?: string;
    subtitle?: string;
    body?: string;
    id: string;
    badge?: number;
    notification?: any;
    data: any;
  }

  export interface Token {
    value: string;
  }

  export interface ActionPerformed {
    actionId: string;
    inputValue?: string;
    notification: PushNotificationSchema;
  }

  export interface PushNotificationsPlugin {
    register(): Promise<void>;
    getDeliveredNotifications(): Promise<{ notifications: PushNotificationSchema[] }>;
    removeDeliveredNotifications(delivered: { notifications: PushNotificationSchema[] }): Promise<void>;
    removeAllDeliveredNotifications(): Promise<void>;
    createChannel(channel: { id: string; name: string; description?: string; importance?: number; visibility?: number; sound?: string; lights?: boolean; lightColor?: string; vibration?: boolean }): Promise<void>;
    deleteChannel(channel: { id: string }): Promise<void>;
    listChannels(): Promise<{ channels: { id: string; name: string; description?: string; importance?: number; visibility?: number; sound?: string; lights?: boolean; lightColor?: string; vibration?: boolean }[] }>;
    requestPermissions(): Promise<PermissionStatus>;
    checkPermissions(): Promise<PermissionStatus>;
    addListener(eventName: string, listenerFunc: (event: any) => void): Promise<PluginListenerHandle>;
    removeAllListeners(): Promise<void>;
  }

  export interface PermissionStatus {
    receive: PermissionState;
  }

  export type PermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';

  export interface PluginListenerHandle {
    remove: () => Promise<void>;
  }

  export const PushNotifications: PushNotificationsPlugin;
} 