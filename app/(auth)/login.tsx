import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import { Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { CustomAlert } from "@/components/CustomAlert";

export default function Login() {
  const { login } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setisloading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ visible: true, title, message });
  };

  const hideAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false });
  };
  const handleLogin = async () => {
    try {
      setisloading(true);
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error(error);
      showAlert("Login Failed", error.message);
    } finally {
      setisloading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        }}
        style={styles.backgroundImage}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View
            style={[
              styles.formContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              Welcome to Myntra
            </Text>
            <Text style={[styles.subtitle, { color: theme.icon }]}>
              Login to continue shopping
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.surface, color: theme.text },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.icon}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View
              style={[
                styles.passwordContainer,
                { backgroundColor: theme.surface },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.icon} />
                ) : (
                  <Eye size={20} color={theme.icon} />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.tint }]}
              onPress={handleLogin}
              disabled={isloading}
            >
              {isloading ? (
                <ActivityIndicator color={theme.background} />
              ) : (
                <Text style={[styles.buttonText, { color: theme.background }]}>
                  LOGIN
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => router.push("/signup")}
            >
              <Text style={[styles.signupText, { color: theme.tint }]}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  backgroundImage: {
    width: "100%",
    height: "50%",
    position: "absolute",
    top: 0,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 100, // Reduced margin
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#3e3e3e",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  button: {
    backgroundColor: "#ff3f6c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupLink: {
    marginTop: 20,
    alignItems: "center",
  },
  signupText: {
    color: "#ff3f6c",
    fontSize: 16,
  },
});
