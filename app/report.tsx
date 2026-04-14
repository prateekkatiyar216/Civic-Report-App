import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator, Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../lib/firebase";
import { useLocation } from "../src/hooks/useLocation";
import { reportIssue } from "../src/services/api";

const CATEGORIES = [
  { id: "pothole",     label: "Pothole",      icon: "🕳️" },
  { id: "garbage",     label: "Garbage",      icon: "🗑️" },
  { id: "streetlight", label: "Street Light", icon: "💡" },
  { id: "water",       label: "Water Leak",   icon: "💧" },
  { id: "dumping",     label: "Illegal Dump", icon: "⚠️" },
  { id: "road",        label: "Road Damage",  icon: "🚧" },
  { id: "sewage",      label: "Sewage",       icon: "🔩" },
  { id: "other",       label: "Other",        icon: "📋" },
];

export default function ReportIssue() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { location, loading: locationLoading, error: locationError } = useLocation();

  const pickImage = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {
      Alert.alert("Permission required", "Please allow access to continue.");
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [4, 3] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [4, 3] });

    if (!result.canceled && result.assets[0]) {
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImage(compressed.uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Add Photo", "Choose an option", [
      { text: "Take Photo", onPress: () => pickImage(true) },
      { text: "Choose from Gallery", onPress: () => pickImage(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert("Missing", "Please add a title."); return; }
    if (!description.trim()) { Alert.alert("Missing", "Please add a description."); return; }
    if (!category) { Alert.alert("Missing", "Please select a category."); return; }
    if (!image) { Alert.alert("Missing", "Please add a photo."); return; }
    if (!location) { Alert.alert("Location", "Waiting for GPS location..."); return; }

    setSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("latitude", String(location.latitude));
      formData.append("longitude", String(location.longitude));
      formData.append("image", {
        uri: Platform.OS === "android" ? image : image.replace("file://", ""),
        type: "image/jpeg",
        name: "issue.jpg",
      } as any);

      await reportIssue(formData, token || "");
      Alert.alert("✅ Submitted!", "Your issue has been reported successfully.", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Issue</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionLabel}>Photo Evidence</Text>
        <TouchableOpacity style={styles.imageUploader} onPress={showImageOptions} activeOpacity={0.85}>
          {image ? (
            <>
              <Image source={{ uri: image }} style={styles.uploadedImage} />
              <TouchableOpacity style={styles.changePhotoBtn} onPress={showImageOptions}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>📷</Text>
              <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
              <Text style={styles.imagePlaceholderSub}>Camera or Gallery</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryItem, category === cat.id && styles.categoryItemActive]}
              onPress={() => setCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryLabel, category === cat.id && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Brief issue title..."
          placeholderTextColor="#4a4a5a"
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />

        <Text style={styles.sectionLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the issue in detail..."
          placeholderTextColor="#4a4a5a"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{description.length}/500</Text>

        <Text style={styles.sectionLabel}>Location</Text>
        <View style={styles.locationCard}>
          {locationLoading ? (
            <View style={styles.locationRow}>
              <ActivityIndicator color="#c8f04a" size="small" />
              <Text style={styles.locationText}>Fetching GPS location...</Text>
            </View>
          ) : locationError ? (
            <View style={styles.locationRow}>
              <Text>❌</Text>
              <Text style={styles.locationError}>{locationError}</Text>
            </View>
          ) : location ? (
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <View>
                <Text style={styles.locationText}>Location captured</Text>
                <Text style={styles.locationCoords}>
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </Text>
              </View>
              <View style={styles.locationBadge}>
                <Text style={styles.locationBadgeText}>GPS ✓</Text>
              </View>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#0a0a0f" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Report</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0f" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: "#1e1e2e",
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: "#13131e",
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#1e1e2e",
  },
  backArrow: { color: "#f0f0f5", fontSize: 18 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#f0f0f5", letterSpacing: -0.3 },
  scroll: { paddingHorizontal: 24, paddingTop: 24 },
  sectionLabel: {
    fontSize: 12, fontWeight: "700", color: "#9090a8",
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 20,
  },
  imageUploader: {
    borderRadius: 16, overflow: "hidden", borderWidth: 1.5,
    borderColor: "#1e1e2e", borderStyle: "dashed", backgroundColor: "#13131e",
  },
  imagePlaceholder: { height: 180, justifyContent: "center", alignItems: "center", gap: 6 },
  imagePlaceholderIcon: { fontSize: 36 },
  imagePlaceholderText: { fontSize: 15, fontWeight: "600", color: "#f0f0f5" },
  imagePlaceholderSub: { fontSize: 13, color: "#6b6b80" },
  uploadedImage: { width: "100%", height: 200 },
  changePhotoBtn: {
    position: "absolute", bottom: 10, right: 10,
    backgroundColor: "rgba(0,0,0,0.7)", borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 12,
  },
  changePhotoText: { color: "#f0f0f5", fontSize: 12, fontWeight: "600" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryItem: {
    width: "22%", aspectRatio: 1, borderRadius: 14, backgroundColor: "#13131e",
    borderWidth: 1, borderColor: "#1e1e2e", justifyContent: "center", alignItems: "center", gap: 4,
  },
  categoryItemActive: { backgroundColor: "#1a2a10", borderColor: "#c8f04a" },
  categoryIcon: { fontSize: 22 },
  categoryLabel: { fontSize: 10, color: "#6b6b80", fontWeight: "600", textAlign: "center" },
  categoryLabelActive: { color: "#c8f04a" },
  input: {
    backgroundColor: "#13131e", borderWidth: 1, borderColor: "#1e1e2e",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: "#f0f0f5",
  },
  textArea: { height: 110, paddingTop: 14 },
  charCount: { fontSize: 11, color: "#3a3a4a", textAlign: "right", marginTop: 4 },
  locationCard: {
    backgroundColor: "#13131e", borderRadius: 12,
    borderWidth: 1, borderColor: "#1e1e2e", padding: 16,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  locationIcon: { fontSize: 20 },
  locationText: { fontSize: 14, color: "#f0f0f5", fontWeight: "600" },
  locationCoords: { fontSize: 12, color: "#6b6b80", marginTop: 2 },
  locationError: { fontSize: 13, color: "#e05555" },
  locationBadge: {
    marginLeft: "auto", backgroundColor: "#1a2a10", borderRadius: 8,
    paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: "#2a4a1a",
  },
  locationBadgeText: { fontSize: 11, color: "#c8f04a", fontWeight: "700" },
  submitBtn: {
    backgroundColor: "#c8f04a", borderRadius: 14, paddingVertical: 17,
    alignItems: "center", marginTop: 28,
    shadowColor: "#c8f04a", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: "#0a0a0f", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
});