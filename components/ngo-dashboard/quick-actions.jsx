"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCheck, DollarSign, Award, Globe } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext"; // Import language context
import { useState } from "react";
import { TranslationModal } from "@/components/TranslationModal"; // Import TranslationModal

export function QuickActions() {
  const { translations } = useLanguage(); // Use language context
  const [showTranslationModal, setShowTranslationModal] = useState(false);

  // Define actions with translations
  const actions = [
    {
      label: translations.create_event || "Create Event",
      icon: PlusCircle,
      href: "/dashboard/ngo/activities/new",
    },
    { 
      label: translations.add_members || "Add Members", 
      icon: UserCheck, 
      href: "/dashboard/ngo/members" 
    },
    {
      label: translations.view_donations || "View our Donations",
      icon: DollarSign,
      href: "/dashboard/ngo/donations/",
    },
    { 
      label: translations.view_reports || "View Reports", 
      icon: Award, 
      href: "/dashboard/ngo/reports" 
    },
  ];

  // Toggle translation modal
  const toggleTranslationModal = () => {
    setShowTranslationModal(!showTranslationModal);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{translations.quick_actions || "Quick Actions"}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {actions.map((action, index) => (
          <Link
            key={index}
            variant="outline"
            className="w-full h-12 justify-start bg-white transition-colors duration-200 flex items-center gap-3 rounded-full border border-gray-100 p-4 text-gray-700 hover:bg-[#e6f4ea] hover:text-[#15653b] hover:border-[#15653b]/20 group shadow-sm"
            href={action.href}
          >
            <action.icon className="h-5 w-5 text-[#15653b] group-hover:text-[#15653b]" />
            <span className="font-medium text-sm">{action.label}</span>
          </Link>
        ))}
      </CardContent>
      
      {/* Translation Modal */}
      <TranslationModal 
        isOpen={showTranslationModal} 
        onClose={() => setShowTranslationModal(false)} 
      />
    </Card>
  );
}