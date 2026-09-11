import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Camera,
  Check,
  Image as ImageIcon,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import {
  createPostApi,
  getPlaceDetail,
  getSuggestion,
  searchLocation,
} from "@/features/settings/api/postApi";
import { useExploreStore } from "@/features/explore/store/explore.store";
import { useSettingsStore } from "@/features/settings/store/settings.store";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { radius, spacing, typography } from "@/theme/tokens";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { locationService } from "@/services/location/locationService";
import { secureStorage } from "@/services/storage/secureStorage";
import { uriToDataUri } from "@/utils/imageUtils";

export type FilterName =
  | "Original"
  | "Warm"
  | "Cool"
  | "Vintage"
  | "Mono"
  | "Noir"
  | "Sunset"
  | "Forest"
  | "Soft";

interface FilterConfig {
  name: FilterName;
  overlayColor?: string;
  label: string;
}

const FILTER_PRESETS: FilterConfig[] = [
  { name: "Original", label: "Original", overlayColor: "transparent" },
  { name: "Warm", label: "Warm", overlayColor: "rgba(235, 140, 50, 0.22)" },
  { name: "Cool", label: "Cool", overlayColor: "rgba(30, 144, 255, 0.22)" },
  { name: "Vintage", label: "Vintage", overlayColor: "rgba(180, 130, 70, 0.32)" },
  { name: "Mono", label: "Mono", overlayColor: "rgba(120, 120, 120, 0.45)" },
  { name: "Noir", label: "Noir", overlayColor: "rgba(0, 0, 0, 0.52)" },
  { name: "Sunset", label: "Sunset", overlayColor: "rgba(255, 69, 0, 0.26)" },
  { name: "Forest", label: "Forest", overlayColor: "rgba(34, 139, 34, 0.25)" },
  { name: "Soft", label: "Soft", overlayColor: "rgba(255, 255, 255, 0.24)" },
];

interface LocationItem {
  placeId?: string;
  id?: string;
  name: string;
  formattedAddress?: string;
  lat?: number;
  lng?: number;
}

// In-memory cache across tab switches during the app session
let memoryCachedSuggestions: LocationItem[] | null = null;

