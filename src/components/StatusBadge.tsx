import { StyleSheet, Text, View } from "react-native";

type Status = "pending" | "in_progress" | "resolved";

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label: "Pending",     color: "#e09030", bg: "#1a1200", border: "#3a2a00" },
  in_progress: { label: "In Progress", color: "#4a9eff", bg: "#001a2a", border: "#003a5a" },
  resolved:    { label: "Resolved",    color: "#c8f04a", bg: "#0a1a00", border: "#2a4a00" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as Status] || STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
});