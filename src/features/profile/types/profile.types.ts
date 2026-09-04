export interface ProfilePic {
  url: string;
  key: string;
}

export interface AuthUser {
  _id?: string;
  fullname?: string;
  email?: string;
  bio?: string;
  profilePic?: ProfilePic;
  gender?: string;
}

export function splitFullName(fullname?: string) {
  if (!fullname?.trim()) {
    return { firstname: "", lastname: "" };
  }

  const parts = fullname.trim().split(/\s+/);
  return {
    firstname: parts[0] ?? "",
    lastname: parts.slice(1).join(" "),
  };
}
