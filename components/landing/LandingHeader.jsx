"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LandingHeader = () => {
  const { user, profile } = useAuth();

  const dashboardHref = profile?.type === "ngo" ? "/dashboard/ngo" : "/dashboard/user";

  return (
    <nav className="relative z-20 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1FC276] flex items-center justify-center shadow-lg shadow-[#1FC276]/20">
          <Globe className="text-white w-6 h-6" strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">NGO-Connect</span>
      </Link>

      <div className="hidden lg:flex items-center gap-10 text-[15px] text-gray-300 font-medium">
        <Link href="#" className="hover:text-white transition-colors">About</Link>
        <Link href="/ngo" className="hover:text-white transition-colors">Services</Link>
        <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
        {/* <Link href="#" className="hover:text-white transition-colors">Company</Link> */}
        <Link href="#" className="hover:text-white transition-colors">Resources</Link>
      
        <Link href="/ngo" className="hover:text-white transition-colors">Ngos</Link>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <Link
            href={dashboardHref}
            className="text-[15px] font-bold bg-[#1FC276] hover:bg-[#19a563] text-white px-7 py-3 rounded-full transition-all shadow-lg shadow-[#1FC276]/20 tracking-wide"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className="text-[15px] font-medium text-white hover:text-gray-200 transition-colors px-2">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-[15px] font-bold bg-[#1FC276] hover:bg-[#19a563] text-white px-7 py-3 rounded-full transition-all shadow-lg shadow-[#1FC276]/20 tracking-wide"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default LandingHeader;