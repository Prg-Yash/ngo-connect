"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Building2 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function UserRegistrationPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const registerHandle = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { name, email, password } = formData;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email,
        name,
        type: "user",
        userId: user.uid,
        createdAt: serverTimestamp(),
      }, { merge: true });
      router.push("/dashboard/user");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use. Please use a different email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters long.");
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h1>
        <p className="text-gray-500 mt-2 text-sm">Join NGO-Connect and start making an impact</p>
      </div>

      {/* Account type toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
        <Link
          href="/register"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white shadow-sm text-sm font-semibold text-gray-900 transition-all"
        >
          <User className="h-3.5 w-3.5" />
          User
        </Link>
        <Link
          href="/register/ngo"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 transition-all"
        >
          <Building2 className="h-3.5 w-3.5" />
          NGO
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={registerHandle} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="name"
              name="name"
              placeholder="Your full name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1CAC78] focus:ring-[#1CAC78]/20 focus:ring-2 transition-all rounded-xl"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              name="email"
              placeholder="your@email.com"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1CAC78] focus:ring-[#1CAC78]/20 focus:ring-2 transition-all rounded-xl"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              name="password"
              placeholder="Min. 6 characters"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
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
          {formData.password.length > 0 && formData.password.length < 6 && (
            <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
              Password must be at least 6 characters
            </p>
          )}
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
          disabled={loading || !formData.name || !formData.email || formData.password.length < 6}
          className="w-full h-11 bg-[#1CAC78] hover:bg-[#18956A] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Creating account...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Create Account <ArrowRight className="h-4 w-4" />
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
          <span className="bg-white px-3 text-gray-400">already have an account?</span>
        </div>
      </div>

      {/* Login link */}
      <Link
        href="/login"
        className="flex items-center justify-center gap-2 w-full h-11 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
      >
        Sign in instead
      </Link>

      {/* Terms */}
      <p className="text-center text-xs text-gray-400 mt-6">
        By creating an account, you agree to our{" "}
        <span className="text-[#1CAC78] cursor-pointer hover:underline">Terms of Service</span>{" "}
        and{" "}
        <span className="text-[#1CAC78] cursor-pointer hover:underline">Privacy Policy</span>
      </p>
    </>
  );
}
