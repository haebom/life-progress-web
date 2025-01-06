declare module '@capacitor/cli' {
  export interface CapacitorConfig {
    appId: string;
    appName: string;
    webDir: string;
    server?: {
      androidScheme?: string;
      cleartext?: boolean;
      hostname?: string;
    };
    plugins?: {
      PushNotifications?: {
        presentationOptions?: string[];
      };
    };
  }
}

declare module '@capacitor/core' {
  export class Capacitor {
    static platform: string;
    static isNativePlatform(): boolean;
    static isPluginAvailable(name: string): boolean;
    static convertFileSrc(filePath: string): string;
    static getPlatform(): string;
  }

  export interface PluginRegistry {
    PushNotifications: PushNotificationsPlugin;
  }

  export interface PushNotificationsPlugin {
    register(): Promise<void>;
    addListener(eventName: string, listenerFunc: (token: any) => void): Promise<any>;
    getDeliveredNotifications(): Promise<{ notifications: any[] }>;
    removeDeliveredNotifications(delivered: { notifications: any[] }): Promise<void>;
    removeAllDeliveredNotifications(): Promise<void>;
    createChannel(channel: { id: string; name: string; importance: number; description?: string; sound?: string; visibility?: number; lights?: boolean; lightColor?: string; vibration?: boolean }): Promise<void>;
    listChannels(): Promise<{ channels: any[] }>;
    deleteChannel(channel: { id: string }): Promise<void>;
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
    addListener(eventName: string, listenerFunc: (event: any) => void): Promise<PluginListenerHandle>;
    getDeliveredNotifications(): Promise<{ notifications: PushNotificationSchema[] }>;
    removeDeliveredNotifications(delivered: { notifications: PushNotificationSchema[] }): Promise<void>;
    removeAllDeliveredNotifications(): Promise<void>;
    createChannel(channel: { id: string; name: string; description?: string; importance?: number; visibility?: number; sound?: string; lights?: boolean; lightColor?: string; vibration?: boolean }): Promise<void>;
    listChannels(): Promise<{ channels: { id: string; name: string; description?: string; importance?: number; visibility?: number; sound?: string; lights?: boolean; lightColor?: string; vibration?: boolean }[] }>;
    deleteChannel(channel: { id: string }): Promise<void>;
    requestPermissions(): Promise<PermissionStatus>;
    checkPermissions(): Promise<PermissionStatus>;
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