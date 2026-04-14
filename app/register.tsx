import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../lib/firebase";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: "", color: "#1e1e2e" };
    if (password.length < 6) return { level: 1, label: "Weak", color: "#e05555" };
    if (password.length < 10) return { level: 2, label: "Fair", color: "#e09030" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password))
      return { level: 3, label: "Strong", color: "#c8f04a" };
    return { level: 2, label: "Fair", color: "#e09030" };
  };

  const strength = getPasswordStrength();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields."); return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setError("");
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(user, { displayName: name.trim() });
      router.replace("/");
    } catch (e: any) {
      switch (e.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists."); break;
        case "auth/invalid-email":
          setError("Please enter a valid email address."); break;
        case "auth/weak-password":
          setError("Password must be at least 6 characters."); break;
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
      <View style={styles.accentCircle1} />
      <View style={styles.accentCircle2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <View style={styles.logoInner} />
            </View>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join us — it only takes a minute</Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane Smith"
                placeholderTextColor="#4a4a5a"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

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
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Min. 6 characters"
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
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: i <= strength.level ? strength.color : "#1e1e2e" },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  confirmPassword.length > 0 && confirmPassword !== password
                    ? styles.inputError : null,
                ]}
                placeholder="Re-enter your password"
                placeholderTextColor="#4a4a5a"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#0a0a0f" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By registering, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0f" },
  accentCircle1: {
    position: "absolute", top: -100, right: -60,
    width: 280, height: 280, borderRadius: 140, backgroundColor: "#1a1a2e", opacity: 0.8,
  },
  accentCircle2: {
    position: "absolute", bottom: -60, left: -80,
    width: 200, height: 200, borderRadius: 100, backgroundColor: "#0f1a10", opacity: 0.9,
  },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  inner: { flex: 1, paddingHorizontal: 28, paddingVertical: 40, justifyContent: "center" },
  header: { marginBottom: 36 },
  logoMark: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: "#c8f04a",
    justifyContent: "center", alignItems: "center", marginBottom: 28,
  },
  logoInner: { width: 20, height: 20, borderRadius: 6, backgroundColor: "#0a0a0f" },
  title: { fontSize: 32, fontWeight: "700", color: "#f0f0f5", letterSpacing: -0.8, marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#6b6b80" },
  form: { gap: 18 },
  errorBox: {
    backgroundColor: "#2a1010", borderWidth: 1, borderColor: "#5a1a1a",
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14,
  },
  errorText: { color: "#e05555", fontSize: 13 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#9090a8", letterSpacing: 0.4, textTransform: "uppercase" },
  input: {
    backgroundColor: "#13131e", borderWidth: 1, borderColor: "#1e1e2e",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#f0f0f5",
  },
  inputError: { borderColor: "#5a1a1a" },
  passwordWrapper: { position: "relative" },
  passwordInput: { paddingRight: 48 },
  eyeButton: { position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" },
  eyeText: { fontSize: 16 },
  strengthContainer: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  strengthBars: { flexDirection: "row", gap: 5, flex: 1 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
  button: {
    backgroundColor: "#c8f04a", borderRadius: 12, paddingVertical: 16,
    alignItems: "center", marginTop: 4,
    shadowColor: "#c8f04a", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#0a0a0f", fontSize: 16, fontWeight: "700" },
  termsText: { fontSize: 12, color: "#6b6b80", textAlign: "center", lineHeight: 18 },
  termsLink: { color: "#9090a8", textDecorationLine: "underline" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  footerText: { color: "#6b6b80", fontSize: 14 },
  footerLink: { color: "#c8f04a", fontSize: 14, fontWeight: "600" },
});