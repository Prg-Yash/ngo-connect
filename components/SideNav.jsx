"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FilePenLine,
  CalendarDays,
  Users,
  IndianRupee,
  BadgeIndianRupee,
  Store,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Globe,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { TranslationModal } from "@/components/TranslationModal";
import { useLanguage } from "@/context/LanguageContext";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function SideNav({ isOpen, setIsOpen, navConfig, type }) {
  const [isMobile, setIsMobile] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const pathname = usePathname();
  const navRefs = useRef({});
  const router = useRouter();
  const { language, translations } = useLanguage();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Listen for the startSidebarTour event dispatched after dashboard tour ends
  useEffect(() => {
    const handleStartSidebarTour = (event) => {
      if (!event.detail?.startTour) return;
      setIsOpen(true);
      setTimeout(() => {
        const driverObj = driver({
          showProgress: true,
          animate: true,
          smoothScroll: true,
          nextBtnText: "Next →",
          prevBtnText: "← Back",
          doneBtnText: "Finish",
          onDestroyStarted: () => driverObj.destroy(),
          steps: [
            {
              element: ".nav-container",
              popover: {
                title: "🧭 Sidebar Navigation",
                description: "This sidebar gives you easy access to all features of your NGO management system.",
                side: "right",
              },
            },
            {
              element: "#nav-dashboard",
              popover: {
                title: "🏠 Dashboard",
                description: "Your main overview — metrics, quick actions, and recent activity.",
                side: "right",
              },
            },
            {
              element: ".management-nav-section",
              popover: {
                title: "⚙️ Management",
                description: "Manage activities, members, campaigns and more from here.",
                side: "right",
              },
            },
            {
              element: ".finance-nav-section",
              popover: {
                title: "💰 Finance",
                description: "Track all donations and financial records for your NGO.",
                side: "right",
              },
            },
            {
              element: ".product-nav-section",
              popover: {
                title: "📦 Products & Inventory",
                description: "Manage your NGO's products and inventory supplies.",
                side: "right",
              },
            },
            {
              element: "#translate-button",
              popover: {
                title: "🌐 Translate",
                description: "Click here to change the platform language.",
                side: "right",
              },
            },
            {
              element: "#logout-button",
              popover: {
                title: "🚪 Logout",
                description: "Click here to safely log out of your account.",
                side: "right",
              },
            },
          ],
        });
        driverObj.drive();
      }, 500);
    };
    window.addEventListener("startSidebarTour", handleStartSidebarTour);
    return () => window.removeEventListener("startSidebarTour", handleStartSidebarTour);
  }, [setIsOpen]);

  const toggleSideNav = () => setIsOpen(!isOpen);

  const signOutHandler = () => {
    signOut(auth).then(() => {
      router.push("/login");
    });
  };

  // Helper function to translate nav item names
  const translateNavItem = (name) => {
    const key = name.toLowerCase().replace(/\s+/g, '_');
    return translations[key] || name;
  };

  const renderNavItems = (items, sectionClass) => (
    <ul className={`space-y-2 ${sectionClass}`}>
      {items?.map((item) => {
        const navId = `nav-${item.name.toLowerCase()}`;
        return (
          <li key={item.name} className="relative mb-1">
            {pathname === item.href && (
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#1FC276] rounded-r-full shadow-sm" />
            )}
            <Link
              href={item.href}
              id={navId}
              className={cn(
                "flex items-center rounded-xl h-[48px] px-4 font-medium transition-all duration-300",
                pathname === item.href
                  ? "text-[#1FC276] font-bold bg-[#1FC276]/10"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                !isOpen && "justify-center"
              )}
              onClick={() => {
                if (isMobile) setIsOpen(false);
              }}
              ref={(el) => {
                navRefs.current[navId] = el;
              }}
            >
              <item.icon className="h-5 w-5" />
              {isOpen && <span className="ml-3">{translateNavItem(item.name)}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <motion.nav
        className={cn(
          "nav-container fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300",
          isOpen ? "w-64" : isMobile ? "w-0" : "w-20"
        )}
        initial={false}
        animate={{ width: isOpen ? 256 : isMobile ? 0 : 64 }}
      >
        <div className="flex h-full flex-col p-4">
          <div
            className={cn(
              "mb-8 flex items-center",
              isOpen ? "justify-between" : "justify-center"
            )}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-full w-full object-contain filter"
                />
              </div>
              {isOpen && (
                <span className="ml-3 text-[22px] font-bold text-gray-900 tracking-tight">
                  {translations.ngo_connect || "NGO-Connect"}
                </span>
              )}
            </div>
            {isMobile && isOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSideNav}
                className="md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="main-nav-section mt-4">
              {isOpen && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">Main Menu</p>}
              {renderNavItems(navConfig.mainNavItems, "main-nav-items")}
            </div>

            {type === "ngo" && isOpen && (
              <div className="my-5" />
            )}

            {type === "ngo" && (
              <div className="management-nav-section">
                {isOpen && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2 mt-4">Management</p>}
                {renderNavItems(
                  navConfig.managementNavItems,
                  "management-nav-items"
                )}
              </div>
            )}

            {type === "ngo" && isOpen && (
              <div className="my-3" />
            )}

            {type === "ngo" && (
              <div className="finance-nav-section">
                 {isOpen && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2 mt-2">Finance</p>}
                {renderNavItems(navConfig.financeNavItems, "finance-nav-items")}
              </div>
            )}

            {type === "ngo" && isOpen && (
              <div className="my-3" />
            )}

            {type === "ngo" && (
              <div className="product-nav-section">
                  {isOpen && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2 mt-2">Products</p>}
                {renderNavItems(navConfig.ProductNavItems, "product-nav-items")}
              </div>
            )}
          </div>



          <div className="mt-auto bottom-nav-section pt-4 border-t border-gray-100">
            {isOpen && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">General</p>}
            {renderNavItems(navConfig.bottomNavItems, "bottom-nav-items")}
            
            {/* Translate Button */}
            <button
              id="translate-button"
              className={cn(
                "flex items-center rounded-xl h-[48px] px-4 text-gray-500 font-medium transition-all duration-300 w-full mb-1",
                "hover:bg-gray-50 hover:text-gray-900",
                !isOpen && "justify-center"
              )}
              variant="none"
              onClick={() => setShowTranslationModal(true)}
            >
              <Globe className="h-5 w-5" />
              {isOpen && <span className="ml-3">{translations.translate || "Translate"}</span>}
            </button>

            <button
              id="logout-button"
              className={cn(
                "flex relative items-center rounded-xl h-[48px] px-4 font-medium transition-all duration-300 w-full mb-1",
                pathname === "/logout"
                  ? "text-red-600 bg-red-50"
                  : "text-gray-500 hover:bg-red-50 hover:text-red-500",
                !isOpen && "justify-center"
              )}
              variant="none"
              onClick={signOutHandler}
            >
              <LogOut className="h-5 w-5" />
              {isOpen && <span className="ml-3">{translations.logout || "Logout"}</span>}
            </button>

            <button
              id="toggle-nav-button"
              className={cn(
                "flex mt-2 items-center rounded-xl h-[48px] px-4 text-gray-500 font-medium transition-all duration-300 w-full hover:bg-gray-50 hover:text-gray-900",
                !isOpen && "justify-center"
              )}
              variant="none"
              onClick={toggleSideNav}
            >
              {isOpen ? (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="ml-3">{translations.collapse || "Collapse"}</span>
                </>
              ) : (
                <>
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Translation Modal */}
      <TranslationModal 
        isOpen={showTranslationModal} 
        onClose={() => setShowTranslationModal(false)} 
      />

    </>
  );
}