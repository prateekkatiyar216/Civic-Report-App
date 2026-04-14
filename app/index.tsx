import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text, TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../lib/firebase";
import IssueCard from "../src/components/IssueCard";
import { getIssues } from "../src/services/api";

const CATEGORIES = [
  { id: "all", label: "All", icon: "🗂️" },
  { id: "pothole", label: "Pothole", icon: "🕳️" },
  { id: "garbage", label: "Garbage", icon: "🗑️" },
  { id: "streetlight", label: "Street Light", icon: "💡" },
  { id: "water", label: "Water", icon: "💧" },
  { id: "dumping", label: "Dumping", icon: "⚠️" },
  { id: "road", label: "Road", icon: "🚧" },
  { id: "other", label: "Other", icon: "📋" },
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // ── Auth guard — wait for Firebase before redirecting ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        fetchIssues(firebaseUser);
      } else {
        // Only redirect once Firebase has confirmed no session
        setAuthReady(true);
        router.replace("/welcome");
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // ── Fetch issues from backend ────────────────────────
  const fetchIssues = async (currentUser?: any) => {
    try {
      const u = currentUser || user;
      if (!u) return;
      const token = await u.getIdToken();
      const res = await getIssues(token);
      const data = res.data?.issues || res.data || [];
      const sorted = [...data].sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setIssues(sorted);
      setFiltered(sorted);
    } catch (e) {
      setIssues([]);
      setFiltered([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIssues();
  }, [user]);

  const handleCategoryFilter = (catId: string) => {
    setActiveCategory(catId);
    setFiltered(catId === "all" ? issues : issues.filter((i) => i.category === catId));
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out", style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/welcome");
        },
      },
    ]);
  };

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    inProgress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  const displayName = user?.displayName?.split(" ")[0] || "Citizen";
  const initials = (user?.displayName || "U")
    .split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  // Show loading spinner until Firebase confirms auth
  if (!authReady || (authReady && user && loading)) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#c8f04a" size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const ListHeader = () => (
    <View>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Hello, {displayName} 👋</Text>
          <Text style={styles.subGreeting}>Report issues in your area</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={handleLogout}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      {/* Report button */}
      <TouchableOpacity
        style={styles.reportBtn}
        onPress={() => router.push("/report")}
        activeOpacity={0.85}
      >
        <View style={styles.reportBtnLeft}>
          <Text style={styles.reportBtnIcon}>📢</Text>
          <View>
            <Text style={styles.reportBtnTitle}>Report an Issue</Text>
            <Text style={styles.reportBtnSub}>Tap to submit a new civic issue</Text>
          </View>
        </View>
        <Text style={styles.reportBtnArrow}>→</Text>
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Total", value: stats.total, color: "#f0f0f5" },
          { label: "Pending", value: stats.pending, color: "#e09030" },
          { label: "Active", value: stats.inProgress, color: "#4a9eff" },
          { label: "Resolved", value: stats.resolved, color: "#c8f04a" },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Category filter */}
      <Text style={styles.sectionTitle}>Filter by Category</Text>
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === item.id && styles.categoryChipActive]}
            onPress={() => handleCategoryFilter(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.categoryChipIcon}>{item.icon}</Text>
            <Text style={[styles.categoryChipLabel, activeCategory === item.id && styles.categoryChipLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>
        Recent Issues {filtered.length > 0 ? `(${filtered.length})` : ""}
      </Text>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏙️</Text>
      <Text style={styles.emptyTitle}>No issues yet</Text>
      <Text style={styles.emptySubtitle}>
        {activeCategory !== "all"
          ? "No issues in this category."
          : "Be the first to report a civic issue!"}
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/report")}>
        <Text style={styles.emptyBtnText}>Report First Issue</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id || String(Math.random())}
        renderItem={({ item }) => (
          <IssueCard issue={item} onPress={() => {}} />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c8f04a" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0f" },
  loadingScreen: { flex: 1, backgroundColor: "#0a0a0f", justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "#6b6b80", fontSize: 14 },
  blob1: {
    position: "absolute", top: -80, right: -60,
    width: 260, height: 260, borderRadius: 130, backgroundColor: "#141428", opacity: 0.7,
  },
  blob2: {
    position: "absolute", bottom: 100, left: -80,
    width: 180, height: 180, borderRadius: 90, backgroundColor: "#0d1a0d", opacity: 0.8,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  topBar: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingTop: 60, marginBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: "700", color: "#f0f0f5", letterSpacing: -0.5 },
  subGreeting: { fontSize: 13, color: "#6b6b80", marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#c8f04a", justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 15, fontWeight: "700", color: "#0a0a0f" },
  reportBtn: {
    backgroundColor: "#c8f04a", borderRadius: 16, padding: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20,
    shadowColor: "#c8f04a", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  reportBtnLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  reportBtnIcon: { fontSize: 28 },
  reportBtnTitle: { fontSize: 16, fontWeight: "700", color: "#0a0a0f" },
  reportBtnSub: { fontSize: 12, color: "#2a3a10", marginTop: 2 },
  reportBtnArrow: { fontSize: 20, color: "#0a0a0f", fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: "#13131e", borderRadius: 12,
    borderWidth: 1, borderColor: "#1e1e2e", padding: 12, alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "700", marginBottom: 2 },
  statLabel: { fontSize: 10, color: "#6b6b80", textTransform: "uppercase", letterSpacing: 0.5 },
  sectionTitle: {
    fontSize: 12, fontWeight: "700", color: "#9090a8",
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 12,
  },
  categoryList: { gap: 8, paddingBottom: 20 },
  categoryChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#13131e", borderRadius: 20, borderWidth: 1,
    borderColor: "#1e1e2e", paddingVertical: 8, paddingHorizontal: 14,
  },
  categoryChipActive: { backgroundColor: "#1a2a10", borderColor: "#c8f04a" },
  categoryChipIcon: { fontSize: 14 },
  categoryChipLabel: { fontSize: 13, color: "#6b6b80", fontWeight: "600" },
  categoryChipLabelActive: { color: "#c8f04a" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyIcon: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#f0f0f5" },
  emptySubtitle: { fontSize: 14, color: "#6b6b80", textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
  emptyBtn: {
    marginTop: 16, backgroundColor: "#c8f04a",
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24,
  },
  emptyBtnText: { color: "#0a0a0f", fontWeight: "700", fontSize: 14 },
});