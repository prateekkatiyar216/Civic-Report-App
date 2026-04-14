import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (e: any) {
      switch (e.code) {
        case "auth/user-not-found":
        case "auth/invalid-credential":
          setError("Invalid email or password."); break;
        case "auth/wrong-password":
          setError("Incorrect password."); break;
        case "auth/invalid-email":
          setError("Please enter a valid email."); break;
        case "auth/too-many-requests":
          setError("Too many attempts. Try again later."); break;
        default:
          setError(e.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.accentCircle} />

      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <View style={styles.logoInner} />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#4a4a5a"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
            </View>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="••••••••"
                placeholderTextColor="#4a4a5a"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#0a0a0f" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Create one</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0f" },
  accentCircle: {
    position: "absolute", top: -120, right: -80,
    width: 340, height: 340, borderRadius: 170,
    backgroundColor: "#1a1a2e", opacity: 0.8,
  },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: "center" },
  header: { marginBottom: 40 },
  logoMark: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: "#c8f04a",
    justifyContent: "center", alignItems: "center", marginBottom: 28,
  },
  logoInner: { width: 20, height: 20, borderRadius: 6, backgroundColor: "#0a0a0f" },
  title: { fontSize: 32, fontWeight: "700", color: "#f0f0f5", letterSpacing: -0.8, marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#6b6b80" },
  form: { gap: 20 },
  errorBox: {
    backgroundColor: "#2a1010", borderWidth: 1, borderColor: "#5a1a1a",
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14,
  },
  errorText: { color: "#e05555", fontSize: 13 },
  fieldGroup: { gap: 8 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 13, fontWeight: "600", color: "#9090a8", letterSpacing: 0.4, textTransform: "uppercase" },
  input: {
    backgroundColor: "#13131e", borderWidth: 1, borderColor: "#1e1e2e",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#f0f0f5",
  },
  passwordWrapper: { position: "relative" },
  passwordInput: { paddingRight: 48 },
  eyeButton: { position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" },
  eyeText: { fontSize: 16 },
  button: {
    backgroundColor: "#c8f04a", borderRadius: 12, paddingVertical: 16,
    alignItems: "center", marginTop: 8,
    shadowColor: "#c8f04a", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#0a0a0f", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 36 },
  footerText: { color: "#6b6b80", fontSize: 14 },
  footerLink: { color: "#c8f04a", fontSize: 14, fontWeight: "600" },
});