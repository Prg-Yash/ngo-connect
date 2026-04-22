"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2, Key, ArrowRight } from "lucide-react";
import Link from "next/link";

const Page = () => {
  const router = useRouter();
  const [ngoId, setNgoId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const submitHandler = () => {
    if (!ngoId || !verificationCode) return;
    router.push(`/register/member/${ngoId}/${verificationCode}`);
  };

  const isValid = ngoId.trim().length > 0 && verificationCode.trim().length > 0;

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Join an NGO</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Enter your NGO ID and the verification code provided by your admin
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-[#1CAC78]/5 border border-[#1CAC78]/20 rounded-xl p-4 mb-6">
        <Building2 className="h-4 w-4 text-[#1CAC78] mt-0.5 shrink-0" />
        <p className="text-sm text-gray-600">
          Your NGO admin will provide you with both the{" "}
          <span className="font-semibold text-gray-800">NGO ID</span> and the{" "}
          <span className="font-semibold text-gray-800">Verification Code</span> needed to join.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* NGO ID */}
        <div className="space-y-1.5">
          <Label htmlFor="ngoId" className="text-sm font-medium text-gray-700">NGO ID</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="ngoId"
              name="ngoId"
              placeholder="Enter NGO ID"
              className="pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1CAC78] focus:ring-[#1CAC78]/20 focus:ring-2 transition-all rounded-xl"
              onChange={(e) => setNgoId(e.target.value)}
              value={ngoId}
            />
          </div>
        </div>

        {/* Verification Code */}
        <div className="space-y-1.5">
          <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-700">Verification Code</Label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="verificationCode"
              name="verificationCode"
              placeholder="Enter verification code"
              className="pl-10 h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1CAC78] focus:ring-[#1CAC78]/20 focus:ring-2 transition-all rounded-xl"
              onChange={(e) => setVerificationCode(e.target.value)}
              value={verificationCode}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={submitHandler}
          type="button"
          disabled={!isValid}
          className="w-full h-11 bg-[#1CAC78] hover:bg-[#18956A] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          Validate & Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">or</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full h-11 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Already have an account? Sign in
        </Link>
        <Link
          href="/register"
          className="flex items-center justify-center gap-2 w-full h-11 text-sm font-medium text-gray-500 hover:text-gray-700 transition-all"
        >
          Register a new account instead
        </Link>
      </div>
    </>
  );
};

export default Page;
