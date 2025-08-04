import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { toast } from "react-toastify";
import QRCode from "qrcode";
import useAuthStore from "../store/authStore";
import authService from "../services/authService";
import { validateForm, validateUsername, validatePassword, validateOTP } from "../utils/validation";

const AuthModal = ({ isOpen, onClose }) => {
  const login = useAuthStore((state) => state.login);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [otpData, setOtpData] = useState({
    username: "",
    otp: "",
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    username: "",
    newPassword: "",
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Real-time validation
    if (name === 'username') {
      const errors = validateUsername(value);
      setValidationErrors(prev => ({
        ...prev,
        username: errors.length > 0 ? errors : undefined
      }));
    } else if (name === 'password') {
      const errors = validatePassword(value);
      setValidationErrors(prev => ({
        ...prev,
        password: errors.length > 0 ? errors : undefined
      }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    
    // Validate on blur and clear errors if valid
    if (name === 'username') {
      const errors = validateUsername(value);
      setValidationErrors(prev => ({
        ...prev,
        username: errors.length > 0 ? errors : undefined
      }));
    } else if (name === 'password') {
      const errors = validatePassword(value);
      setValidationErrors(prev => ({
        ...prev,
        password: errors.length > 0 ? errors : undefined
      }));
    }
  };

  const handleOTPChange = (e) => {
    setOtpData({
      ...otpData,
      [e.target.name]: e.target.value,
    });
  };

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData({
      ...forgotPasswordData,
      [name]: value,
    });
    
    // Real-time validation for forgot password form
    if (name === 'username') {
      const errors = validateUsername(value);
      setValidationErrors(prev => ({
        ...prev,
        forgotUsername: errors.length > 0 ? errors : undefined
      }));
    } else if (name === 'newPassword') {
      const errors = validatePassword(value);
      setValidationErrors(prev => ({
        ...prev,
        forgotPassword: errors.length > 0 ? errors : undefined
      }));
    } else if (name === 'otp') {
      const errors = validateOTP(value);
      setValidationErrors(prev => ({
        ...prev,
        forgotOtp: errors.length > 0 ? errors : undefined
      }));
    }
  };

  const handleForgotPasswordBlur = (e) => {
    const { name, value } = e.target;
    
    // Validate on blur and clear errors if valid
    if (name === 'username') {
      const errors = validateUsername(value);
      setValidationErrors(prev => ({
        ...prev,
        forgotUsername: errors.length > 0 ? errors : undefined
      }));
    } else if (name === 'newPassword') {
      const errors = validatePassword(value);
      setValidationErrors(prev => ({
        ...prev,
        forgotPassword: errors.length > 0 ? errors : undefined
      }));
    } else if (name === 'otp') {
      const errors = validateOTP(value);
      setValidationErrors(prev => ({
        ...prev,
        forgotOtp: errors.length > 0 ? errors : undefined
      }));
    }
  };

  const generateQRCode = async (secret, username) => {
    try {
      const otpauthUrl = `otpauth://totp/kokoromi:${username}?secret=${secret}&issuer=kokoromi`;
      const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
      setQrCodeData(qrCodeUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    const validation = validateForm(formData, 'login');
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error("Please fix the validation errors");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await authService.login(formData);

      if (result.success) {
        toast.success("Login successful!");
        // Store user data and token from login response
        login(result.data.user, result.data.token);
        onClose();
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    const validation = validateForm(formData, 'register');
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error("Please fix the validation errors");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await authService.register(formData);

      if (result.success && result.data.totp_secret) {
        toast.success("Account created! Please scan the QR code and verify OTP to complete registration.");
        await generateQRCode(result.data.totp_secret, formData.username);
        setOtpData({ username: formData.username, otp: "" });
        setShowQRCode(true);
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (isLogin) {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authService.verifyOTP(otpData.username, otpData.otp);

      if (result.success) {
        toast.success("Registration completed successfully! Logging you in...");
        
        const loginResult = await authService.login({
          username: otpData.username,
          password: formData.password
        });

        if (loginResult.success) {
          toast.success("Login successful!");
          // Store user data and token from login response
          login(loginResult.data.user, loginResult.data.token);
          onClose();
        } else {
          toast.error("Registration successful but login failed. Please try logging in manually.");
          setShowOTPVerification(false);
          setShowQRCode(false);
          setIsLogin(true);
          resetForm();
        }
      } else {
        toast.error(result.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate forgot password form
    const usernameErrors = validateUsername(forgotPasswordData.username);
    const passwordErrors = validatePassword(forgotPasswordData.newPassword);
    const otpErrors = validateOTP(forgotPasswordData.otp);
    
    const errors = {};
    if (usernameErrors.length > 0) errors.username = usernameErrors;
    if (passwordErrors.length > 0) errors.password = passwordErrors;
    if (otpErrors.length > 0) errors.otp = otpErrors;
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the validation errors");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await authService.resetPassword(
        forgotPasswordData.username,
        forgotPasswordData.newPassword,
        forgotPasswordData.otp
      );

      if (result.success) {
        toast.success("Password reset successful! You can now log in with your new password.");
        setShowForgotPassword(false);
        setIsLogin(true);
        resetForm();
      } else {
        toast.error(result.message || "Password reset failed");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ username: "", password: "" });
    setOtpData({ username: "", otp: "" });
    setForgotPasswordData({ username: "", newPassword: "", otp: "" });
    setShowPassword(false);
    setShowQRCode(false);
    setShowOTPVerification(false);
    setShowForgotPassword(false);
    setQrCodeData("");
    setValidationErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="bg-card/80 backdrop-blur-sm border border-white/10 rounded-lg p-6 w-full max-w-md relative shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaXmark size={20} />
        </button>

        {!showQRCode && !showOTPVerification && !showForgotPassword ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              {isLogin ? "Login" : "Register"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Username"
                  className={`w-full pl-10 pr-4 py-2 bg-backGround border rounded-md text-white focus:outline-none focus:border-primary transition-colors ${
                    validationErrors.username ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                />
                {validationErrors.username && (
                  <div className="absolute -bottom-5 left-0 text-red-400 text-xs">
                    {validationErrors.username[0]}
                  </div>
                )}
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="Password"
                  className={`w-full pl-10 pr-12 py-2 bg-backGround border rounded-md text-white focus:outline-none focus:border-primary transition-colors ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white z-10"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {validationErrors.password && (
                  <div className="absolute -bottom-5 left-0 text-red-400 text-xs">
                    {validationErrors.password[0]}
                  </div>
                )}

              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-black py-2 rounded-md font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Loading..." : isLogin ? "Login" : "Register"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <div className="flex justify-between items-center">
                <button
                  onClick={toggleMode}
                  className="text-primary hover:underline"
                >
                  {isLogin
                    ? "Don't have an account? Register"
                    : "Already have an account? Login"}
                </button>
                {isLogin && (
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
            </div>
          </>
        ) : showQRCode ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">2FA Setup</h2>
            <p className="text-gray-300 mb-4">
              Scan this QR code with your authenticator app to enable 2FA
            </p>
            <div className="flex justify-center mb-4">
              <img
                src={qrCodeData}
                alt="QR Code for 2FA"
                className="border-2 border-gray-600 rounded-lg"
              />
            </div>
            <button
              onClick={() => {
                setShowOTPVerification(true);
                setShowQRCode(false);
              }}
              className="bg-primary text-black py-2 px-4 rounded-md font-semibold hover:bg-primary/90"
            >
              Verify OTP
            </button>
          </div>
        ) : showOTPVerification ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Complete Registration</h2>
            <p className="text-gray-300 mb-4">
              Enter the 6-digit code from your authenticator app to complete registration
            </p>
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  name="otp"
                  value={otpData.otp}
                  onChange={handleOTPChange}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full px-4 py-2 bg-backGround border border-gray-600 rounded-md text-white focus:outline-none focus:border-primary text-center text-lg tracking-widest transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-black py-2 rounded-md font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            <button
              onClick={() => {
                setShowOTPVerification(false);
                setShowQRCode(true);
              }}
              className="mt-2 text-gray-400 hover:text-white"
            >
              Back to QR Code
            </button>
          </div>
        ) : showForgotPassword ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
            <p className="text-gray-300 mb-4">
              Enter your username, new password, and OTP from your authenticator app
            </p>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="text"
                  name="username"
                  value={forgotPasswordData.username}
                  onChange={handleForgotPasswordChange}
                  onBlur={handleForgotPasswordBlur}
                  placeholder="Username"
                  className={`w-full pl-10 pr-4 py-2 bg-backGround border rounded-md text-white focus:outline-none focus:border-primary transition-colors ${
                    validationErrors.username ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                />
                {validationErrors.username && (
                  <div className="absolute -bottom-5 left-0 text-red-400 text-xs">
                    {validationErrors.username[0]}
                  </div>
                )}
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={forgotPasswordData.newPassword}
                  onChange={handleForgotPasswordChange}
                  onBlur={handleForgotPasswordBlur}
                  placeholder="New Password"
                  className={`w-full pl-10 pr-12 py-2 bg-backGround border rounded-md text-white focus:outline-none focus:border-primary transition-colors ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white z-10"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {validationErrors.password && (
                  <div className="absolute -bottom-5 left-0 text-red-400 text-xs">
                    {validationErrors.password[0]}
                  </div>
                )}

              </div>
              <div className="relative">
                <input
                  type="text"
                  name="otp"
                  value={forgotPasswordData.otp}
                  onChange={handleForgotPasswordChange}
                  onBlur={handleForgotPasswordBlur}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className={`w-full px-4 py-2 bg-backGround border rounded-md text-white focus:outline-none focus:border-primary text-center text-lg tracking-widest transition-colors ${
                    validationErrors.otp ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                />
                {validationErrors.otp && (
                  <div className="absolute -bottom-5 left-0 text-red-400 text-xs">
                    {validationErrors.otp[0]}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-black py-2 rounded-md font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
            <button
              onClick={() => setShowForgotPassword(false)}
              className="mt-2 text-gray-400 hover:text-white"
            >
              Back to Login
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AuthModal; 