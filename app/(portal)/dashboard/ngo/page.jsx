"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { MetricsOverview } from "@/components/ngo-dashboard/metrics-overview";
import { QuickActions } from "@/components/ngo-dashboard/quick-actions";
import { RecentActivities } from "@/components/ngo-dashboard/recent-activities";
import { ReportsSection } from "@/components/ngo-dashboard/reports-section";
import { HelpCircle, Globe } from "lucide-react"; // Added Globe icon for translation
import { Button } from "@/components/ui/button"; // Import Button component
import { useLanguage } from "@/context/LanguageContext";
import { TranslationModal } from "@/components/TranslationModal";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function DashboardPage() {
  const [ngoName, setNgoName] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);
  const { language, translations } = useLanguage();

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: "rgba(0,0,0,0.5)",
      smoothScroll: true,
      nextBtnText: translations.next || "Next →",
      prevBtnText: translations.back || "← Back",
      doneBtnText: translations.finish || "Finish",
      onDestroyStarted: () => {
        setShowRestartButton(true);
        driverObj.destroy();
        // Chain into sidebar tour
        window.dispatchEvent(new CustomEvent("startSidebarTour", { detail: { startTour: true } }));
      },
      steps: [
        {
          element: "#dashboard-title",
          popover: {
            title: "👋 Welcome!",
            description: translations.dashboard_tour_welcome || "Welcome to your NGO dashboard! This is your central hub for managing all NGO activities.",
            side: "bottom",
          },
        },
        {
          element: "#metrics-overview",
          popover: {
            title: "📊 Metrics",
            description: translations.dashboard_tour_metrics || "Track your donations, beneficiaries reached, and other key performance metrics.",
            side: "top",
          },
        },
        {
          element: "#quick-actions",
          popover: {
            title: "⚡ Quick Actions",
            description: translations.dashboard_tour_actions || "Perform key tasks faster — create campaigns, register beneficiaries, and more.",
            side: "bottom",
          },
        },
        {
          element: "#recent-activities",
          popover: {
            title: "📋 Recent Activities",
            description: translations.dashboard_tour_activities || "See all your recent activities and updates here.",
            side: "bottom",
          },
        },
        {
          element: "#reports-section",
          popover: {
            title: "📈 Reports",
            description: translations.dashboard_tour_reports || "Generate and analyze reports for your NGO's performance and track your impact over time.",
            side: "top",
          },
        },
      ],
    });
    driverObj.drive();
  };

  useEffect(() => {
    const fetchNgoName = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          setError("User not found");
          setLoading(false);
          return;
        }
        const ngoId = userDoc.data().ngoId;
        if (!ngoId) {
          setError("No NGO associated with this user");
          setLoading(false);
          return;
        }
        const ngoDocRef = doc(db, "ngo", ngoId);
        const ngoDoc = await getDoc(ngoDocRef);
        if (!ngoDoc.exists()) {
          setError("NGO not found");
          setLoading(false);
          return;
        }
        setNgoName(ngoDoc.data().ngoName || "Unnamed NGO");
        setLoading(false);

        const hasSeenTour = localStorage.getItem("hasSeenDashboardTour");
        if (!hasSeenTour) {
          localStorage.setItem("hasSeenDashboardTour", "true");
          setTimeout(() => startTour(), 1000);
        } else {
          setShowRestartButton(true);
        }
      } catch (err) {
        console.error("Error fetching NGO name:", err);
        setError("Failed to load NGO information");
        setLoading(false);
      }
    };
    fetchNgoName();
  }, []);

  // Loading state with translations
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
            role="status"
          >
            <span className="sr-only">{translations.loading || "Loading..."}</span>
          </div>
          <p className="mt-2 text-gray-600">
            {translations.loading_dashboard || "Loading your dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto relative"
    >
      <div className="flex justify-between items-center mb-8">
          <h1 id="dashboard-title" className="text-3xl font-bold md:text-4xl">
            {error
              ? translations.ngo_dashboard || "NGO Dashboard"
              : ` ${translations.ngo_dashboard || "NGO Dashboard | "}  Hey ${ngoName}!`}
          </h1>
          {showRestartButton && (
            <button
              onClick={() => { setShowRestartButton(false); startTour(); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1CAC78] text-white rounded-full text-sm font-medium shadow hover:bg-[#18a06e] transition-colors animate-pulse"
            >
              <HelpCircle size={16} />
              {translations.restart_guide_tour || "Guide Tour"}
            </button>
          )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          id="metrics-overview"
          className="col-span-full sm:col-span-2 lg:col-span-4"
        >
          <MetricsOverview type="Donations" />
        </div>
        <div id="quick-actions" className="sm:col-span-1 lg:col-span-2">
          <QuickActions />
        </div>
        <div id="recent-activities" className="sm:col-span-1 lg:col-span-2">
          <RecentActivities />
        </div>
        <div
          id="reports-section"
          className="col-span-full sm:col-span-2 lg:col-span-4"
        >
          <ReportsSection />
        </div>
      </div>

      {/* Translation Modal */}
      <TranslationModal 
        isOpen={showTranslationModal} 
        onClose={() => setShowTranslationModal(false)} 
      />
    </motion.div>
  );
}