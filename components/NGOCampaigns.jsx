"use client";

import { useEffect, useState } from "react";
import { getCampaignsByNgo } from "@/lib/campaign";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, Target } from "lucide-react";

export default function NGOCampaigns({ ngoId }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      if (!ngoId) return;
      try {
        const fetchedCampaigns = await getCampaignsByNgo(ngoId);
        setCampaigns(fetchedCampaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCampaigns();
  }, [ngoId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-medium">No Campaigns Found</h3>
        <p className="text-muted-foreground">This NGO hasn't organized any fund-raising campaigns yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="overflow-hidden">
          {campaign.image && (
            <div className="w-full h-48 bg-muted relative">
              <img 
                src={campaign.image} 
                alt={campaign.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle>{campaign.name}</CardTitle>
            <CardDescription className="line-clamp-2">{campaign.shortdesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  {campaign.date ? new Date(campaign.date).toLocaleDateString() : "TBD"}
                </span>
              </div>
              {campaign.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="truncate">{campaign.location}</span>
                </div>
              )}
              {campaign.volunteers > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{campaign.volunteers} Volunteers</span>
                </div>
              )}
              {campaign.requiredAmount > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <span className="text-primary font-bold">₹</span>
                  <span>{campaign.requiredAmount.toLocaleString()} Goal</span>
                </div>
              )}
            </div>
            
            <div className="bg-muted p-4 rounded-lg text-sm italic">
              "{campaign.mission}"
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
