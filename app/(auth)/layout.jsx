"use client";

import Image from "next/image";
import logo from "@/public/logo.png";
import bg from "@/public/bg.jpg";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Loading from "@/components/loading/Loading";

const AuthLayout = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  return (
    <section className="min-h-screen bg-white flex">
      {/* Left Panel — Brand Visual */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative flex-col justify-between p-12 bg-gray-950 overflow-hidden">
        {/* Background image */}
        <Image
          alt="Background"
          src={bg}
          fill
          priority
          quality={90}
          className="absolute inset-0 object-cover opacity-30"
          sizes="50vw"
        />

        {/* Green accent gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1CAC78]/30 via-transparent to-gray-950/80" />

        {/* Top: Logo + Name */}
        <div className="relative z-10 flex items-center gap-3">
          <Image
            src={logo}
            alt="NGO-Connect Logo"
            width={44}
            height={44}
            className="rounded-xl"
          />
          <span className="text-white text-xl font-bold tracking-tight">NGO-Connect</span>
        </div>

        {/* Center: Headline */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#1CAC78]/20 border border-[#1CAC78]/40 text-[#4ade9e] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1CAC78] animate-pulse" />
            NGO Management Platform
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Empowering NGOs<br />
            <span className="text-[#1CAC78]">to do more good.</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Manage campaigns, track donations, coordinate activities, and measure your impact — all in one place.
          </p>
        </div>

        {/* Bottom: Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "NGOs Registered", value: "500+" },
            { label: "Donations Tracked", value: "₹2Cr+" },
            { label: "Activities Managed", value: "10K+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[#1CAC78] text-2xl font-bold">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <Image src={logo} alt="logo" width={36} height={36} className="rounded-lg" />
          <span className="text-gray-900 text-lg font-bold">NGO-Connect</span>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;
