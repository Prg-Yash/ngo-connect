import { Button } from "@/components/ui/button";
import { Globe, Mail, MapPin, Phone, Users } from "lucide-react";
import React from "react";

const NGODetails = ({ ngo, ngoId }) => {
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 text-gray-500">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>{ngo.displayType || ngo.type || "General"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>
            {ngo.location?.address || ngo.address || "Location not specified"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>{ngo.email || "Email not available"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-5 w-5" />
          <span>{ngo.phone || "Phone not available"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>{ngo.memberCount || 0} members</span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">About Us</h3>
          <p className="text-gray-700">
            {ngo.description || "No description available."}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
          <p className="text-gray-700">
            {ngo.mission || "Mission statement not available."}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Vision</h3>
          <p className="text-gray-700">
            {ngo.vision || "Vision statement not available."}
          </p>
        </div>
      </div>

      <div className="mt-8 flex space-x-4">
        <Button variant="outline" asChild>
          <a href={`/contact/${ngoId}`}>Contact Us</a>
        </Button>
      </div>
    </div>
  );
};

export default NGODetails;
