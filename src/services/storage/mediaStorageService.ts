import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import { getMediaAccess } from "@/features/chat/api/mediaApi";

export type MediaCategory = "photos" | "videos" | "audio" | "documents";

export interface CategoryStorageStats {
  bytes: number;
  count: number;
  formatted: string;
}

export interface StorageBreakdownStats {
  totalBytes: number;
  totalCount: number;
  totalFormatted: string;
  photos: CategoryStorageStats;
  audio: CategoryStorageStats;
  videos: CategoryStorageStats;
  documents: CategoryStorageStats;
}

export interface DownloadMediaOptions {
  _id: string;
  bytes?: number;
  mimeType?: string;
  originalName?: string;
  url?: string | null;
  onProgress?: (progress: number) => void;
}

const formatBytes = (bytes: number): string => {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const sanitizeFileName = (fileName?: string): string => {
  if (!fileName) return "file";
  return fileName
    .split(/[\\/]/)
    .pop()!
    .replace(/[\u0000-\u001f\u007f\\/:*?"<>|]/g, "_")
    .trim()
    .slice(0, 100);
};

const getExtensionFromMime = (mimeType?: string, originalName?: string): string => {
  if (originalName && originalName.includes(".")) {
    const ext = originalName.split(".").pop();
    if (ext && ext.length <= 5) return ext.toLowerCase();
  }

  if (!mimeType) return "bin";

  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/mp4": "m4a",
    "audio/m4a": "m4a",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "audio/aac": "aac",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  };

  return mimeMap[mimeType.toLowerCase()] || "bin";
};

class MediaStorageService {
  private baseDir: Directory;
  private categoryDirs: Record<MediaCategory, Directory>;
  private activeDownloads: Map<string, Promise<string>> = new Map();

  private uriCache: Map<string, string> = new Map();
  private hasWarmedUpCache = false;
  constructor() {
    this.baseDir = this.resolveBaseDirectory();
    this.categoryDirs = {
      photos: new Directory(this.baseDir, "Kapota Images"),
      videos: new Directory(this.baseDir, "Kapota Video"),
      audio: new Directory(this.baseDir, "Kapota Audio"),
      documents: new Directory(this.baseDir, "Kapota Documents"),
    };
  }

  /**
   * Warm up the cache by scanning directory names ONCE in the background.
   */
  private warmupCache(): void {
    if (this.hasWarmedUpCache) return;
    this.hasWarmedUpCache = true;
    try {
      this.initMediaDirectories();
      (Object.keys(this.categoryDirs) as MediaCategory[]).forEach((cat) => {
        const dir = this.categoryDirs[cat];
        if (!dir.exists) return;
        const items = dir.list();
        items.forEach((item) => {
          if (item instanceof File && (item.size ?? 0) > 0) {
            const separatorIndex = item.name.indexOf("_");
            if (separatorIndex > 0) {
              const mediaId = item.name.slice(0, separatorIndex);
              this.uriCache.set(mediaId, item.uri);
            }
          }
        });
      });
    } catch (err) {
      console.warn("Error warming up media URI cache:", err);
    }
  }

  private resolveBaseDirectory(): Directory {
    if (Platform.OS === "android") {
      try {
        const androidMedia = new Directory("file:///storage/emulated/0/Android/media");
        if (androidMedia.exists) {
          const appMediaDir = new Directory(androidMedia, "com.kapotachatapp");
          if (!appMediaDir.exists) appMediaDir.create();

          const kapotaDir = new Directory(appMediaDir, "Kapota");
          if (!kapotaDir.exists) kapotaDir.create();

          const mediaDir = new Directory(kapotaDir, "Media");
          if (!mediaDir.exists) mediaDir.create();

          return mediaDir;
        }
      } catch (err) {
        console.warn("Could not initialize Android/media folder, falling back to document directory:", err);
      }
    }

    const docMedia = new Directory(Paths.document, "Kapota Media");
    if (!docMedia.exists) {
      try {
        docMedia.create();
      } catch {
        // ignore
      }
    }
    return docMedia;
  }

  /**
   * Returns human-readable path string for UI display.
   */
  public getDisplayPath(): string {
    if (Platform.OS === "android") {
      if (this.baseDir.uri.includes("Android/media")) {
        return "Internal storage > Android > media > com.kapotachatapp > Kapota > Media";
      }
      return "App Documents > Kapota Media";
    }
    return "On My iPhone > Kapota > Kapota Media";
  }

  /**
   * Returns the base file URI.
   */
  public getBasePath(): string {
    return this.baseDir.uri;
  }

  /**
   * Initializes the directory hierarchy if not already existing.
   */
  public initMediaDirectories(): void {
    try {
      if (!this.baseDir.exists) {
        this.baseDir = this.resolveBaseDirectory();
        this.categoryDirs = {
          photos: new Directory(this.baseDir, "Kapota Images"),
          videos: new Directory(this.baseDir, "Kapota Video"),
          audio: new Directory(this.baseDir, "Kapota Audio"),
          documents: new Directory(this.baseDir, "Kapota Documents"),
        };
      }
      (Object.keys(this.categoryDirs) as MediaCategory[]).forEach((cat) => {
        const dir = this.categoryDirs[cat];
        if (!dir.exists) {
          dir.create();
        }
      });
    } catch (error) {
      console.warn("Failed to initialize media directories:", error);
    }
  }

  /**
   * Resolves category based on MIME type or resource type.
   */
  public getCategory(mimeType?: string, resourceType?: string): MediaCategory {
    const mime = (mimeType || "").toLowerCase();
    const res = (resourceType || "").toLowerCase();

    if (res === "image" || mime.startsWith("image/")) return "photos";
    if (res === "video" || mime.startsWith("video/")) return "videos";
    if (res === "audio" || mime.startsWith("audio/")) return "audio";
    return "documents";
  }

  /**
   * Retrieves the Directory instance for a specific category.
   */
  public getDirectory(category: MediaCategory): Directory {
    this.initMediaDirectories();
    return this.categoryDirs[category];
  }

  /**
   * Constructs the deterministic local File instance for a media item.
   */
  public getLocalFile(
    mediaId: string,
    mimeType?: string,
    originalName?: string,
    resourceType?: string,
  ): File {
    const category = this.getCategory(mimeType, resourceType);
    const dir = this.getDirectory(category);
    const ext = getExtensionFromMime(mimeType, originalName);
    const safeName = sanitizeFileName(originalName);
    const fileName = safeName.endsWith(`.${ext}`)
      ? `${mediaId}_${safeName}`
      : `${mediaId}_${safeName}.${ext}`;

    return new File(dir, fileName);
  }

  /**
   * Checks if media is already downloaded and present on the filesystem.
   */
  public isMediaDownloaded(
    mediaId: string,
    mimeType?: string,
    originalName?: string,
    resourceType?: string,
  ): boolean {
    return Boolean(this.getLocalUri(mediaId, mimeType, originalName, resourceType));
  }

  /**
   * Retrieves the local file URI in O(1) time without redundant disk I/O.
   */
  public getLocalUri(
    mediaId: string,
    mimeType?: string,
    originalName?: string,
    resourceType?: string,
  ): string | null {
    // 1. Instant RAM Cache check (< 0.001ms)
    if (this.uriCache.has(mediaId)) {
      return this.uriCache.get(mediaId)!;
    }

    // 2. Deterministic single-file existence check (no directory listing)
    try {
      this.initMediaDirectories();
      const primaryFile = this.getLocalFile(mediaId, mimeType, originalName, resourceType);
      if (primaryFile.exists && (primaryFile.size ?? 0) > 0) {
        this.uriCache.set(mediaId, primaryFile.uri);
        return primaryFile.uri;
      }
    } catch {
      return null;
    }

    // 3. Fallback: warm up once if never scanned
    if (!this.hasWarmedUpCache) {
      this.warmupCache();
      return this.uriCache.get(mediaId) ?? null;
    }

    return null;
  }

  /**
   * Downloads a media attachment to device storage with progress reporting and deduplication.
   */
  public async downloadMedia(options: DownloadMediaOptions): Promise<string> {
    const { _id, mimeType, originalName, onProgress } = options;

    // 1. Check if already present on disk
    const existingUri = this.getLocalUri(_id, mimeType, originalName);
    if (existingUri) {
      onProgress?.(100);
      return existingUri;
    }

    // 2. Reuse in-flight download if one is already in progress
    if (this.activeDownloads.has(_id)) {
      return this.activeDownloads.get(_id)!;
    }

    const downloadPromise = (async () => {
      try {
        this.initMediaDirectories();
        const targetFile = this.getLocalFile(_id, mimeType, originalName);

        // 3. Resolve downloadable URL (authenticated access url or provided direct url)
        let downloadUrl = options.url;
        if (!downloadUrl) {
          const access = await getMediaAccess(_id, "inline");
          downloadUrl = access?.url;
        }

        if (!downloadUrl) {
          throw new Error("Unable to obtain download URL for media");
        }

        // 4. Download file using createDownloadTask for progress updates
        const task = File.createDownloadTask(downloadUrl, targetFile, {
          onProgress: ({ bytesWritten, totalBytes }) => {
            const expected = totalBytes || options.bytes || 0;
            if (expected > 0 && onProgress) {
              const pct = Math.min(Math.round((bytesWritten / expected) * 100), 100);
              onProgress(pct);
            }
          },
        });

        const downloadedFile = await task.downloadAsync();
        if (!downloadedFile || !downloadedFile.exists || (downloadedFile.size ?? 0) === 0) {
          throw new Error("Download completed but file is invalid or empty");
        }

        this.uriCache.set(_id, downloadedFile.uri);
        onProgress?.(100);
        return downloadedFile.uri;
      } finally {
        this.activeDownloads.delete(_id);
      }
    })();

    this.activeDownloads.set(_id, downloadPromise);
    return downloadPromise;
  }

  /**
   * Caches sender's media locally when sending so the sender never has to re-download.
   */
  public async cacheSenderMedia(
    sourceUri: string,
    mimeType: string,
    filename?: string,
    mediaId?: string,
  ): Promise<string> {
    try {
      this.initMediaDirectories();
      const id = mediaId || `local_${Date.now()}`;
      const targetFile = this.getLocalFile(id, mimeType, filename);
      const sourceFile = new File(sourceUri);

      if (sourceFile.exists) {
        await sourceFile.copy(targetFile);
        this.uriCache.set(id, targetFile.uri);
        return targetFile.uri;
      }

      return sourceUri;
    } catch (error) {
      console.warn("Sender media cache copy failed:", error);
      return sourceUri;
    }
  }

  /**
   * Calculates storage usage statistics across all 4 categories.
   */
  public getStorageStats(): StorageBreakdownStats {
    this.initMediaDirectories();

    const result: StorageBreakdownStats = {
      totalBytes: 0,
      totalCount: 0,
      totalFormatted: "0 KB",
      photos: { bytes: 0, count: 0, formatted: "0 KB" },
      audio: { bytes: 0, count: 0, formatted: "0 KB" },
      videos: { bytes: 0, count: 0, formatted: "0 KB" },
      documents: { bytes: 0, count: 0, formatted: "0 KB" },
    };

    (Object.keys(this.categoryDirs) as MediaCategory[]).forEach((cat) => {
      const dir = this.categoryDirs[cat];
      if (!dir.exists) return;

      try {
        const items = dir.list();
        let catBytes = 0;
        let catCount = 0;

        items.forEach((item) => {
          if (item instanceof File) {
            catBytes += item.size ?? 0;
            catCount += 1;
          }
        });

        result[cat].bytes = catBytes;
        result[cat].count = catCount;
        result[cat].formatted = formatBytes(catBytes);

        result.totalBytes += catBytes;
        result.totalCount += catCount;
      } catch (err) {
        console.warn(`Error scanning ${cat} directory:`, err);
      }
    });

    result.totalFormatted = formatBytes(result.totalBytes);
    return result;
  }

  /**
   * Deletes a specific media file matching mediaId from local storage.
   */
  public deleteLocalMedia(
    mediaId: string,
    mimeType?: string,
    originalName?: string,
  ): boolean {
    try {
      this.initMediaDirectories();
      let deleted = false;
      const primaryFile = this.getLocalFile(mediaId, mimeType, originalName);

      if (primaryFile.exists) {
        primaryFile.delete();
        deleted = true;
      }

      // Check all categories for files starting with mediaId
      (Object.keys(this.categoryDirs) as MediaCategory[]).forEach((cat) => {
        const dir = this.categoryDirs[cat];
        if (!dir.exists) return;
        const items = dir.list();
        items.forEach((item) => {
          if (item instanceof File && item.name.startsWith(mediaId)) {
            try {
              item.delete();
              deleted = true;
            } catch {
              // ignore individual delete failure
            }
          }
        });
      });

      this.uriCache.delete(mediaId);
      return deleted;
    } catch {
      this.uriCache.delete(mediaId);
      return false;
    }
  }

  /**
   * Clears the entire offline media storage cache and recreates fresh folders.
   */
  public clearMediaCache(): StorageBreakdownStats {
    try {
      (Object.keys(this.categoryDirs) as MediaCategory[]).forEach((cat) => {
        const dir = this.categoryDirs[cat];
        if (!dir.exists) return;
        try {
          const items = dir.list();
          items.forEach((item) => {
            try {
              item.delete();
            } catch {
              // ignore
            }
          });
        } catch (err) {
          console.warn(`Error cleaning category ${cat}:`, err);
        }
      });
    } catch (err) {
      console.warn("Error in clearMediaCache:", err);
    }

    this.uriCache.clear();
    this.initMediaDirectories();
    return this.getStorageStats();
  }
}

export const mediaStorageService = new MediaStorageService();
