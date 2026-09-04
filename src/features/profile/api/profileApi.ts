import { api } from "@/lib/api";
import type { ProfileFormData } from "../validation/profileSchema";

type UpdateProfilePayload = ProfileFormData & {
  profileImageUri?: string | null;
};

export const updateProfile = async (data: UpdateProfilePayload) => {
  const formData = new FormData();

  formData.append("fullname", `${data.firstname} ${data.lastname}`);
  formData.append("email", data.email);

  if (data.profileImageUri) {
    const uri = data.profileImageUri;
    const filename = uri.split("/").pop() ?? "profile.jpg";

    formData.append("profilePic", {
      uri,
      type: "image/jpeg",
      name: filename,
    } as unknown as Blob);
  }

  const response = await api.put("/user/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
