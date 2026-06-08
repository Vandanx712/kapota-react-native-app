export interface FormValidationData {
  fullname?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  gender?: string;
  isForLogin: boolean;
}

export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export function validateForm(formData: FormValidationData): ValidationResult {
  if (!formData.email.trim()) {
    return { isValid: false, message: "Email is required" };
  }
  if (!/\S+@\S+\.\S+/.test(formData.email)) {
    return { isValid: false, message: "Invalid email format" };
  }

  if (!formData.password.trim()) {
    return { isValid: false, message: "Password is required" };
  }
  if (formData.password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters" };
  }

  if (!formData.isForLogin) {
    const fullname =
      formData.fullname ||
      `${formData.firstName} ${formData.lastName}`.trim();

    if (!fullname) {
      return { isValid: false, message: "Full name is required" };
    }

    if (formData.gender && !formData.gender.trim()) {
      return { isValid: false, message: "Gender is required" };
    }
  }

  return { isValid: true };
}
