import * as Location from "expo-location";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserLocationResult {
  success: boolean;
  coords?: Coordinates;
  address?: string;
  error?: string;
  permissionDenied?: boolean;
}

class LocationService {
  private cachedLocation: Coordinates | null = null;
  private cachedAddress: string | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute cache

  /**
   * Request foreground location permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.warn("Failed to request location permission:", error);
      return false;
    }
  }

  /**
   * Check if location permission is already granted
   */
  async hasPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === "granted";
    } catch {
      return false;
    }
  }

  /**
   * Reverse geocodes coordinates to a human-readable city/region name (e.g. "Surat, Gujarat")
   */
  async reverseGeocode(coords: Coordinates): Promise<string | null> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: coords.lat,
        longitude: coords.lng,
      });

      if (results && results.length > 0) {
        const place = results[0];
        const parts = [
          place.city || place.subregion || place.district,
          place.region || place.country,
        ].filter(Boolean);

        return parts.join(", ") || place.name || null;
      }
      return null;
    } catch (error) {
      console.warn("Reverse geocode failed:", error);
      return null;
    }
  }

  /**
   * Get user's current GPS location.
   * Prompts for permission if not yet granted.
   * Attempts last known position first for instant response, then fetches accurate position.
   */
  async getCurrentLocation(forceRefresh = false): Promise<UserLocationResult> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cachedLocation &&
      now - this.lastFetchTime < this.CACHE_TTL_MS
    ) {
      return {
        success: true,
        coords: this.cachedLocation,
        address: this.cachedAddress ?? undefined,
      };
    }

    try {
      // 1. Check services enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        return {
          success: false,
          error: "Location services are disabled. Please turn on GPS on your device.",
        };
      }

      // 2. Check / request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return {
          success: false,
          permissionDenied: true,
          error: "Location permission is required to continue.",
        };
      }

      // 3. Fast path: check last known position
      let coords: Coordinates | null = null;
      try {
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: 30000, // 30 seconds
        });
        if (lastKnown?.coords) {
          coords = {
            lat: lastKnown.coords.latitude,
            lng: lastKnown.coords.longitude,
          };
        }
      } catch {
        // Fallback to fresh position
      }

      // 4. Fresh position if needed
      if (!coords) {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      }

      // 5. Reverse geocode to friendly name
      const address = await this.reverseGeocode(coords);

      // Cache result
      this.cachedLocation = coords;
      this.cachedAddress = address;
      this.lastFetchTime = now;

      return {
        success: true,
        coords,
        address: address ?? undefined,
      };
    } catch (error: any) {
      console.warn("Error getting current location:", error);
      return {
        success: false,
        error: error?.message || "Failed to get current location",
      };
    }
  }

  /**
   * Clears the in-memory cached location
   */
  clearCache() {
    this.cachedLocation = null;
    this.cachedAddress = null;
    this.lastFetchTime = 0;
  }
}

export const locationService = new LocationService();
