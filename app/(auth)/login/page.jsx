"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Lock, Mail } from "lucide-react";
import {
  signInWithEmailAndPassword,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // MFA states
  const [showMFADialog, setShowMFADialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [mfaResolver, setMfaResolver] = useState(null);
  const [mfaError, setMfaError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneHint, setPhoneHint] = useState("");
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  const loginHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      if (error.code === "auth/multi-factor-auth-required") {
        const resolver = getMultiFactorResolver(auth, error);
        setMfaResolver(resolver);
        if (resolver.hints?.length > 0) {
          const maskedPhone = resolver.hints[0].phoneNumber.replace(/^(.*)(\\d{4})$/, "••••••$2");
          setPhoneHint(maskedPhone);
        }
        const rv = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
        setRecaptchaVerifier(rv);
        setShowMFADialog(true);
        setLoading(false);
        return;
      }
      if (error.message.includes("user-not-found")) {
        setError("User not found. Please check your email and password.");
      } else if (error.message.includes("invalid-credential")) {
        setError("Invalid credentials. Please check your email and password.");
      } else if (error.message.includes("invalid-password")) {
        setError("Invalid password. Please check your password.");
      } else if (error.message.includes("invalid-email")) {
        setError("Invalid email address.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    setMfaError("");
    setIsSendingCode(true);
    try {
      if (!mfaResolver || !recaptchaVerifier) throw new Error("MFA session not initialized");
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const vid = await phoneAuthProvider.verifyPhoneNumber(
        { multiFactorHint: mfaResolver.hints[0], session: mfaResolver.session },
        recaptchaVerifier
      );
      setVerificationId(vid);
    } catch (error) {
      setMfaError(error.message || "Failed to send verification code");
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyMfaCode = async () => {
    setMfaError("");
    setIsVerifying(true);
    try {
      if (!verificationCode || verificationCode.length < 6) throw new Error("Please enter a valid verification code");
      if (!mfaResolver || !verificationId) throw new Error("MFA session not initialized");
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await mfaResolver.resolveSignIn(multiFactorAssertion);
      setShowMFADialog(false);
      router.push("/dashboard");
    } catch (error) {
      setMfaError(error.code === "auth/invalid-verification-code"
        ? "Invalid verification code. Please try again."
        : error.message || "Failed to verify code"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDialogClose = () => {
    if (recaptchaVerifier) recaptchaVerifier.clear();
    setShowMFADialog(false);
  };

  const isFormValid = email && password && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
        <p className="text-gray-500 mt-2 text-sm">Sign in to your NGO-Connect account</p>
      </div>

      {/* Form */}
      <form onSubmit={loginHandler} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              placeholder="your@email.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1CAC78] focus:ring-[#1CAC78]/20 focus:ring-2 transition-all rounded-xl"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
            <Link href="/forgot" className="text-xs text-[#1CAC78] hover:text-[#18956A] font-medium transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1CAC78] focus:ring-[#1CAC78]/20 focus:ring-2 transition-all rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full h-11 bg-[#1CAC78] hover:bg-[#18956A] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Sign In <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">or</span>
        </div>
      </div>

      {/* Register link */}
      <Link
        href="/register"
        className="flex items-center justify-center gap-2 w-full h-11 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
      >
        Create a new account
      </Link>

      {/* Hidden recaptcha container */}
      <div id="recaptcha-container" />

      {/* MFA Dialog */}
      <Dialog open={showMFADialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Two-Factor Authentication</DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              {!verificationId
                ? `Verify your identity — code will be sent to ${phoneHint}.`
                : "Enter the verification code sent to your phone."}
            </DialogDescription>
          </DialogHeader>

          {mfaError && (
            <Alert variant="destructive" className="mt-2 rounded-xl">
              <AlertDescription>{mfaError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            {!verificationId ? (
              <Button
                onClick={sendVerificationCode}
                disabled={isSendingCode}
                className="bg-[#1CAC78] hover:bg-[#18956A] rounded-xl h-11"
              >
                {isSendingCode ? "Sending..." : "Send Verification Code"}
              </Button>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="verification-code" className="text-sm font-medium">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="h-11 rounded-xl text-center text-lg tracking-widest"
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setVerificationId("")} disabled={isVerifying} className="rounded-xl">
                    Back
                  </Button>
                  <Button
                    onClick={verifyMfaCode}
                    disabled={isVerifying || verificationCode.length < 6}
                    className="bg-[#1CAC78] hover:bg-[#18956A] rounded-xl"
                  >
                    {isVerifying ? "Verifying..." : "Verify"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
