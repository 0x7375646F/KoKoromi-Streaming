// Client-side validation rules matching backend Joi validation

export const validateUsername = (username) => {
  const errors = [];
  
  if (!username) {
    errors.push("Username is required");
    return errors;
  }
  
  if (username.length < 2) {
    errors.push("Username must be at least 2 characters");
  }
  
  if (username.length > 32) {
    errors.push("Username must not exceed 32 characters");
  }
  
  if (!/^[a-z0-9_.]+$/.test(username)) {
    errors.push("Invalid username: Use only letters, numbers, _ or .");
  }
  
  return errors;
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push("Password is required");
    return errors;
  }
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  
  if (password.length > 50) {
    errors.push("Password must not exceed 50 characters");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase character");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase character");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[_!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return errors;
};

export const validateOTP = (otp) => {
  const errors = [];
  
  if (!otp) {
    errors.push("OTP is required");
    return errors;
  }
  
  if (otp.length !== 6) {
    errors.push("OTP must be exactly 6 digits");
  }
  
  if (!/^\d{6}$/.test(otp)) {
    errors.push("OTP must contain only digits");
  }
  
  return errors;
};

// Real-time validation helpers
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, message: "Enter a password" };
  
  let strength = 0;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[_!@#$%^&*(),.?":{}|<>]/.test(password)
  ];
  
  strength = checks.filter(Boolean).length;
  
  const messages = {
    0: "Very weak",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
    5: "Very strong"
  };
  
  return {
    strength,
    message: messages[strength] || "Very weak"
  };
};

export const validateForm = (formData, type = 'login') => {
  const errors = {};
  
  // Username validation
  const usernameErrors = validateUsername(formData.username);
  if (usernameErrors.length > 0) {
    errors.username = usernameErrors;
  }
  
  // Password validation
  const passwordErrors = validatePassword(formData.password || formData.newPassword);
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors;
  }
  
  // OTP validation (for registration and password reset)
  if (formData.otp) {
    const otpErrors = validateOTP(formData.otp);
    if (otpErrors.length > 0) {
      errors.otp = otpErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 