import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

const setItem = async (key: string, value: string) => {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getItem = async (key: string) => {
  if (isWeb) {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const removeItem = async (key: string) => {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const saveUserData = async (
  _id: string,
  name: string,
  email: string,
) => {
  await setItem("userid", _id);
  await setItem("userName", name);
  await setItem("userEmail", email);
};

export const getUserData = async () => {
  const _id = await getItem("userid");
  const name = await getItem("userName");
  const email = await getItem("userEmail");

  return { _id, name, email };
};

export const clearUserData = async () => {
  await removeItem("userid");
  await removeItem("userName");
  await removeItem("userEmail");
};
