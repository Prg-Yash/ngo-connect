"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Outfit } from "next/font/google"
import LandingHeader from "@/components/landing/LandingHeader"
import { 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Settings, 
  CreditCard,
  Building2,
  Users,
  Globe,
  BarChart4,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  Apple
} from "lucide-react"

const outfit = Outfit({ subsets: ["latin"] });

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`${outfit.className} text-gray-900 bg-white overflow-x-hidden`}>
        {/* Dark Hero Section */}
        <div className="relative bg-[#0d1612] text-white overflow-hidden min-h-[950px] border-b border-gray-900">
            {/* Grid background pattern with highlighted grids */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.15]">
              <div className="w-[100vw] h-[100vh] absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="grid grid-cols-12 grid-rows-8 w-[1400px] h-[900px]">
                  {Array.from({length: 96}).map((_, i) => (
                    <div key={i} className={`border-[0.5px] border-white/20 transition-all ${[28, 31, 32, 42, 45, 50, 56, 67, 72].includes(i) ? 'bg-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]' : ''}`}></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0d1612_70%)] pointer-events-none"></div>
            <div className="absolute top-[40%] left-1/2 -translate-y-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#1FC276]/20 rounded-full blur-[200px] pointer-events-none"></div>

            {/* Navbar */}
            <LandingHeader />

            {/* Hero Content */}
            <div className="relative z-10 pt-16 pb-12 max-w-7xl mx-auto px-6 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm mb-12 backdrop-blur-md shadow-xl"
              >
                <span className="px-3 py-1 rounded-full bg-[#E5F32E] text-black text-xs font-bold leading-none tracking-wide">New</span>
                <span className="text-gray-300 text-[15px] font-medium">Platform fully upgraded!</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-bold tracking-tight mb-8 max-w-[900px] mx-auto leading-[1.05]"
              >
                NGO management<br />made easy.
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 text-lg md:text-[22px] max-w-[700px] mx-auto mb-14 leading-relaxed font-light"
              >
                We help organizations and volunteers to securely connect and manage activities globally, without the hassle.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-5 font-semibold"
              >
                <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1FC276] hover:bg-[#19a563] text-white px-9 py-4 rounded-full transition-all text-[17px] shadow-lg shadow-[#1FC276]/20">
                  Create account <ArrowRight className="w-5 h-5 ml-1" strokeWidth={2.5} />
                </Link>
                <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black px-9 py-4 rounded-full hover:bg-gray-100 transition-all text-[17px]">
                  <div className="w-7 h-7 rounded-full bg-[#1FC276] flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" />
                  </div>
                  Watch Tutorial
                </button>
              </motion.div>
            </div>

            {/* Floating Glass Cards perfectly aligned using strict center offsets */}
            <div className="relative z-10 w-full max-w-[1000px] mx-auto h-[450px] pointer-events-none hidden lg:block mt-6">
              <div className="relative w-full h-full mx-auto">
                
                {/* Phone Mockup Background Base */}
                <motion.div 
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-[calc(50%-170px)] bottom-[-80px] w-[340px] h-[400px] bg-black rounded-t-[50px] border-[12px] border-b-0 border-[#1c2e25] shadow-2xl z-10 flex justify-center pt-5 pointer-events-auto overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                  {/* Dynamic Island Notch */}
                  <div className="w-[120px] h-[32px] bg-[#0d1612] rounded-full shadow-inner flex items-center justify-between px-3 relative z-20">
                     <div className="w-[8px] h-[8px] rounded-full bg-blue-900/60 ml-2"></div>
                     <div className="w-[10px] h-[10px] rounded-full bg-[#1FC276]/60 border border-[#1FC276] shadow-[0_0_10px_rgba(31,194,118,0.5)] mr-1"></div>
                  </div>
                </motion.div>

                {/* Center Main Card overlapping the phone */}
                <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: [0, -6, 0], opacity: 1 }}
                  transition={{ opacity: { delay: 0.3 }, y: { repeat: Infinity, duration: 6, ease: "easeInOut" } }}
                  className="absolute left-[calc(50%-190px)] bottom-[15px] w-[380px] bg-white rounded-[32px] p-7 shadow-[0_40px_80px_rgba(0,0,0,0.8)] z-20 pointer-events-auto border border-gray-100"
                >
                  <div className="text-center mb-7">
                    <h3 className="text-gray-900 font-bold text-xl tracking-tight">Impact Overview</h3>
                    <p className="text-gray-400 text-[13px] mt-1.5 font-medium">Latest updates on supported causes.</p>
                  </div>
                  <div className="space-y-4 relative">
                    <div className="bg-gray-50/50 border border-gray-100 rounded-[20px] p-5 flex items-center justify-between transition-colors hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100 text-xl">🏥</div>
                        <span className="text-[16px] font-bold text-gray-800">Healthcare<span className="text-gray-400 ml-2 text-[11px]">▼</span></span>
                      </div>
                      <span className="text-[15px] font-semibold text-gray-500">2,450 Drives</span>
                    </div>
                    
                    {/* Swap button exactly on the border line */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1FC276] flex items-center justify-center border-[4px] border-white z-10 shadow-md">
                      <div className="flex flex-col items-center justify-center h-full">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                           <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"/>
                         </svg>
                      </div>
                    </div>

                    <div className="bg-gray-50/50 border border-gray-100 rounded-[20px] p-5 flex items-center justify-between transition-colors hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-800 rounded-full shadow-sm flex items-center justify-center border border-blue-900 text-xl text-white">📚</div>
                        <span className="text-[16px] font-bold text-gray-800">Education<span className="text-gray-400 ml-2 text-[11px]">▼</span></span>
                      </div>
                      <span className="text-[15px] font-semibold text-gray-500">1,280 Campaigns</span>
                    </div>
                  </div>
                  <button className="w-full mt-7 bg-[#16211D] text-white py-4 rounded-[18px] text-[14px] font-bold tracking-wide hover:bg-black transition-colors">
                    VIEW REPORT
                  </button>
                </motion.div>

                {/* Left Top Card perfectly overlapping by 20px */}
                <motion.div 
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, y: [0, -5, 0] }}
                  transition={{ opacity: { delay: 0.4 }, y: { repeat: Infinity, duration: 5.2, ease: "easeInOut", delay: 1 } }}
                  className="absolute left-[calc(50%-430px)] top-[40px] bg-white rounded-[32px] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[260px] z-30"
                >
                  <p className="text-gray-400 text-[13px] mb-2 font-semibold">Total Impact</p>
                  <div className="flex items-center gap-3">
                    <h4 className="text-gray-900 font-bold text-[28px] tracking-tight">9,647 Hrs</h4>
                    <span className="bg-[#1FC276]/20 text-[#19a563] text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                      +8.50%
                    </span>
                  </div>
                </motion.div>

                {/* Left Bottom Card perfectly overlapping by 10px */}
                <motion.div 
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, y: [0, 5, 0] }}
                  transition={{ opacity: { delay: 0.5 }, y: { repeat: Infinity, duration: 5.7, ease: "easeInOut", delay: 1.5 } }}
                  className="absolute left-[calc(50%-440px)] top-[200px] bg-white rounded-[28px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] w-[260px] flex items-center gap-5 z-20"
                >
                  <div className="w-12 h-12 rounded-full bg-[#E5F32E]/30 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-[#8B9117]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[11px] font-semibold mb-0.5">Volunteers</p>
                    <h4 className="text-gray-900 font-bold text-2xl tracking-tight leading-none">6,790.67</h4>
                  </div>
                  
                  {/* Floating badge sticking out */}
                  <div className="absolute -right-3 -bottom-3 w-10 h-10 rounded-full bg-[#1FC276] border-4 border-[#0d1612] flex items-center justify-center shadow-lg">
                    <BarChart4 className="w-4 h-4 text-white" strokeWidth={3}/>
                  </div>
                </motion.div>

                {/* Right Bottom Card perfectly overlapping by 20px */}
                <motion.div 
                   initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, y: [0, -5, 0] }}
                  transition={{ opacity: { delay: 0.6 }, y: { repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.5 } }}
                  className="absolute left-[calc(50%+170px)] bottom-[100px] bg-white rounded-[28px] p-6 shadow-2xl w-[220px] z-30"
                >
                  <div className="absolute -left-5 top-5 w-10 h-10 rounded-full bg-[#1FC276] flex items-center justify-center shadow-[0_10px_20px_rgba(31,194,118,0.3)] border-4 border-[#0d1612]">
                    <ArrowRight className="w-4 h-4 text-white -rotate-45" strokeWidth={3} />
                  </div>
                  <p className="text-gray-400 text-[13px] mb-1.5 font-semibold ml-4">Net Income</p>
                  <div className="flex items-center justify-between ml-4">
                    <h4 className="text-gray-900 font-bold text-2xl tracking-tight">$234.98K</h4>
                  </div>
                </motion.div>

                {/* Right Floating Users perfectly nested */}
                <motion.div 
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, y: [0, 5, 0] }}
                  transition={{ opacity: { delay: 0.7 }, y: { repeat: Infinity, duration: 6.2, ease: "easeInOut", delay: 2 } }}
                  className="absolute left-[calc(50%+195px)] bottom-[30px] bg-white rounded-full p-2.5 pr-8 shadow-2xl flex items-center gap-4 z-30 border border-gray-50"
                >
                  <div className="flex -space-x-4">
                    <div className="w-11 h-11 rounded-full bg-[#1FC276] border-[3px] border-white relative z-20 shadow-sm flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-white"/></div>
                    <div className="w-11 h-11 rounded-full bg-[#A855F7] border-[3px] border-white relative z-10 shadow-sm flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-white"/></div>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold text-[17px] leading-none mb-1 tracking-tight">124,89K+</h4>
                    <p className="text-gray-400 text-[11px] font-semibold">Trusted Users</p>
                  </div>
                </motion.div>

              </div>
            </div>
        </div>

        {/* Partners Section */}
        <div className="py-20 bg-white border-b border-gray-100 relative z-10 lg:mt-0 mt-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-12">Our Recent Clients & Partners</h2>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-70">
              <div className="flex items-center gap-2"><Globe className="w-8 h-8 text-blue-600"/><span className="font-bold text-xl text-gray-800 tracking-tight">Ephemeral</span></div>
              <div className="flex items-center gap-2"><Zap className="w-8 h-8 text-blue-500 fill-blue-500"/><span className="font-bold text-xl text-gray-800 tracking-tight">Wildcrafted</span></div>
              <div className="flex items-center gap-2"><Settings className="w-8 h-8 text-gray-800"/><span className="font-bold text-xl text-gray-800 tracking-tight">Codecraft_</span></div>
              <div className="flex items-center gap-2"><BarChart4 className="w-8 h-8 text-gray-700"/><span className="font-bold text-xl text-gray-800 tracking-tight">Convergence</span></div>
              <div className="flex items-center gap-2"><Smartphone className="w-8 h-8 text-blue-400"/><span className="font-bold text-xl text-gray-800 tracking-tight">ImgCompress</span></div>
              <div className="flex items-center gap-2"><div className="w-8 h-8 bg-purple-600 rotate-45 flex items-center justify-center"><div className="w-4 h-4 bg-white -rotate-45"></div></div><span className="font-bold text-xl text-gray-800 tracking-tight">Epicurious</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-8 h-8 text-gray-700"/><span className="font-bold text-xl text-gray-800 tracking-tight">Watchtower</span></div>
              <div className="flex items-center gap-2"><Building2 className="w-8 h-8 text-blue-600"/><span className="font-bold text-xl text-gray-800 tracking-tight">Renaissance</span></div>
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-indigo-600 overflow-hidden"><div className="w-4 h-10 bg-white ml-auto"></div></div><span className="font-bold text-xl text-gray-800 tracking-tight">ContrastAI</span></div>
              <div className="flex items-center gap-2"><div className="w-8 h-8 grid grid-cols-2 gap-1"><div className="bg-orange-500"></div><div className="bg-orange-400"></div><div className="bg-orange-600"></div><div className="bg-orange-500"></div></div><span className="font-bold text-xl text-gray-800 tracking-tight">Nietzsche</span></div>
            </div>
            <p className="mt-14 text-[15px] text-gray-500 font-medium">Join 4,000+ organizations already growing</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-32 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-200 bg-green-50/50 text-[#1FC276] text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-[#1FC276]"></span> Features
            </div>
            <h2 className="text-4xl md:text-[56px] leading-[1.1] font-bold text-gray-900 mb-8 tracking-tight max-w-3xl mx-auto">
              Management Reimagined for the Future You
            </h2>
            <p className="text-gray-500 text-lg md:text-xl max-w-3xl mx-auto mb-20 leading-relaxed">
              Trust us to deliver cutting-edge innovation, transparency, and personalized service, all designed to help you achieve operational freedom
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {[
                { icon: <Settings strokeWidth={1.5}/>, title: "Efficiency Meets Innovation", desc: "Customers can transition seamlessly with AI-driven validation and automated workflows." },
                { icon: <CreditCard strokeWidth={1.5}/>, title: "Comprehensive Tools", desc: "Tailored multi-level tools ensure a seamless experience for organizing management flows." },
                { icon: <Smartphone strokeWidth={1.5}/>, title: "Mobile Friendly App", desc: "Full-featured mobile application that allows users to manage their activities natively." },
                { icon: <ShieldCheck strokeWidth={1.5}/>, title: "Data-Driven Insights", desc: "Round up efforts and leverage analytics and reports automatically." },
                { icon: <BarChart4 strokeWidth={1.5}/>, title: "AI-Powered Verification", desc: "AI tools analyze spending, attendance and provide personalized forecasting." },
                { icon: <Users strokeWidth={1.5}/>, title: "Enhanced Collaboration", desc: "Generate virtual access cards instantly and communicate effortlessly." },
              ].map((f, i) => (
                  <div key={i} className="bg-[#F8FAF9] rounded-[32px] p-10 border border-[#E5E7EB] transition-all hover:border-[#1FC276]/30 hover:shadow-xl hover:shadow-[#1FC276]/5">
                    <div className="w-14 h-14 rounded-full bg-[#1FC276] text-white flex items-center justify-center mb-8 shadow-lg shadow-[#1FC276]/30">
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{f.title}</h3>
                    <p className="text-gray-500 text-[15px] leading-relaxed">{f.desc}</p>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* Limitless options section */}
        <div className="py-32 bg-white border-t border-gray-50">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-200 bg-green-50/50 text-[#1FC276] text-sm font-semibold mb-8">
                <span className="w-2 h-2 rounded-full bg-[#1FC276]"></span> Limitless collaboration options
              </div>
              <h2 className="text-4xl md:text-[56px] leading-[1.1] font-bold text-gray-900 mb-8 tracking-tight">
                One platform for 90+ NGOs worldwide.
              </h2>
              <p className="text-gray-500 text-lg md:text-xl mb-10 leading-relaxed">
                Our platform allows you to connect, validate, and convert efforts seamlessly in real-time, all while saving on manual work.
              </p>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#1FC276] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-900 font-semibold text-base">Convert efforts to verified attendance instantly.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#1FC276] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-900 font-semibold text-base">Simple and intuitive platform for managing.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#1FC276] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-900 font-semibold text-base">Manage your chapters anytime, anywhere.</p>
                </div>
              </div>

              <button className="bg-[#1FC276] hover:bg-[#19a563] text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 transition-all w-fit">
                Get Started Now <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Right side floating UI mock */}
            <div className="relative">
              <div className="bg-[#F8FAF9] rounded-[48px] p-8 pb-0 pt-16 relative overflow-hidden flex flex-col items-center border border-[#E5E7EB] min-h-[500px]">
                {/* Mock dotted map background */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#CBD5E1_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAF9] via-[#F8FAF9]/50 to-transparent"></div>
                
                <div className="w-full space-y-5 relative z-10 px-4">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="text-3xl bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center">🇺🇸</div>
                      <div><p className="text-gray-900 font-bold text-xl mb-1">USA</p><p className="text-gray-500 text-xs font-medium uppercase tracking-wider">United States</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-bold text-xl mb-1">5,780</p>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Members</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-50 flex items-center justify-between scale-105 z-10 relative">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-blue-800 text-white flex items-center justify-center text-xl shadow-md">🇪🇺</div>
                      <div><p className="text-gray-900 font-bold text-xl mb-1">EUR</p><p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Europe</p></div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-bold text-xl mb-1">3,456</p>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Chapters</p>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-3xl p-6 border border-white flex items-center justify-between backdrop-blur-sm shadow-sm relative">
                    <div className="absolute inset-0 bg-white/40 rounded-3xl backdrop-blur-md"></div>
                    <div className="relative z-10 w-full flex items-center justify-between opacity-50">
                      <div className="flex items-center gap-5">
                        <div className="text-3xl bg-gray-100 w-14 h-14 rounded-full flex items-center justify-center grayscale">🇺🇸</div>
                        <div><p className="text-gray-900 font-bold text-xl mb-1">USD</p><p className="text-gray-500 text-xs font-medium uppercase tracking-wider">United States</p></div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 font-bold text-xl mb-1">3,657</p>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section replacing old blocks */}
        <div className="py-32 bg-[#0B1511] relative overflow-hidden">
          {/* Subtle background glow to match the screenshot theme perfectly */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1FC276]/10 rounded-full blur-[180px] pointer-events-none"></div>

          <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-[#1FC276]/10 text-[#1FC276] text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-[#1FC276]"></span> Pricing Plan
            </div>
            
            <h2 className="text-4xl md:text-[52px] leading-[1.1] font-bold text-white mb-6 tracking-tight text-center max-w-3xl">
              Select a plan that will empower your organization growth
            </h2>
            <p className="text-gray-400 text-lg md:text-xl text-center max-w-2xl mx-auto mb-16 leading-relaxed">
              Each package includes personalized consultation and revisions to guarantee your satisfaction.
            </p>

            {/* Toggle */}
            <div className="bg-white/5 border border-white/10 rounded-full p-2 flex items-center gap-2 mb-16">
              <button className="bg-[#1FC276] text-white px-8 py-2.5 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-[#1FC276]/20">Monthly</button>
              <button className="text-gray-400 hover:text-white px-8 py-2.5 rounded-full font-bold text-sm tracking-wide transition-colors">Yearly</button>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Starter Plan */}
              <div className="bg-white/[0.03] rounded-[32px] p-8 border border-white/10 relative overflow-hidden group hover:border-[#1FC276]/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1FC276]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <h3 className="text-white text-2xl font-bold mb-2">Starter Plan</h3>
                  <p className="text-gray-400 text-sm mb-6 min-h-[40px]">Perfect for basic outreach needs & small orgs</p>
                  <div className="flex items-end gap-1 mb-8">
                     <span className="text-white text-5xl font-bold">$0</span>
                     <span className="text-gray-500 text-sm pb-1.5">/ per month</span>
                  </div>
                  <div className="bg-white/[0.03] rounded-2xl p-6 mb-8 border border-white/5 space-y-4">
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Volunteer Aggregation</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Expense Tracking</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Basic Analytics System</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Budgeting Tools</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> 24/7 Customer Support</div>
                  </div>
                  <button className="w-full py-4 rounded-full font-bold text-white bg-[#1FC276] hover:bg-[#1ab06a] transition-colors tracking-wide text-sm shadow-[0_10px_20px_rgba(31,194,118,0.2)]">Select This Plan</button>
                </div>
              </div>

              {/* Growth Plan */}
              <div className="bg-white/[0.03] rounded-[32px] p-8 border border-white/10 relative overflow-hidden group hover:border-[#1FC276]/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1FC276]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <h3 className="text-white text-2xl font-bold mb-2">Growth Plan</h3>
                  <p className="text-gray-400 text-sm mb-6 min-h-[40px]">Ideal for growing NGOs and mid-sized networks</p>
                  <div className="flex items-end gap-1 mb-8">
                     <span className="text-white text-5xl font-bold">$49</span>
                     <span className="text-gray-500 text-sm pb-1.5">/ per month</span>
                  </div>
                  <div className="bg-white/[0.03] rounded-2xl p-6 mb-8 border border-white/5 space-y-4">
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Everything in Starter Plan</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Advanced Budgeting Tools</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Customizable Dashboards</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Transaction Insights</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Enhanced Security</div>
                  </div>
                  <button className="w-full py-4 rounded-full font-bold text-white bg-[#1FC276] hover:bg-[#1ab06a] transition-colors tracking-wide text-sm shadow-[0_10px_20px_rgba(31,194,118,0.2)]">Select This Plan</button>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white/[0.03] rounded-[32px] p-8 border border-white/10 relative overflow-hidden group hover:border-[#1FC276]/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1FC276]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <h3 className="text-white text-2xl font-bold mb-2">Enterprise Plan</h3>
                  <p className="text-gray-400 text-sm mb-6 min-h-[40px]">Perfect for larger organizations with advanced needs</p>
                  <div className="flex items-end gap-1 mb-8">
                     <span className="text-white text-5xl font-bold">$99</span>
                     <span className="text-gray-500 text-sm pb-1.5">/ per month</span>
                  </div>
                  <div className="bg-white/[0.03] rounded-2xl p-6 mb-8 border border-white/5 space-y-4">
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Everything in Growth Plan</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Investment Tracking</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Integration Services</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> 24/7 VIP Support</div>
                     <div className="flex gap-3 text-[15px] font-medium text-gray-300"><CheckCircle2 className="w-5 h-5 text-[#1FC276] shrink-0"/> Premium Security</div>
                  </div>
                  <button className="w-full py-4 rounded-full font-bold text-white bg-[#1FC276] hover:bg-[#1ab06a] transition-colors tracking-wide text-sm shadow-[0_10px_20px_rgba(31,194,118,0.2)]">Select This Plan</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bottom blocks */}
        <div className="py-16 bg-white pb-64">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[#F8FAF9] p-8 rounded-[32px] text-center border border-[#E5E7EB] flex flex-col justify-center min-h-[220px]">
              <h3 className="text-[40px] font-bold text-gray-900 mb-3">234 M</h3>
              <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-widest leading-relaxed">System log millions processed fastly</p>
            </div>
            <div className="bg-[#1FC276] p-8 rounded-[32px] text-center flex flex-col justify-center shadow-xl shadow-green-200/50 min-h-[220px] relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 top-[60%] bg-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
              <h3 className="text-[40px] font-bold text-white mb-3 relative z-10">768 K</h3>
              <p className="text-white/90 text-[11px] font-semibold uppercase tracking-widest leading-relaxed relative z-10">Company data post surge rapidly</p>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-[#1aa462] rounded-full"></div>
            </div>
            <div className="bg-[#F8FAF9] p-8 rounded-[32px] text-center border border-[#E5E7EB] flex flex-col justify-center min-h-[220px]">
              <h3 className="text-[40px] font-bold text-gray-900 mb-3">5.0 ★</h3>
              <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-widest leading-relaxed">High rating from satisfied users</p>
            </div>
            <div className="bg-[#F8FAF9] p-8 rounded-[32px] text-center border border-[#E5E7EB] flex flex-col justify-center min-h-[220px]">
              <h3 className="text-[40px] font-bold text-gray-900 mb-3">99.9%</h3>
              <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-widest leading-relaxed">Global successfully validated attendance</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-b from-white to-[#0f1d17]">
          <div className="max-w-[1000px] mx-auto px-6 relative z-20 -mt-40 mb-[-120px]">
            <div className="bg-[#15271F] rounded-[48px] p-12 md:p-24 text-center shadow-2xl relative overflow-hidden">
              {/* Background glow and grain */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#1FC276]/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-3">
                   <div className="flex gap-1 text-[#FBBF24]">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                   </div>
                   <span className="text-gray-300 ml-1 font-medium text-sm">4.9/5</span>
                </div>
                
                <div className="flex items-center -space-x-3 mb-6 mt-4">
                   <div className="w-12 h-12 rounded-full border-4 border-[#15271F] bg-[#4ade80] flex items-center justify-center overflow-hidden"></div>
                   <div className="w-12 h-12 rounded-full border-4 border-[#15271F] bg-[#a855f7] flex items-center justify-center overflow-hidden"></div>
                   <div className="w-12 h-12 rounded-full border-4 border-[#15271F] bg-[#facc15] flex items-center justify-center overflow-hidden"></div>
                   <div className="w-12 h-12 rounded-full border-4 border-[#15271F] bg-[#f97316] flex items-center justify-center overflow-hidden"></div>
                   <div className="w-12 h-12 rounded-full border-4 border-[#15271F] bg-white flex items-center justify-center text-black text-[10px] font-bold z-10 shadow-sm">100K+</div>
                </div>
                <p className="text-gray-400 text-sm mb-12 max-w-sm">Over 100K+ Organizations and business choose us</p>

                <h2 className="text-4xl md:text-[56px] font-bold text-white mb-6 tracking-tight leading-[1.1] max-w-3xl">
                  Empowering Your Financial Freedom
                </h2>
                <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                  Trust us to deliver cutting-edge innovation, transparency, and personalized service, all designed to help you achieve operational freedom.
                </p>

                <button className="bg-[#1FC276] hover:bg-[#19a563] text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 transition-all">
                   Get Started now <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#0f1d17] pt-[200px] pb-10 px-6 font-sans">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
              <div className="lg:col-span-4 pr-8">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 rounded-md bg-[#1FC276] flex items-center justify-center">
                     <Globe className="w-5 h-5 text-white" />
                   </div>
                   <span className="text-2xl font-bold tracking-tight text-white">NGO-Connect</span>
                </div>
                <p className="text-sm text-gray-400 mb-8 max-w-xs leading-relaxed">
                  Empowering Your Projects, Enhancing Your Success, Every Step of the Way.
                </p>
                <div className="flex gap-3">
                   <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1FC276] hover:text-white text-gray-400 transition-colors">
                      <Facebook className="w-4 h-4"/>
                   </a>
                   <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1FC276] hover:text-white text-gray-400 transition-colors">
                      <Linkedin className="w-4 h-4"/>
                   </a>
                   <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1FC276] hover:text-white text-gray-400 transition-colors">
                      <Instagram className="w-4 h-4"/>
                   </a>
                   <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1FC276] hover:text-white text-gray-400 transition-colors">
                      <Twitter className="w-4 h-4"/>
                   </a>
                </div>
              </div>

              <div className="lg:col-span-2">
                <h4 className="text-white font-bold text-[15px] mb-6">Home</h4>
                <ul className="space-y-4 text-sm text-gray-400 font-medium">
                   <li><a href="#" className="hover:text-white transition-colors">Product Features</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Benefits</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">How To Use</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Key Features</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Testimonials</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">FAQ's</a></li>
                </ul>
              </div>
              
              <div className="lg:col-span-2">
                 <h4 className="text-white font-bold text-[15px] mb-6">App</h4>
                <ul className="space-y-4 text-sm text-gray-400 font-medium">
                   <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Desktop App</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">How To Use</a></li>
                </ul>
              </div>

              <div className="lg:col-span-2">
                 <h4 className="text-white font-bold text-[15px] mb-6">All Pages</h4>
                <ul className="space-y-4 text-sm text-gray-400 font-medium">
                   <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">App</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Blogs</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Blog Open</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                   <li><a href="#" className="hover:text-white transition-colors">404</a></li>
                </ul>
              </div>

              <div className="lg:col-span-2 border border-white/10 rounded-2xl p-6 bg-[#17251f]/50">
                 <p className="text-white font-semibold mb-5 text-[15px]">Download our App</p>
                 <button className="w-full bg-[#1b2b24] hover:bg-[#23352d] border border-white/5 rounded-xl p-3 flex items-center justify-center gap-3 mb-3 transition-colors text-white text-left">
                    <Play className="w-6 h-6 shrink-0"/>
                    <div>
                       <p className="text-[10px] text-gray-400 leading-tight">Get It On</p>
                       <p className="text-sm font-semibold leading-tight">Google Play</p>
                    </div>
                 </button>
                 <button className="w-full bg-[#1b2b24] hover:bg-[#23352d] border border-white/5 rounded-xl p-3 flex items-center justify-center gap-3 transition-colors text-white text-left">
                    <Apple className="w-6 h-6 shrink-0"/>
                    <div>
                       <p className="text-[10px] text-gray-400 leading-tight">Download on the</p>
                       <p className="text-sm font-semibold leading-tight">App Store</p>
                    </div>
                 </button>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium font-sans">
               <p>© 2024 NGO-Connect. All rights reserved.</p>
               <div className="flex gap-8">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Services</a>
               </div>
            </div>
          </div>
        </footer>
    </div>
  )
}

