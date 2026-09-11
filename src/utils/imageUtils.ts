import { File } from "expo-file-system";

/**
 * Converts a local file URI to a Data URI on-demand right before network transmission.
 *
 * By reading from disk asynchronously only when sending, we avoid storing megabytes
 * of Base64 strings in React component state or bridging them during ImagePicker operations.
 */
export async function uriToDataUri(
  uri: string,
  mimeType = "image/jpeg",
): Promise<string> {
  const file = new File(uri);
  const base64 = await file.base64();
  return `data:${mimeType};base64,${base64}`;
}
