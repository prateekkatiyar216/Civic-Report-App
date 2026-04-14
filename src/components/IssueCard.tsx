import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import StatusBadge from "./StatusBadge";

const CATEGORY_ICONS: Record<string, string> = {
  pothole: "🕳️", garbage: "🗑️", streetlight: "💡",
  water: "💧", dumping: "⚠️", road: "🚧", sewage: "🔩", other: "📋",
};

export default function IssueCard({ issue, onPress }: { issue: any; onPress: () => void }) {
  const date = new Date(issue.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Image */}
      {issue.imageUrl ? (
        <Image source={{ uri: issue.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={{ fontSize: 32 }}>{CATEGORY_ICONS[issue.category] || "📋"}</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryIcon}>{CATEGORY_ICONS[issue.category] || "📋"}</Text>
            <Text style={styles.categoryText}>{issue.category}</Text>
          </View>
          <StatusBadge status={issue.status} />
        </View>

        <Text style={styles.title} numberOfLines={1}>{issue.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{issue.description}</Text>

        <View style={styles.footer}>
          <Text style={styles.date}>📅 {date}</Text>
          <Text style={styles.location}>📍 {issue.latitude?.toFixed(3)}, {issue.longitude?.toFixed(3)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#13131e", borderRadius: 16,
    borderWidth: 1, borderColor: "#1e1e2e",
    marginBottom: 14, overflow: "hidden",
  },
  image: { width: "100%", height: 160 },
  imagePlaceholder: {
    width: "100%", height: 120,
    backgroundColor: "#1a1a2e", justifyContent: "center", alignItems: "center",
  },
  content: { padding: 14, gap: 8 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  categoryTag: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#1e1e2e", borderRadius: 20, paddingVertical: 3, paddingHorizontal: 8,
  },
  categoryIcon: { fontSize: 12 },
  categoryText: { fontSize: 11, color: "#9090a8", fontWeight: "600", textTransform: "capitalize" },
  title: { fontSize: 16, fontWeight: "700", color: "#f0f0f5", letterSpacing: -0.3 },
  description: { fontSize: 13, color: "#6b6b80", lineHeight: 19 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  date: { fontSize: 11, color: "#4a4a5a" },
  location: { fontSize: 11, color: "#4a4a5a" },
});