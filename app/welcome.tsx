import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../lib/firebase";

export default function Welcome() {
  // If already logged in, skip welcome and go home
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      {/* Top branding */}
      <View style={styles.top}>
        <View style={styles.logoMark}>
          <View style={styles.logoInner} />
        </View>
        <Text style={styles.appName}>CivicReport</Text>
        <Text style={styles.tagline}>
          Report civic issues{"\n"}in your area.
        </Text>
      </View>

      {/* Decorative card */}
      <View style={styles.cardArea}>
        <View style={[styles.card, styles.cardBack2]} />
        <View style={[styles.card, styles.cardBack1]} />
        <View style={[styles.card, styles.cardFront]}>
          <View style={styles.cardRow}>
            <View style={styles.cardAvatar} />
            <View style={styles.cardLines}>
              <View style={[styles.cardLine, { width: "60%" }]} />
              <View style={[styles.cardLine, { width: "40%", opacity: 0.4 }]} />
            </View>
            <View style={styles.cardBadge}>
              <View style={styles.cardBadgeDot} />
            </View>
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.cardStats}>
            {["🕳️ Pothole", "🗑️ Garbage", "💡 Street Light"].map((val, i) => (
              <View key={i} style={styles.cardStat}>
                <Text style={styles.cardStatValue}>{val}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* CTAs */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/register")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Text style={styles.primaryButtonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          By continuing you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#0a0a0f",
    paddingHorizontal: 28, paddingTop: 72, paddingBottom: 44,
  },
  blob1: {
    position: "absolute", top: -80, right: -60,
    width: 300, height: 300, borderRadius: 150, backgroundColor: "#141428",
  },
  blob2: {
    position: "absolute", bottom: 100, left: -100,
    width: 260, height: 260, borderRadius: 130, backgroundColor: "#0d1a0d",
  },
  blob3: {
    position: "absolute", top: "45%", right: -40,
    width: 140, height: 140, borderRadius: 70, backgroundColor: "#1a1a0a", opacity: 0.6,
  },
  top: { marginBottom: 36 },
  logoMark: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: "#c8f04a",
    justifyContent: "center", alignItems: "center", marginBottom: 24,
  },
  logoInner: { width: 20, height: 20, borderRadius: 6, backgroundColor: "#0a0a0f" },
  appName: {
    fontSize: 14, fontWeight: "700", color: "#c8f04a",
    letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14,
  },
  tagline: {
    fontSize: 36, fontWeight: "700", color: "#f0f0f5",
    letterSpacing: -1, lineHeight: 44,
  },
  cardArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    position: "absolute", width: "100%", borderRadius: 20,
    backgroundColor: "#13131e", borderWidth: 1, borderColor: "#1e1e2e",
  },
  cardBack2: {
    height: 160, top: 24,
    transform: [{ rotate: "4deg" }, { scaleX: 0.88 }], opacity: 0.3,
  },
  cardBack1: {
    height: 160, top: 12,
    transform: [{ rotate: "-2deg" }, { scaleX: 0.94 }], opacity: 0.6,
  },
  cardFront: { padding: 22, position: "relative" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#c8f04a", opacity: 0.9 },
  cardLines: { flex: 1, gap: 6 },
  cardLine: { height: 8, borderRadius: 4, backgroundColor: "#2a2a3e" },
  cardBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: "#1a2a1a",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#2a4a2a",
  },
  cardBadgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#c8f04a" },
  cardDivider: { height: 1, backgroundColor: "#1e1e2e", marginVertical: 18 },
  cardStats: { flexDirection: "row", justifyContent: "space-around" },
  cardStat: { alignItems: "center", flex: 1 },
  cardStatValue: { fontSize: 13, fontWeight: "600", color: "#f0f0f5" },
  bottom: { gap: 12 },
  primaryButton: {
    backgroundColor: "#c8f04a", borderRadius: 14, paddingVertical: 17,
    paddingHorizontal: 24, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    shadowColor: "#c8f04a", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  primaryButtonText: { color: "#0a0a0f", fontSize: 17, fontWeight: "700" },
  primaryButtonArrow: { color: "#0a0a0f", fontSize: 18, fontWeight: "700" },
  secondaryButton: {
    borderRadius: 14, paddingVertical: 17, alignItems: "center",
    borderWidth: 1, borderColor: "#1e1e2e", backgroundColor: "#13131e",
  },
  secondaryButtonText: { color: "#f0f0f5", fontSize: 17, fontWeight: "600" },
  legalText: { textAlign: "center", fontSize: 11, color: "#3a3a4a", marginTop: 4 },
});