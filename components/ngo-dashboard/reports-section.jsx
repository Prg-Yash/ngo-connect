import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext"; // Import language context
import { TranslationModal } from "@/components/TranslationModal";
import { useState } from "react";

export function ReportsSection() {
  const router = useRouter();
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const { translations } = useLanguage();
  const redirectToReports = () => {
    // Redirect to the reports page
    router.push("/dashboard/ngo/reports");
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.reports || "Reports"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full h-12 justify-start bg-white transition-colors duration-200 flex items-center gap-3 rounded-full border border-gray-100 p-4 text-gray-700 hover:bg-[#e6f4ea] hover:text-[#15653b] hover:border-[#15653b]/20 group shadow-sm"
          variant="outline"
          onClick={redirectToReports}
        >
          <BarChart className="h-5 w-5 text-[#15653b] group-hover:text-[#15653b]" />
          <span className="font-medium text-sm">{translations.view_activities_analytics || "View Activities Analytics"}</span>
        </Button>
      </CardContent>
      {/* Translation Modal */}
      <TranslationModal 
        isOpen={showTranslationModal} 
        onClose={() => setShowTranslationModal(false)} 
      />
    </Card>
  );
}
