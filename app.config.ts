import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "myntra",
  slug: "myntra",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/myntra.jpg",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/myntra.jpg",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/myntra.jpg",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-secure-store",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "a55e6c9c-5fa3-4108-92bb-6726df0f1734",
    },
  },
  owner: "theshaenix",
  notification: {
    vapidPublicKey:
      "BEki-I7IokSRyQJMQ0qVgBB7Z5RZKj-5exYZS6P0SRQk5ObPs7Nw5mz5GVmvDLvABn4FHhu5QufNoDFECodCGsQ",
  } as any,
});