export default function CreatePostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;

  // Post form states
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterName>("Original");
  const [hideLikes, setHideLikes] = useState(false);
  const [disableShare, setDisableShare] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Location search states
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationItem[]>(
    () => memoryCachedSuggestions ?? []
  );
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load location suggestions: uses cached places first to avoid unnecessary Geoapify API billing.
  // Calls the places API only on the very first visit or when user explicitly requests a refresh.
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      // 1. If in-memory cache is already loaded, nothing to do
      if (memoryCachedSuggestions && memoryCachedSuggestions.length > 0) {
        return;
      }

      // 2. Persistent storage check (SecureStore)
      const stored = await secureStorage.getSuggestedPlaces<LocationItem[]>();
      if (stored && stored.length > 0) {
        memoryCachedSuggestions = stored;
        if (isMounted) {
          setLocationSuggestions(stored);
        }
        return;
      }

      // 3. First time only: fetch from API and cache
      if (isMounted) setIsLoadingSuggestions(true);
      try {
        const locResult = await locationService.getCurrentLocation();
        const coords = locResult.coords ? { lat: locResult.coords.lat, lng: locResult.coords.lng } : undefined;
        const res = await getSuggestion(coords);
        if (res?.places && res.places.length > 0) {
          memoryCachedSuggestions = res.places;
          await secureStorage.setSuggestedPlaces(res.places);
          if (isMounted) {
            setLocationSuggestions(res.places);
          }
        }
      } catch {
        try {
          const res = await getSuggestion();
          if (res?.places && res.places.length > 0) {
            memoryCachedSuggestions = res.places;
            await secureStorage.setSuggestedPlaces(res.places);
            if (isMounted) {
              setLocationSuggestions(res.places);
            }
          }
        } catch { }
      } finally {
        if (isMounted) setIsLoadingSuggestions(false);
      }
    }

    void loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshSuggestions = async () => {
    if (isLoadingSuggestions) return;
    setIsLoadingSuggestions(true);
    try {
      const locResult = await locationService.getCurrentLocation(true);
      const coords = locResult.coords ? { lat: locResult.coords.lat, lng: locResult.coords.lng } : undefined;
      const res = await getSuggestion(coords);
      if (res?.places && res.places.length > 0) {
        memoryCachedSuggestions = res.places;
        await secureStorage.setSuggestedPlaces(res.places);
        setLocationSuggestions(res.places);
        showSuccessToast("Places updated");
      }
    } catch {
      showErrorToast("Could not refresh places");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced search for location
  useEffect(() => {
    const query = locationQuery.trim();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query || query.length < 2) {
      searchTimeoutRef.current = setTimeout(() => {
        setSearchResults([]);
        setIsSearchingLocation(false);
      }, 0);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const res = await searchLocation(query);
        setSearchResults(res?.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 450);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [locationQuery]);

  const handleSelectLocation = async (item: LocationItem) => {
    try {
      let lat = item.lat;
      let lng = item.lng;
      const placeId = item.placeId || item.id;

      if ((lat === undefined || lng === undefined) && placeId) {
        const detailRes = await getPlaceDetail(placeId);
        if (detailRes?.detail) {
          lat = detailRes.detail.lat;
          lng = detailRes.detail.lng;
        }
      }

      setSelectedLocation({
        name: item.name || item.formattedAddress || "Location",
        lat: lat ?? 0,
        lng: lng ?? 0,
      });
      setLocationQuery("");
      setSearchResults([]);
    } catch {
      setSelectedLocation({
        name: item.name || "Location",
        lat: 0,
        lng: 0,
      });
    }
  };

  const pickImage = async (fromCamera = false) => {
    try {
      let result;
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          showErrorToast("Camera permission required");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.75,
          // base64: true REMOVED!                                                                                                        
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.75,
          // base64: true REMOVED!                                                                                                        
        });
      }

      if (!result.canceled && result.assets[0]) {
        setPickedImageUri(result.assets[0].uri);
      }
    } catch {
      showErrorToast("Could not select image");
    }
  };

  const handleSharePost = async () => {
    if (!pickedImageUri) {
      showErrorToast("Please select an image for your post");
      return;
    }

    setIsPosting(true);
    try {
      const dataUri = await uriToDataUri(pickedImageUri, "image/jpeg");

      const response = await createPostApi({
        image: dataUri,
        caption: caption.trim() || undefined,
        location: selectedLocation
          ? {
            name: selectedLocation.name,
            type: "Point",
            coordinates: [selectedLocation.lng, selectedLocation.lat],
          }
          : null,
        hideLikes,
        disableShare,
        isArchived,
      });

      showSuccessToast(response.message || "Post shared successfully!");

      // Reset fields
      setPickedImageUri(null);
      setCaption("");
      setSelectedFilter("Original");
      setSelectedLocation(null);
      setHideLikes(false);
      setDisableShare(false);
      setIsArchived(false);

      // Refresh stores
      void useExploreStore.getState().fetchFeed(true);
      void useSettingsStore.getState().loadMyPosts({ reset: true });

      // Navigate to explore feed
      router.push("/(tabs)/explore");
    } catch (err: any) {
      showErrorToast(
        err?.response?.data?.message || "Failed to create post. Please try again."
      );
    } finally {
      setIsPosting(false);
    }
  };

  const currentOverlay = FILTER_PRESETS.find((f) => f.name === selectedFilter)?.overlayColor;

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.outlineVariant,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
          Create Post
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Media Picker / Preview */}
        {pickedImageUri ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: pickedImageUri }}
              style={styles.previewImage}
              contentFit="cover"
            />
            {/* Filter Color Tone Overlay */}
            {currentOverlay && currentOverlay !== "transparent" && (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: currentOverlay, borderRadius: radius.xl },
                ]}
                pointerEvents="none"
              />
            )}
            <Pressable
              onPress={() => {
                setPickedImageUri(null);
                setSelectedFilter("Original");
              }}
              style={[
                styles.removeBadge,
                { backgroundColor: "rgba(0,0,0,0.65)" },
              ]}
            >
              <X size={18} color="#FFFFFF" strokeWidth={2.4} />
            </Pressable>
          </View>
        ) : (
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: colors.surfaceContainer,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View
              style={[
                styles.pickerIconWrap,
                { backgroundColor: colors.surfaceContainerHigh },
              ]}
            >
              <ImageIcon size={36} color={colors.primary} strokeWidth={1.8} />
            </View>
            <Text style={[styles.pickerTitle, { color: colors.onSurface }]}>
              Select a photo
            </Text>
            <Text
              style={[
                styles.pickerSubtitle,
                { color: colors.onSurfaceVariant },
              ]}
            >
              Share photos and updates with friends and followers
            </Text>

            <View style={styles.pickerActions}>
              <Pressable
                onPress={() => pickImage(false)}
                style={[
                  styles.pickerBtn,
                  { backgroundColor: colors.primary },
                ]}
              >
                <ImageIcon size={18} color={colors.onPrimary} />
                <Text
                  style={[styles.pickerBtnText, { color: colors.onPrimary }]}
                >
                  Gallery
                </Text>
              </Pressable>

              <Pressable
                onPress={() => pickImage(true)}
                style={[
                  styles.pickerBtn,
                  { backgroundColor: colors.surfaceContainerHigh },
                ]}
              >
                <Camera size={18} color={colors.onSurface} />
                <Text
                  style={[styles.pickerBtnText, { color: colors.onSurface }]}
                >
                  Camera
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* FILTER SELECTION CAROUSEL (When image is picked) */}
        {pickedImageUri && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceContainer,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <SlidersHorizontal size={16} color={colors.primary} />
              <Text style={[styles.sectionLabel, { color: colors.onSurface }]}>
                PHOTO FILTERS
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScroll}
            >
              {FILTER_PRESETS.map((preset) => {
                const isSelected = selectedFilter === preset.name;
                return (
                  <Pressable
                    key={preset.name}
                    onPress={() => setSelectedFilter(preset.name)}
                    style={styles.filterItem}
                  >
                    <View
                      style={[
                        styles.filterThumbWrap,
                        isSelected && {
                          borderColor: colors.primary,
                          borderWidth: 2.5,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: pickedImageUri }}
                        style={styles.filterThumbImage}
                        contentFit="cover"
                      />
                      {preset.overlayColor && preset.overlayColor !== "transparent" && (
                        <View
                          style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: preset.overlayColor },
                          ]}
                        />
                      )}
                      {isSelected && (
                        <View
                          style={[
                            styles.filterCheckBadge,
                            { backgroundColor: colors.primary },
                          ]}
                        >
                          <Check size={11} color={colors.onPrimary} strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.filterName,
                        {
                          color: isSelected ? colors.primary : colors.outline,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Caption Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
            CAPTION
          </Text>
          <TextInput
            multiline
            numberOfLines={4}
            maxLength={500}
            placeholder="Write a caption... #kapota"
            placeholderTextColor={colors.outline}
            value={caption}
            onChangeText={setCaption}
            style={[styles.captionInput, { color: colors.onSurface }]}
          />
          <Text style={[styles.counter, { color: colors.outline }]}>
            {caption.length}/500
          </Text>
        </View>

        {/* LOCATION SECTION */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <MapPin size={16} color={colors.primary} />
              <Text style={[styles.sectionLabel, { color: colors.onSurface }]}>
                ADD LOCATION
              </Text>
            </View>
            {!selectedLocation && (
              <Pressable
                hitSlop={8}
                disabled={isLoadingSuggestions}
                onPress={handleRefreshSuggestions}
                style={({ pressed }) => [
                  styles.refreshPlacesBtn,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={[styles.refreshPlacesText, { color: colors.primary }]}>
                  {isLoadingSuggestions ? "Updating..." : "Refresh"}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Selected Location Pill */}
          {selectedLocation ? (
            <View
              style={[
                styles.selectedLocationCard,
                { backgroundColor: `${colors.primary}12`, borderColor: colors.primary },
              ]}
            >
              <View style={styles.selectedLocLeft}>
                <MapPin size={16} color={colors.primary} />
                <Text numberOfLines={1} style={[styles.selectedLocName, { color: colors.primary }]}>
                  {selectedLocation.name}
                </Text>
              </View>
              <Pressable
                hitSlop={8}
                onPress={() => setSelectedLocation(null)}
                style={styles.selectedLocClose}
              >
                <X size={16} color={colors.primary} />
              </Pressable>
            </View>
          ) : (
            <>
              {/* Location Search Input */}
              <View
                style={[
                  styles.locationInputBox,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.outlineVariant,
                  },
                ]}
              >
                <Search size={16} color={colors.outline} />
                <TextInput
                  value={locationQuery}
                  onChangeText={setLocationQuery}
                  placeholder="Search for location or place..."
                  placeholderTextColor={colors.outline}
                  style={[styles.locationTextInput, { color: colors.onSurface }]}
                />
                {isSearchingLocation || isLoadingSuggestions ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : locationQuery ? (
                  <Pressable hitSlop={6} onPress={() => setLocationQuery("")}>
                    <X size={16} color={colors.outline} />
                  </Pressable>
                ) : null}
              </View>

              {/* Suggestions / Results */}
              <View style={styles.suggestionsContainer}>
                {(locationQuery.trim() ? searchResults : locationSuggestions)
                  .slice(0, 5)
                  .map((item, idx) => (
                    <Pressable
                      key={item.placeId || item.id || idx}
                      onPress={() => handleSelectLocation(item)}
                      style={({ pressed }) => [
                        styles.suggestionRow,
                        pressed && { backgroundColor: `${colors.primary}10` },
                      ]}
                    >
                      <MapPin size={14} color={colors.outline} />
                      <Text
                        numberOfLines={1}
                        style={[styles.suggestionText, { color: colors.onSurface }]}
                      >
                        {item.name || item.formattedAddress}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            </>
          )}
        </View>

        {/* Advanced Preferences Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
            POST SETTINGS
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={[styles.switchTitle, { color: colors.onSurface }]}>
                Hide likes & view count
              </Text>
              <Text
                style={[
                  styles.switchDescription,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Only you will see the total number of likes
              </Text>
            </View>
            <Switch
              value={hideLikes}
              onValueChange={setHideLikes}
              trackColor={{ false: colors.outlineVariant, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View
            style={[styles.divider, { backgroundColor: colors.outlineVariant }]}
          />

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={[styles.switchTitle, { color: colors.onSurface }]}>
                Disable sharing
              </Text>
              <Text
                style={[
                  styles.switchDescription,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Prevent other users from forwarding this post
              </Text>
            </View>
            <Switch
              value={disableShare}
              onValueChange={setDisableShare}
              trackColor={{ false: colors.outlineVariant, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View
            style={[styles.divider, { backgroundColor: colors.outlineVariant }]}
          />

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={[styles.switchTitle, { color: colors.onSurface }]}>
                Archive immediately
              </Text>
              <Text
                style={[
                  styles.switchDescription,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Hide post from public feed upon creation
              </Text>
            </View>
            <Switch
              value={isArchived}
              onValueChange={setIsArchived}
              trackColor={{ false: colors.outlineVariant, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Share Button */}
        <View style={styles.submitContainer}>
          <PrimaryButton
            label="Share Post"
            disabled={!pickedImageUri || isPosting}
            loading={isPosting}
            onPress={handleSharePost}
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    height: 54,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    ...typography.titleMd,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 110,
  },
  previewContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  removeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerContainer: {
    width: "100%",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  pickerTitle: {
    ...typography.titleMd,
    fontSize: 17,
    fontWeight: "700",
  },
  pickerSubtitle: {
    ...typography.bodySm,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    maxWidth: "80%",
  },
  pickerActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  pickerBtnText: {
    ...typography.labelMd,
    fontWeight: "700",
    fontSize: 14,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabel: {
    ...typography.labelMd,
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  filtersScroll: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  filterItem: {
    alignItems: "center",
    gap: 4,
  },
  filterThumbWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
    position: "relative",
  },
  filterThumbImage: {
    width: "100%",
    height: "100%",
  },
  filterCheckBadge: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterName: {
    ...typography.labelMd,
    fontSize: 11,
  },
  captionInput: {
    ...typography.bodySm,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 84,
    textAlignVertical: "top",
    marginTop: 6,
  },
  counter: {
    ...typography.labelMd,
    fontSize: 11,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  selectedLocationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  selectedLocLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  selectedLocName: {
    ...typography.labelMd,
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  selectedLocClose: {
    padding: 2,
  },
  locationInputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginTop: spacing.xs,
  },
  locationTextInput: {
    flex: 1,
    ...typography.bodySm,
    fontSize: 14,
    padding: 0,
  },
  suggestionsContainer: {
    marginTop: spacing.xs,
    gap: 2,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
  },
  suggestionText: {
    ...typography.bodySm,
    fontSize: 13,
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  switchText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  switchTitle: {
    ...typography.bodySm,
    fontSize: 14,
    fontWeight: "600",
  },
  switchDescription: {
    ...typography.bodySm,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  submitContainer: {
    marginTop: spacing.xs,
  },
  refreshPlacesBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radius.full,
  },
  refreshPlacesText: {
    ...typography.labelMd,
    fontSize: 11,
    fontWeight: "600",
  },
});
