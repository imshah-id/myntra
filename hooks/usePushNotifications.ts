import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/utils/storage";

// Configure how notifications function when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(
    undefined,
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  async function registerForPushNotificationsAsync() {
    // Web push notifications require additional setup (VAPID keys, service worker)
    // and are not fully supported in Expo managed workflow. Skip for now on web.
    if (Platform.OS === "web") {
      console.log(
        "Push notifications are not supported on web in this configuration.",
      );
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        console.log("Project ID not found");
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log("Expo Push Token:", pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        console.error("Error getting push token", e);
      }
    } else {
      console.log("Must use physical device for Push Notifications");
    }
  }

  // Register token with backend
  const registerTokenWithBackend = async (token: string) => {
    if (!user) return;
    try {
      const authToken = await getToken();
      await axios.post(
        "https://myntrabackend-eal6.onrender.com/api/notifications/register-token",
        {
          token,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      console.log("Push token registered with backend");
    } catch (error) {
      console.error("Failed to register push token with backend", error);
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
      if (token && user) {
        registerTokenWithBackend(token);
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "Notification interacted with:",
          response.notification.request.content.data,
        );
        // Handle navigation based on data if needed
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [user]);

  // Local Notifications for Cart Abandonment
  const scheduleCartReminder = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Items in your cart are waiting!",
        body: "Don't forget to complete your purchase.",
        data: { type: "cart_abandonment" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60, // 1 hour
        repeats: false,
      },
    });
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return {
    expoPushToken,
    notification,
    scheduleCartReminder,
    cancelAllNotifications,
  };
}
