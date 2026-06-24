import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { indiaStates, getCitiesForState, getClubForCity } from "@/constants/indiaData";

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

function PickerModal({
  visible,
  title,
  options,
  onSelect,
  onClose,
  colors,
}: {
  visible: boolean;
  title: string;
  options: string[];
  onSelect: (v: string) => void;
  onClose: () => void;
  colors: any;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.pickerSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.pickerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {title}
          </Text>
          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {options.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.pickerOption, { borderColor: colors.border }]}
                onPress={() => { onSelect(opt); onClose(); }}
              >
                <Text style={[styles.pickerOptionText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={[styles.pickerCancel, { backgroundColor: colors.secondary }]} onPress={onClose}>
            <Text style={[styles.pickerCancelText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

function PhotoModal({
  visible,
  currentPhoto,
  onClose,
  onTakePhoto,
  onGallery,
  onRemove,
  colors,
}: {
  visible: boolean;
  currentPhoto: string | null;
  onClose: () => void;
  onTakePhoto: () => void;
  onGallery: () => void;
  onRemove: () => void;
  colors: any;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.photoSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.photoSheetTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Change Profile Photo
          </Text>
          <Text style={[styles.photoSheetSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Choose your new profile picture
          </Text>

          <View style={styles.photoPreviewWrap}>
            {currentPhoto ? (
              <Image source={{ uri: currentPhoto }} style={styles.photoPreview} />
            ) : (
              <View style={[styles.photoPreviewFallback, { backgroundColor: colors.secondary }]}>
                <Ionicons name="person" size={60} color={colors.mutedForeground} />
              </View>
            )}
            <Pressable
              style={[styles.photoCameraBtn, { backgroundColor: colors.primary }]}
              onPress={onGallery}
            >
              <Ionicons name="camera" size={18} color="#fff" />
            </Pressable>
          </View>

          {[
            { icon: "camera-outline", label: "Take Photo", action: onTakePhoto, color: colors.foreground },
            { icon: "image-outline", label: "Choose from Gallery", action: onGallery, color: colors.foreground },
            { icon: "trash-outline", label: "Remove Photo", action: onRemove, color: colors.primary },
          ].map((opt) => (
            <Pressable
              key={opt.label}
              style={({ pressed }) => [
                styles.photoOption,
                { borderColor: colors.border },
                pressed && { backgroundColor: colors.border + "40" },
              ]}
              onPress={() => { opt.action(); onClose(); }}
            >
              <Ionicons name={opt.icon as any} size={22} color={opt.color} />
              <Text style={[styles.photoOptionText, { color: opt.color, fontFamily: "Inter_500Medium" }]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}

          <Pressable
            style={({ pressed }) => [
              styles.photoCancelBtn,
              { backgroundColor: colors.secondary },
              pressed && { opacity: 0.7 },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.photoCancelText, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [mobile, setMobile] = useState(user?.mobile ?? "");
  const [dob, setDob] = useState(user?.dateOfBirth ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [state, setState] = useState(user?.state ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [photoUri, setPhotoUri] = useState<string | null>(user?.profilePhoto ?? null);

  const [saving, setSaving] = useState(false);
  const [showGender, setShowGender] = useState(false);
  const [showState, setShowState] = useState(false);
  const [showCity, setShowCity] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

  const stateNames = indiaStates.map((s) => s.name);
  const cityNames = getCitiesForState(state).map((c) => c.name);
  const clubName = state && city ? getClubForCity(state, city) : (user?.clubName ?? "DOKRA Running Club");

  const handleStateSelect = (val: string) => {
    setState(val);
    setCity("");
  };

  const pickImage = useCallback(async (fromCamera: boolean) => {
    try {
      const perm = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission Required", "Please grant permission to access your " + (fromCamera ? "camera." : "photos."));
        return;
      }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert("Error", "Could not pick image.");
    }
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        fullName: fullName.trim(),
        mobile,
        dateOfBirth: dob,
        gender,
        state,
        city,
        clubName,
        profilePhoto: photoUri,
      });
      router.replace("/profile-success");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingTop: topPad + 8, paddingBottom: 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.foreground} />
            </Pressable>
          </View>

          <Text style={[styles.screenTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Edit Profile
          </Text>
          <Text style={[styles.screenSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Update your personal information
          </Text>

          <Pressable style={styles.photoSection} onPress={() => setShowPhoto(true)}>
            <View style={styles.photoWrap}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.editAvatar} />
              ) : (
                <View style={[styles.editAvatarFallback, { backgroundColor: colors.card }]}>
                  <Text style={[styles.editAvatarInitial, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={[styles.cameraOverlay, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </View>
          </Pressable>

          <View style={styles.form}>
            <FormField
              icon="person-outline"
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              colors={colors}
            />

            <FormField
              icon="mail-outline"
              label="Email"
              value={user.email}
              editable={false}
              placeholder=""
              colors={colors}
              muted
            />

            <FormField
              icon="phone-portrait-outline"
              label="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              placeholder="+91 XXXXX XXXXX"
              keyboardType="phone-pad"
              colors={colors}
            />

            <FormField
              icon="calendar-outline"
              label="Date of Birth"
              value={dob}
              onChangeText={setDob}
              placeholder="DD / MM / YYYY"
              colors={colors}
            />

            <DropdownField
              icon="person-outline"
              label="Gender"
              value={gender || "Select Gender"}
              onPress={() => setShowGender(true)}
              colors={colors}
              hasValue={!!gender}
            />

            <DropdownField
              icon="location-outline"
              label="State"
              value={state || "Select State"}
              onPress={() => setShowState(true)}
              colors={colors}
              hasValue={!!state}
            />

            <DropdownField
              icon="location-outline"
              label="City"
              value={city || "Select City"}
              onPress={() => { if (state) setShowCity(true); else Alert.alert("Select State", "Please select a state first."); }}
              colors={colors}
              hasValue={!!city}
            />

            <View style={[styles.readonlyField, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="ribbon-outline" size={18} color={colors.mutedForeground} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Club
                </Text>
                <Text style={[styles.fieldValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {clubName}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={[styles.saveBtnText, { fontFamily: "Inter_700Bold" }]}>
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        visible={showGender}
        title="Select Gender"
        options={GENDERS}
        onSelect={setGender}
        onClose={() => setShowGender(false)}
        colors={colors}
      />
      <PickerModal
        visible={showState}
        title="Select State"
        options={stateNames}
        onSelect={handleStateSelect}
        onClose={() => setShowState(false)}
        colors={colors}
      />
      <PickerModal
        visible={showCity}
        title="Select City"
        options={cityNames}
        onSelect={setCity}
        onClose={() => setShowCity(false)}
        colors={colors}
      />
      <PhotoModal
        visible={showPhoto}
        currentPhoto={photoUri}
        onClose={() => setShowPhoto(false)}
        onTakePhoto={() => pickImage(true)}
        onGallery={() => pickImage(false)}
        onRemove={() => setPhotoUri(null)}
        colors={colors}
      />
    </View>
  );
}

function FormField({
  icon, label, value, onChangeText, placeholder, keyboardType, editable = true, muted = false, colors,
}: {
  icon: string; label: string; value: string; onChangeText?: (v: string) => void;
  placeholder: string; keyboardType?: any; editable?: boolean; muted?: boolean; colors: any;
}) {
  return (
    <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon as any} size={18} color={colors.mutedForeground} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {label}
        </Text>
        <TextInput
          style={[styles.textInput, { color: muted ? colors.mutedForeground : colors.foreground, fontFamily: "Inter_500Medium" }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType ?? "default"}
          editable={editable}
        />
      </View>
    </View>
  );
}

function DropdownField({
  icon, label, value, onPress, hasValue, colors,
}: {
  icon: string; label: string; value: string; onPress: () => void; hasValue: boolean; colors: any;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.inputWrap,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.75 },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={18} color={colors.mutedForeground} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {label}
        </Text>
        <Text style={[styles.fieldValue, { color: hasValue ? colors.foreground : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 12 },
  topBar: { marginBottom: 4 },
  backBtn: { padding: 4, alignSelf: "flex-start" },
  screenTitle: { fontSize: 24, textAlign: "center", marginTop: 4 },
  screenSub: { fontSize: 13, textAlign: "center", marginBottom: 4 },
  photoSection: { alignItems: "center", marginVertical: 8 },
  photoWrap: { position: "relative" },
  editAvatar: { width: 80, height: 80, borderRadius: 40 },
  editAvatarFallback: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
  },
  editAvatarInitial: { fontSize: 32 },
  cameraOverlay: {
    position: "absolute", bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  form: { gap: 10 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    gap: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1,
  },
  readonlyField: {
    flexDirection: "row", alignItems: "center",
    gap: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1,
  },
  fieldLabel: { fontSize: 11, marginBottom: 1 },
  fieldValue: { fontSize: 15 },
  textInput: { fontSize: 15, padding: 0, margin: 0 },
  saveBtn: {
    borderRadius: 12, paddingVertical: 16, alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 15, letterSpacing: 1 },
  modalOverlay: {
    flex: 1, backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1, borderBottomWidth: 0,
    padding: 20, gap: 0,
  },
  pickerTitle: { fontSize: 17, marginBottom: 12 },
  pickerOption: {
    paddingVertical: 14, borderBottomWidth: 1,
  },
  pickerOptionText: { fontSize: 15 },
  pickerCancel: {
    marginTop: 12, borderRadius: 12,
    paddingVertical: 14, alignItems: "center",
  },
  pickerCancelText: { fontSize: 15 },
  photoSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderBottomWidth: 0,
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32,
    gap: 0,
  },
  photoSheetTitle: { fontSize: 20, textAlign: "center", marginBottom: 4 },
  photoSheetSub: { fontSize: 13, textAlign: "center", marginBottom: 20 },
  photoPreviewWrap: { alignItems: "center", marginBottom: 20, position: "relative", alignSelf: "center" },
  photoPreview: { width: 110, height: 110, borderRadius: 55 },
  photoPreviewFallback: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: "center", justifyContent: "center",
  },
  photoCameraBtn: {
    position: "absolute", bottom: 4, right: 4,
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
  },
  photoOption: {
    flexDirection: "row", alignItems: "center",
    gap: 14, paddingVertical: 15, borderBottomWidth: 1,
  },
  photoOptionText: { fontSize: 15 },
  photoCancelBtn: {
    borderRadius: 12, paddingVertical: 14,
    alignItems: "center", marginTop: 12,
  },
  photoCancelText: { fontSize: 15 },
});
