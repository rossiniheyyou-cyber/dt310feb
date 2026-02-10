"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { login as loginApi, register as registerApi, getDashboardRoute, forgotPassword, resetPassword } from "@/lib/api/auth";
import { Eye, EyeOff, ArrowLeft, X } from "lucide-react";
import Image from "next/image";

type AuthMode = "login" | "signup-step1" | "signup-step2";
type ForgotPasswordMode = "email" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupAge, setSignupAge] = useState("");
  const [signupCountry, setSignupCountry] = useState("");
  const [signupPhoneNumber, setSignupPhoneNumber] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState<ForgotPasswordMode>("email");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load previously used emails from localStorage
  useEffect(() => {
    const emails = JSON.parse(localStorage.getItem("loggedEmails") || "[]");
    setSavedEmails(emails);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate password strength
  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return "Password must include at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return "Password must include at least one uppercase letter";
    }
    if (!/(?=.*[0-9])/.test(pwd)) {
      return "Password must include at least one number";
    }
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(pwd)) {
      return "Password must include at least one symbol";
    }
    return null;
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Call real backend API
      const response = await loginApi({ email, password });

      // Save email to localStorage for autocomplete
      let emails = [...savedEmails];
      if (!emails.includes(email)) {
        emails.push(email);
        localStorage.setItem("loggedEmails", JSON.stringify(emails));
        setSavedEmails(emails);
      }

      // Navigate to appropriate dashboard based on role
      const dashboardRoute = getDashboardRoute(response.user.role);
      router.push(dashboardRoute);
    } catch (err: any) {
      console.error("Login error:", err);
      
      // Handle different error types
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || "Invalid credentials");
      } else if (err.code === "ECONNREFUSED" || err.message?.includes("Network Error")) {
        setError("Cannot connect to server. Please ensure the backend is running.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupStep1 = () => {
    setError("");
    if (!signupName.trim()) {
      setError("Name is required");
      return;
    }
    if (!signupEmail.trim()) {
      setError("Email is required");
      return;
    }
    if (!isValidEmail(signupEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!signupAge.trim()) {
      setError("Age is required");
      return;
    }
    const ageNum = parseInt(signupAge, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      setError("Please enter a valid age (1-150)");
      return;
    }
    if (!signupCountry.trim()) {
      setError("Country is required");
      return;
    }
    if (!signupPhoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }
    setMode("signup-step2"); // Go directly to password
  };

  const handleSignup = async () => {
    if (!signupPassword) {
      setError("Password is required");
      return;
    }

    const passwordError = validatePassword(signupPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Parse and validate age
      const ageNum = parseInt(signupAge, 10);
      const ageValue = (!isNaN(ageNum) && ageNum > 0 && ageNum < 150) ? ageNum : undefined;
      
      // Call real backend API - no role selection, admin will assign role
      const response = await registerApi({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        ...(ageValue !== undefined && { age: ageValue }),
        country: signupCountry.trim() || undefined,
        phoneNumber: signupPhoneNumber.trim() || undefined,
      });

      // Check if account requires approval
      if (response.requiresApproval || response.user?.status === 'pending') {
        setError("");
        alert("Account created successfully! Your account is pending admin approval. You will be able to log in once an administrator approves your request.");
        setMode("login");
        return;
      }

      // Navigate to appropriate dashboard based on role
      const dashboardRoute = getDashboardRoute(response.user.role);
      router.push(dashboardRoute);
    } catch (err: any) {
      console.error("Signup error:", err);
      
      // Handle different error types
      if (err.response?.status === 400) {
        const message = err.response.data?.message;
        if (message?.includes("Email already in use")) {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(message || "Invalid signup information");
        }
      } else if (err.response?.status === 403) {
        setError("Insufficient permissions. To create courses, you need an instructor or admin account. Please contact an administrator.");
      } else if (err.response?.status === 500) {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || "Internal Server Error";
        setError(`Server error: ${errorMsg}. Please check the backend logs for details.`);
        console.error("Server error details:", err.response?.data);
      } else if (err.response?.status === 503) {
        setError(
          err.response?.data?.message ||
            "Server is temporarily unavailable. Please try again later."
        );
      } else if (err.code === "ECONNREFUSED" || err.message?.includes("Network Error")) {
        setError("Cannot connect to server. Please ensure the backend is running.");
      } else {
        setError(err.response?.data?.message || err.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectEmail = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setShowDropdown(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      setError("Email is required");
      return;
    }
    if (!isValidEmail(forgotPasswordEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setForgotPasswordSuccess("");
    setLoading(true);

    try {
      const response = await forgotPassword(forgotPasswordEmail);
      setForgotPasswordSuccess(response.message);
      
      // In development, show token; in production, this would be sent via email
      if (response.resetToken) {
        setResetToken(response.resetToken);
        setForgotPasswordMode("reset");
      } else {
        // Production mode - token sent via email
        setForgotPasswordSuccess("If an account with that email exists, a password reset link has been sent. Please check your email.");
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      if (err.response?.status === 503) {
        setError(err.response.data?.message || "Service unavailable. Please try again later.");
      } else {
        setError(err.response?.data?.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim()) {
      setError("Reset token is required");
      return;
    }
    if (!newPassword.trim()) {
      setError("Password is required");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setError("");
    setForgotPasswordSuccess("");
    setLoading(true);

    try {
      const response = await resetPassword({
        token: resetToken,
        password: newPassword,
      });
      setForgotPasswordSuccess(response.message);
      
      // Close modal after 2 seconds and redirect to login
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordMode("email");
        setResetToken("");
        setNewPassword("");
        setForgotPasswordEmail("");
        setForgotPasswordSuccess("");
      }, 2000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      if (err.response?.status === 400) {
        setError(err.response.data?.message || "Invalid or expired reset token");
      } else if (err.response?.status === 503) {
        setError(err.response.data?.message || "Service unavailable. Please try again later.");
      } else {
        setError(err.response?.data?.message || "Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = 
    signupName.trim().length > 0 && 
    signupEmail.trim().length > 0 && 
    isValidEmail(signupEmail) &&
    signupAge.trim().length > 0 &&
    signupCountry.trim().length > 0 &&
    signupPhoneNumber.trim().length > 0;
  
  const canProceedStep2 = signupPassword.length > 0 && !validatePassword(signupPassword);

  const isSignup = mode !== "login";

  return (
    <>
      <div className="relative h-screen overflow-hidden">
        {mode === "login" ? (
          <div className="h-screen flex overflow-hidden">
            {/* Left Side - Sign In Form */}
            <div className="w-full lg:w-1/2 flex flex-col bg-white h-screen overflow-y-auto">
              <div className="flex-1 flex items-center p-8 lg:p-12">
                <div className="w-full max-w-md">
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Image
                        src="/digitalt3-logo.png"
                        alt="DigitalT3 Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                      <h2 className="text-4xl font-bold text-teal-600">
                        DIGITALT3 <span className="text-slate-900">LMS</span>
                      </h2>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                      Sign in
                    </h1>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                  )}

                  <div className="space-y-4">
                    {/* Email input with custom dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        autoComplete="off"
                        placeholder="Enter your email address"
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        onFocus={() => setShowDropdown(true)}
                        disabled={loading}
                      />
                      {showDropdown && savedEmails.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-slate-300 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                          {savedEmails
                            .filter((e) => e.toLowerCase().includes(email.toLowerCase()))
                            .map((e) => (
                              <div
                                key={e}
                                onClick={() => selectEmail(e)}
                                className="px-4 py-2 cursor-pointer hover:bg-slate-100"
                              >
                                {e}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Password input with visibility toggle */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        required
                        className="w-full px-4 py-2.5 pr-12 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        disabled={loading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && email.trim() && password.trim() && !loading) {
                            handleLogin();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-slate-500 hover:text-slate-700"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setForgotPasswordMode("email");
                          setForgotPasswordEmail("");
                          setResetToken("");
                          setNewPassword("");
                          setError("");
                          setForgotPasswordSuccess("");
                        }}
                        className="text-sm text-teal-600 hover:underline"
                        disabled={loading}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogin}
                      disabled={!email.trim() || !password.trim() || loading}
                      className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </button>

                    {/* or divider + Microsoft logo (reference: social login below main button) */}
                    <div className="relative flex items-center gap-3 py-4">
                      <div className="flex-1 border-t border-dashed border-slate-300" />
                      <span className="text-sm text-slate-500">or</span>
                      <div className="flex-1 border-t border-dashed border-slate-300" />
                    </div>
                    <button
                      type="button"
                      onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
                      disabled={loading}
                      title="Sign in with Microsoft"
                      className="block w-full flex justify-center py-1 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Image
                        src="/microsoft-logo.png"
                        alt="Microsoft"
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </button>
                  </div>

                  <p className="text-slate-600 text-sm text-center mt-6">
                    Don't have an account?{" "}
                    <span
                      onClick={() => {
                        if (!loading) {
                          setMode("signup-step1");
                          setError("");
                        }
                      }}
                      className="text-teal-600 font-medium cursor-pointer hover:underline"
                    >
                      Create account
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Sign In Illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-50 relative overflow-hidden h-screen">
              <Image
                src="/signin-illustration.png"
                alt="DigitalT3 Learning Platform"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="h-screen flex overflow-hidden">
            {/* Left Side - Create Account Form */}
            <div className="w-full lg:w-1/2 flex flex-col bg-white h-screen overflow-y-auto">
              <div className="flex-1 flex items-center p-8 lg:p-12">
                <div className="w-full max-w-md">
                  {mode === "signup-step1" ? (
                    <>
                      {/* Back button */}
                      <button
                        onClick={() => {
                          setMode("login");
                          setError("");
                        }}
                        className="mb-6 flex items-center text-slate-600 hover:text-slate-900 transition-colors text-sm"
                        disabled={loading}
                      >
                        <ArrowLeft size={18} className="mr-1" />
                        Go back
                      </button>

                      <div className="mb-8">
                        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                          Create account
                        </h1>
                      </div>

                      {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                      )}

                      <div className="space-y-4">
                    {/* Two-column row: Full Name and Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          value={signupName}
                          onChange={(e) => {
                            setSignupName(e.target.value);
                            setError("");
                          }}
                          disabled={loading}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && canProceedStep1 && !loading) {
                              handleSignupStep1();
                            }
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          value={signupEmail}
                          onChange={(e) => {
                            setSignupEmail(e.target.value);
                            setError("");
                          }}
                          disabled={loading}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && canProceedStep1 && !loading) {
                              handleSignupStep1();
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Two-column row: Age and Country */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Age <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Age"
                          required
                          min="1"
                          max="150"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          value={signupAge}
                          onChange={(e) => {
                            setSignupAge(e.target.value);
                            setError("");
                          }}
                          disabled={loading}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && canProceedStep1 && !loading) {
                              handleSignupStep1();
                            }
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Country"
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          value={signupCountry}
                          onChange={(e) => {
                            setSignupCountry(e.target.value);
                            setError("");
                          }}
                          disabled={loading}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && canProceedStep1 && !loading) {
                              handleSignupStep1();
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Single column: Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter your phone number"
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        value={signupPhoneNumber}
                        onChange={(e) => {
                          setSignupPhoneNumber(e.target.value);
                          setError("");
                        }}
                        disabled={loading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && canProceedStep1 && !loading) {
                            handleSignupStep1();
                          }
                        }}
                      />
                    </div>

                    <button
                      onClick={handleSignupStep1}
                      disabled={!canProceedStep1 || loading}
                      className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>

                  <p className="text-slate-600 text-sm text-center mt-6">
                    Already have an account?{" "}
                    <span
                      onClick={() => {
                        if (!loading) {
                          setMode("login");
                          setError("");
                        }
                      }}
                      className="text-teal-600 font-medium cursor-pointer hover:underline"
                    >
                      Login
                    </span>
                  </p>
                    </>
                  ) : mode === "signup-step2" ? (
                    <>
                      {/* Back button */}
                      <button
                        onClick={() => {
                          setMode("signup-step1");
                          setError("");
                        }}
                        className="mb-6 flex items-center text-slate-600 hover:text-slate-900 transition-colors text-sm"
                        disabled={loading}
                      >
                        <ArrowLeft size={18} className="mr-1" />
                        Go back
                      </button>

                      <div className="mb-8">
                        <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                          Create your password
                        </h1>
                        <p className="text-slate-700 text-base mb-1 font-medium">
                          {signupEmail}
                        </p>
                        <p className="text-slate-500 text-sm">
                          To keep your account safe, choose a long password and avoid using real words.
                        </p>
                      </div>

                      {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showSignupPassword ? "text" : "password"}
                              placeholder="Create a password"
                              required
                              className="w-full px-4 py-2.5 pr-12 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                              value={signupPassword}
                              onChange={(e) => {
                                setSignupPassword(e.target.value);
                                setError("");
                              }}
                              disabled={loading}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && canProceedStep2 && !loading) {
                                  handleSignup();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                              disabled={loading}
                            >
                              {showSignupPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Passwords must have at least 8 characters and include a mix of uppercase letters, lowercase letters, numbers, and symbols.
                          </p>
                        </div>

                        <button
                          onClick={handleSignup}
                          disabled={!canProceedStep2 || loading}
                          className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Creating Account..." : "Create account"}
                        </button>
                      </div>

                      <p className="text-slate-600 text-sm text-center mt-6">
                        Already have an account?{" "}
                        <span
                          onClick={() => {
                            if (!loading) {
                              setMode("login");
                              setError("");
                            }
                          }}
                          className="text-teal-600 font-medium cursor-pointer hover:underline"
                        >
                          Login
                        </span>
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right Side - DigitalT3 Illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden h-screen">
              <Image
                src="/digitalt3-illustration.png"
                alt="DigitalT3 Learning Platform"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordMode("email");
                setForgotPasswordEmail("");
                setResetToken("");
                setNewPassword("");
                setError("");
                setForgotPasswordSuccess("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              disabled={loading}
            >
              <X size={24} />
            </button>

            {forgotPasswordMode === "email" ? (
              <>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Reset Password</h2>
                <p className="text-slate-600 mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && (
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                )}
                {forgotPasswordSuccess && (
                  <p className="text-green-600 text-sm mb-4">{forgotPasswordSuccess}</p>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="input-modern"
                      value={forgotPasswordEmail}
                      onChange={(e) => {
                        setForgotPasswordEmail(e.target.value);
                        setError("");
                        setForgotPasswordSuccess("");
                      }}
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && forgotPasswordEmail.trim() && isValidEmail(forgotPasswordEmail) && !loading) {
                          handleForgotPassword();
                        }
                      }}
                    />
                  </div>

                  <button
                    onClick={handleForgotPassword}
                    disabled={!forgotPasswordEmail.trim() || !isValidEmail(forgotPasswordEmail) || loading}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Set New Password</h2>
                <p className="text-slate-600 mb-6">
                  Enter your reset token and choose a new password.
                </p>

                {error && (
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                )}
                {forgotPasswordSuccess && (
                  <p className="text-green-600 text-sm mb-4">{forgotPasswordSuccess}</p>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Reset Token
                    </label>
                    <input
                      type="text"
                      placeholder="Enter reset token"
                      className="input-modern"
                      value={resetToken}
                      onChange={(e) => {
                        setResetToken(e.target.value);
                        setError("");
                        setForgotPasswordSuccess("");
                      }}
                      disabled={loading}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Check your email for the reset token (or use the token shown in development mode).
                    </p>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                        setForgotPasswordSuccess("");
                      }}
                      disabled={loading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && resetToken.trim() && newPassword.trim() && !validatePassword(newPassword) && !loading) {
                          handleResetPassword();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-9 text-slate-500 hover:text-slate-700"
                      disabled={loading}
                    >
                      {showNewPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                    <p className="text-xs text-slate-500 mt-2">
                      Passwords must have at least 8 characters and include a mix of uppercase letters, lowercase letters, numbers, and symbols.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setForgotPasswordMode("email");
                        setResetToken("");
                        setNewPassword("");
                        setError("");
                        setForgotPasswordSuccess("");
                      }}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={!resetToken.trim() || !newPassword.trim() || !!validatePassword(newPassword) || loading}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
