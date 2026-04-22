"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  Eye, EyeOff, ArrowRight, User, Mail, Lock,
  Phone, Hash, Building2, ShieldCheck, X, CheckCircle2,
} from "lucide-react";

const NgoRegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    ngoName: "", phone: "", registrationNumber: "",
  });
  const [invalidInputs, setInvalidInputs] = useState([]);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      const valid = /^[A-Za-z]+ [A-Za-z]+$/.test(value);
      setInvalidInputs((prev) => valid ? prev.filter((i) => i !== name) : [...new Set([...prev, name])]);
    }
    if (name === "email") {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setInvalidInputs((prev) => valid ? prev.filter((i) => i !== name) : [...new Set([...prev, name])]);
    }
    if (name === "phone") {
      const valid = /^[0-9]{10}$/.test(value);
      setInvalidInputs((prev) => valid ? prev.filter((i) => i !== name) : [...new Set([...prev, name])]);
    }
  };

  const registerHandle = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { name, ngoName, email, password, phone, registrationNumber } = formData;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await Promise.all([
        setDoc(doc(db, "users", user.uid), {
          email, name, ngoName, type: "ngo", role: "admin",
          ngoId: user.uid, phone, registrationNumber,
          pan: registrationNumber, createdAt: serverTimestamp(),
        }),
        setDoc(doc(db, "ngo", user.uid), {
          email, ngoName, ngoId: user.uid, name, role: "admin",
          registrationNumber, pan: registrationNumber,
          phone, createdAt: serverTimestamp(),
        }),
      ]);
      router.push("/dashboard/ngo");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("Email already in use. Please use a different email.");
      else if (err.code === "auth/invalid-email") setError("Please enter a valid email address.");
      else if (err.code === "auth/weak-password") setError("Password must be at least 6 characters long.");
      else setError(err.message);
      setLoading(false);
    }
  };

  const otpSendingHandler = async (e) => {
    e.preventDefault();
    if (!formData.email || invalidInputs.includes("email")) {
      setInvalidInputs((prev) => [...new Set([...prev, "email"])]);
      return;
    }
    setSendingOtp(true);
    setOtpError("");
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, ngoName: formData.ngoName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
      setInvalidInputs((prev) => prev.filter((i) => i !== "email"));
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtpHandler = async (e) => {
    e.preventDefault();
    setOtpError("");
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, action: "verify", code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setVerifiedEmail(true);
      setInvalidInputs((prev) => prev.filter((i) => i !== "otp"));
    } catch (err) {
      setOtpError(err.message);
      setInvalidInputs((prev) => [...new Set([...prev, "otp"])]);
    }
  };

  const isFormValid =
    formData.name && formData.email && formData.password &&
    formData.ngoName && formData.phone && formData.registrationNumber &&
    invalidInputs.length === 0 && ndaAccepted;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Register your NGO</h1>
        <p className="text-gray-500 mt-2 text-sm">Access the exclusive NGO management portal</p>
      </div>

      {/* Account type toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
        <Link
          href="/register"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 transition-all"
        >
          <User className="h-3.5 w-3.5" />
          User
        </Link>
        <Link
          href="/register/ngo"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white shadow-sm text-sm font-semibold text-gray-900 transition-all"
        >
          <Building2 className="h-3.5 w-3.5" />
          NGO
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={registerHandle} className="space-y-4">
        {/* NGO Name */}
        <div className="space-y-1.5">
          <Label htmlFor="ngoName" className="text-sm font-medium text-gray-700">NGO Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="ngoName" name="ngoName"
              placeholder="Your NGO's full name"
              value={formData.ngoName} onChange={handleChange} required
              className="pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1CAC78] focus:ring-[#1CAC78]/20 focus:ring-2 transition-all rounded-xl"
            />
          </div>
        </div>

        {/* Admin Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">Admin Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="name" name="name"
              placeholder="First Last"
              value={formData.name} onChange={handleChange} required
              className={`pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 transition-all rounded-xl ${
                invalidInputs.includes("name")
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "focus:border-[#1CAC78] focus:ring-[#1CAC78]/20"
              }`}
            />
          </div>
          {invalidInputs.includes("name") && (
            <p className="text-xs text-red-500">Enter first and last name separated by a space.</p>
          )}
        </div>

        {/* Email + OTP */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            NGO Email
            {verifiedEmail && (
              <span className="ml-2 inline-flex items-center gap-1 text-[#1CAC78] text-xs font-medium">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            )}
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email" name="email"
                placeholder="ngo@email.com" type="email"
                value={formData.email} onChange={handleChange} required
                disabled={otpSent && !verifiedEmail}
                className={`pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 transition-all rounded-xl ${
                  invalidInputs.includes("email")
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "focus:border-[#1CAC78] focus:ring-[#1CAC78]/20"
                }`}
              />
            </div>
            {!verifiedEmail && (
              <button
                type="button"
                onClick={otpSendingHandler}
                disabled={sendingOtp || !formData.email || invalidInputs.includes("email")}
                className="h-11 px-3 text-xs font-semibold rounded-xl border border-[#1CAC78] text-[#1CAC78] hover:bg-[#1CAC78]/5 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap transition-all"
              >
                {sendingOtp ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
              </button>
            )}
          </div>
          {otpError && !otpSent && (
            <p className="text-xs text-red-500">{otpError}</p>
          )}
        </div>

        {/* OTP Verification */}
        {otpSent && !verifiedEmail && (
          <div className="space-y-1.5">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-700">Enter OTP</Label>
            <div className="flex gap-2">
              <Input
                id="otp" type="number"
                placeholder="6-digit code"
                value={otp} onChange={(e) => setOtp(e.target.value)} required
                className={`h-11 text-center text-lg tracking-widest border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 transition-all rounded-xl ${
                  invalidInputs.includes("otp")
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "focus:border-[#1CAC78] focus:ring-[#1CAC78]/20"
                }`}
              />
              <button
                type="button" onClick={verifyOtpHandler}
                className="h-11 px-4 text-sm font-semibold rounded-xl bg-[#1CAC78] text-white hover:bg-[#18956A] transition-all"
              >
                Verify
              </button>
            </div>
            {invalidInputs.includes("otp") && (
              <p className="text-xs text-red-500">Invalid OTP. Please try again.</p>
            )}
          </div>
        )}

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="phone" name="phone"
              placeholder="10-digit number"
              value={formData.phone} onChange={handleChange} required
              className={`pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 transition-all rounded-xl ${
                invalidInputs.includes("phone")
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "focus:border-[#1CAC78] focus:ring-[#1CAC78]/20"
              }`}
            />
          </div>
          {invalidInputs.includes("phone") && (
            <p className="text-xs text-red-500">Please enter a valid 10-digit phone number.</p>
          )}
        </div>

        {/* Registration Number */}
        <div className="space-y-1.5">
          <Label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700">Registration Number</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="registrationNumber" name="registrationNumber"
              placeholder="e.g. S/12345/UP/2023"
              value={formData.registrationNumber} onChange={handleChange} required
              pattern="(S/\d{5}/[A-Z]{2,}/\d{4})|(\d{3,}/Trust/\d{4})|(U\d{5}[A-Z]{2}\d{4}NPL\d{6})"
              title="Enter a valid Indian NGO Registration Number"
              className="pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1CAC78] focus:ring-[#1CAC78]/20 focus:ring-2 transition-all rounded-xl"
            />
          </div>
          <p className="text-xs text-gray-400">Formats: S/12345/UP/2023 · 123/Trust/2022 · U12345DL2023NPL012345</p>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password" name="password"
              placeholder="Min. 6 characters"
              type={showPassword ? "text" : "password"}
              value={formData.password} onChange={handleChange} required
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

        {/* NDA Checkbox */}
        <div className="flex items-start gap-3 pt-1">
          <div className="relative mt-0.5">
            <input
              type="checkbox" id="nda"
              checked={ndaAccepted}
              onChange={() => setNdaAccepted(!ndaAccepted)}
              className="w-4 h-4 rounded border-gray-300 text-[#1CAC78] focus:ring-[#1CAC78] cursor-pointer accent-[#1CAC78]"
            />
          </div>
          <label htmlFor="nda" className="text-sm text-gray-600 leading-relaxed">
            I agree to the{" "}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-[#1CAC78] font-medium hover:underline"
            >
              Non-Disclosure Agreement (NDA)
            </button>
          </label>
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
          className="w-full h-11 bg-[#1CAC78] hover:bg-[#18956A] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md mt-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Registering...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Register NGO <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">already have an account?</span>
        </div>
      </div>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 w-full h-11 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
      >
        Sign in instead
      </Link>

      {/* NDA Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1CAC78]/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-[#1CAC78]" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Non-Disclosure Agreement</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              NGO-CONNECT agrees not to share any confidential data of your NGO with other NGOs or
              third parties. All information provided during registration is stored securely and used
              solely for platform functionality. Any breach of this agreement gives the NGO the right
              to take legal action against NGO-CONNECT.
            </p>
            <button
              onClick={() => { setNdaAccepted(true); setShowModal(false); }}
              className="mt-5 w-full h-10 bg-[#1CAC78] hover:bg-[#18956A] text-white text-sm font-semibold rounded-xl transition-all"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NgoRegistrationPage;