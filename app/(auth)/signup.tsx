import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { CustomAlert } from "@/components/CustomAlert";

export default function Signup() {
  const { Signup } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
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
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (validateForm()) {
      // Here you would typically make an API call to register the user
      try {
        setisloading(true);
        await Signup(formData.fullName, formData.email, formData.password);
        router.replace("/(tabs)");
      } catch (error: any) {
        console.error(error);
        showAlert("Signup Failed", error.message);
      } finally {
        setisloading(false);
      }
      router.replace("/(tabs)");
    } else {
      showAlert("Signup Failed", "Please fill in all fields correctly.");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Image
        source={{
          uri: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        }}
        style={styles.backgroundImage}
      />

      <View
        style={[styles.formContainer, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>
          Join Myntra and discover amazing fashion
        </Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.surface, color: theme.text },
              errors.fullName && styles.inputError,
            ]}
            placeholder="Full Name"
            placeholderTextColor={theme.icon}
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
          />
          {errors.fullName ? (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.surface, color: theme.text },
              errors.email && styles.inputError,
            ]}
            placeholder="Email"
            placeholderTextColor={theme.icon}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <View
            style={[
              styles.passwordContainer,
              { backgroundColor: theme.surface },
              errors.password && styles.inputError,
            ]}
          >
            <TextInput
              style={[styles.passwordInput, { color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.icon}
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
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
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.tint }]}
          onPress={handleSignup}
          disabled={isloading}
        >
          {isloading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.background }]}>
              SIGN UP
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push("/login")}
        >
          <Text style={[styles.loginText, { color: theme.tint }]}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  backgroundImage: {
    width: "100%",
    height: 300,
    position: "absolute",
    top: 0,
  },
  formContainer: {
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginTop: 250,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#ff3f6c",
  },
  errorText: {
    color: "#ff3f6c",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
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
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#ff3f6c",
    fontSize: 16,
  },
});
