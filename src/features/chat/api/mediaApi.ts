import { api } from "@/lib/api";

export interface MediaAccessResponse {
  success: boolean;
  access: {
    url: string;
    disposition: "inline" | "attachment";
    expiresAt: string;
  };
}

export interface PrepareMediaUploadPayload {
  purpose: "chat_attachment" | "avatar" | "post" | "chat_background";
  conversationId?: string;
  originalName: string;
  mimeType: string;
  bytes: number;
}

export interface PrepareMediaUploadResponse {
  success: boolean;
  assetId: string;
  resourceType: "image" | "video" | "raw";
  uploadParams: {
    timestamp: number;
    public_id: string;
    type: string;
    overwrite: boolean;
  };
  signature: string;
  apiKey: string;
  cloudName: string;
}

export interface CompleteMediaUploadResponse {
  success: boolean;
  media: {
    _id: string;
    purpose: string;
    resourceType: "image" | "video" | "raw";
    mimeType: string;
    originalName: string;
    bytes: number;
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    status: string;
    url?: string | null;
  };
}

/**
 * Retrieves a short-lived authenticated access URL for a chat media attachment.
 */
export const getMediaAccess = async (
  mediaId: string,
  disposition: "inline" | "attachment" = "inline",
): Promise<MediaAccessResponse["access"]> => {
  const response = await api.get<MediaAccessResponse>(
    `/media/${mediaId}/access`,
    {
      params: { disposition },
    },
  );
  return response.data.access;
};

/**
 * Prepares a media upload on the backend and gets Cloudinary signature.
 */
export const prepareMediaUpload = async (
  data: PrepareMediaUploadPayload,
): Promise<PrepareMediaUploadResponse> => {
  const response = await api.post<PrepareMediaUploadResponse>(
    "/media/prepare",
    data,
  );
  return response.data;
};

/**
 * Completes a media upload on the backend after Cloudinary upload succeeds.
 */
export const completeMediaUpload = async (
  assetId: string,
): Promise<CompleteMediaUploadResponse> => {
  const response = await api.post<CompleteMediaUploadResponse>(
    "/media/complete",
    { assetId },
  );
  return response.data;
};
