"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  Compass,
  LocateFixed,
  Navigation,
  Sparkles,
  Mail,
  Users,
  Phone,
  ArrowRight,
  Star,
  SortDesc,
  Search,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import LandingHeader from "@/components/landing/LandingHeader";

// Dynamically import Leaflet Map component
const Map = dynamic(() => import("@/components/map/Map"), { ssr: false });

const NGOListPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyNGOs, setNearbyNGOs] = useState([]);
  const [allNGOs, setAllNGOs] = useState([]);
  const [filteredNGOs, setFilteredNGOs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [sortByRating, setSortByRating] = useState(false);

  const getNgoId = (ngo) => ngo.id || ngo.ngo_id;
  const getNgoName = (ngo) => ngo.ngoName || ngo.name || "NGO";
  const getNgoPhone = (ngo) => ngo.phone || ngo.contact || "Not available";
  const getNgoEmail = (ngo) => ngo.email || "No email provided";

  const getNgoLocation = (ngo) => {
    const location = ngo.location || ngo.address;
    if (!location) return "Location not available";

    if (typeof location === "string") {
      return location;
    }

    if (typeof location === "object") {
      if (location.address) return location.address;
      if (location.latitude && location.longitude) {
        return `${location.latitude}, ${location.longitude}`;
      }
    }

    return "Location not available";
  };

  // Function to sort NGOs by rating
  const sortNGOs = (ngos) => {
    if (sortByRating) {
      return [...ngos].sort((a, b) => (b.ngoRating || 0) - (a.ngoRating || 0));
    }
    return ngos;
  };

  // Function to filter NGOs based on search term
  const filterNGOs = (ngos, term) => {
    if (!term) return ngos;
    return ngos.filter(
      (ngo) =>
        ngo.ngoName?.toLowerCase().includes(term.toLowerCase()) ||
        ngo.description?.toLowerCase().includes(term.toLowerCase()) ||
        ngo.category?.toLowerCase().includes(term.toLowerCase())
    );
  };

  // Update filtered NGOs when search term changes
  useEffect(() => {
    const currentNGOs = activeTab === "all" ? allNGOs : nearbyNGOs;
    setFilteredNGOs(filterNGOs(currentNGOs, searchTerm));
  }, [searchTerm, allNGOs, nearbyNGOs, activeTab]);

  // Function to fetch all NGOs
  const fetchAllNGOs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "ngo"));
      const ngosData = [];
      querySnapshot.forEach((doc) => {
        const ngoData = doc.data();
        ngoData.id = doc.id;
        ngosData.push(ngoData);
      });
      setAllNGOs(ngosData);
      setIsLoadingAll(false);
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      setIsLoadingAll(false);
    }
  };

  // Helper to calculate distance between two coordinates in km using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Function to fetch nearby NGOs locally
  const fetchNearbyNGOs = async (latitude, longitude) => {
    try {
      const querySnapshot = await getDocs(collection(db, "ngo"));
      const ngosWithDistance = [];
      
      querySnapshot.forEach((doc) => {
        const ngoData = doc.data();
        ngoData.id = doc.id;
        
        let ngoLat, ngoLon;
        // Check for location coordinates
        if (ngoData.location && typeof ngoData.location === 'object') {
          if (ngoData.location.latitude !== undefined && ngoData.location.longitude !== undefined) {
            ngoLat = parseFloat(ngoData.location.latitude);
            ngoLon = parseFloat(ngoData.location.longitude);
          } else if (ngoData.location.lat !== undefined && ngoData.location.lng !== undefined) {
            ngoLat = parseFloat(ngoData.location.lat);
            ngoLon = parseFloat(ngoData.location.lng);
          }
        }
        
        if (ngoLat !== undefined && ngoLon !== undefined && !isNaN(ngoLat) && !isNaN(ngoLon)) {
          const distance = calculateDistance(latitude, longitude, ngoLat, ngoLon);
          if (distance <= 50) { // 50km radius
            ngoData.distance = distance;
            ngosWithDistance.push(ngoData);
          }
        }
      });

      // Sort NGOs by distance
      const sortedNGOs = ngosWithDistance.sort((a, b) => a.distance - b.distance);
      setNearbyNGOs(sortedNGOs);
      return sortedNGOs;
    } catch (error) {
      console.error("Error calculating nearby NGOs:", error);
      setNearbyNGOs([]);
      return [];
    }
  };

  // Function to get user's location and fetch nearby NGOs
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(newLocation);
        setIsLoadingLocation(false);
        setLocationError(null);

        // Fetch nearby NGOs when location is obtained
        await fetchNearbyNGOs(newLocation.latitude, newLocation.longitude);
      },
      (error) => {
        console.log("Geolocation error:", error);
        let errorMessage = "Unable to get your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Please enable location services to see nearby NGOs.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
          default:
            errorMessage += error.message;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Get location and fetch all NGOs when component mounts
  useEffect(() => {
    fetchAllNGOs();
    getLocation();
  }, []);

  const sortedFilteredNGOs = sortNGOs(filteredNGOs);

  const renderNGOCard = (ngo) => (
    <Card
      key={getNgoId(ngo)}
      className="overflow-hidden border border-white/10 bg-white shadow-[0_20px_45px_rgba(10,18,13,0.08)] hover:shadow-[0_24px_50px_rgba(31,194,118,0.2)] transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={ngo.logoUrl || "/placeholder.svg"}
          alt={getNgoName(ngo)}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {ngo.category && (
            <Badge className="bg-white/90 text-gray-900 border-0">{ngo.category}</Badge>
          )}
          {ngo.distance && (
            <Badge className="bg-[#1FC276] text-white border-0">
              {ngo.distance.toFixed(1)} km
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{getNgoName(ngo)}</h3>
          <div className="inline-flex items-center text-sm text-emerald-700 font-semibold whitespace-nowrap">
            <Star className="h-4 w-4 mr-1" />
            {ngo.ngoRating ? ngo.ngoRating.toFixed(1) : "New"}
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {ngo.description || "Verified organization driving social impact through focused initiatives."}
        </p>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-[#1FC276]" />
            <span className="truncate">{getNgoPhone(ngo)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#1FC276]" />
            <span className="truncate">{getNgoEmail(ngo)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#1FC276]" />
            <span className="truncate">{getNgoLocation(ngo)}</span>
          </div>
          {ngo.memberCount ? (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#1FC276]" />
              <span>{ngo.memberCount} members</span>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Link
            href={`/ngo/${getNgoId(ngo)}`}
            className="inline-flex items-center text-sm font-semibold text-[#1a8d57] hover:text-[#147347]"
          >
            View Details <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
          <Image
            src="/assets/logo/square-logo.png"
            alt="ngo-connect"
            width={26}
            height={26}
            className="opacity-80"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#f2f5f3]">
      <section className="relative overflow-hidden bg-[#0d1612] text-white border-b border-gray-900">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:24px_24px]" />
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[760px] h-[760px] bg-[#1FC276]/25 rounded-full blur-[180px]" />
        <LandingHeader />
        <div className="relative container mx-auto px-4 pt-10 pb-20">
          <div className="max-w-3xl">
            <Badge className="mb-5 bg-white/10 text-white border border-white/20">
              Verified Network
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Discover NGOs doing real impact work.
            </h1>
            <p className="mt-5 text-white/80 text-lg max-w-2xl">
              Explore trusted organizations, view nearby opportunities, and donate with confidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setActiveTab("all")}
                className="bg-[#1FC276] hover:bg-[#19a563] text-white"
              >
                Browse All <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActiveTab("nearby");
                  if (!userLocation) getLocation();
                }}
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <LocateFixed className="h-4 w-4 mr-1" /> Use My Location
              </Button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <p className="text-xs text-white/70 uppercase tracking-wider">Total NGOs</p>
              <p className="text-2xl font-bold mt-1">{allNGOs.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <p className="text-xs text-white/70 uppercase tracking-wider">Nearby</p>
              <p className="text-2xl font-bold mt-1">{nearbyNGOs.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <p className="text-xs text-white/70 uppercase tracking-wider">View Mode</p>
              <p className="text-2xl font-bold mt-1">{activeTab === "all" ? "All" : "Nearby"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <Card className="border border-gray-200 shadow-sm mb-8">
          <CardContent className="p-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search NGOs by name, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="inline-flex rounded-xl bg-gray-100 p-1 w-fit">
                <Button
                  size="sm"
                  onClick={() => setActiveTab("all")}
                  className={
                    activeTab === "all"
                      ? "bg-white text-gray-900 shadow-sm hover:bg-white"
                      : "bg-transparent text-gray-600 hover:text-gray-900"
                  }
                >
                  All NGOs
                </Button>
                <Button
                  size="sm"
                  onClick={() => setActiveTab("nearby")}
                  className={
                    activeTab === "nearby"
                      ? "bg-white text-gray-900 shadow-sm hover:bg-white"
                      : "bg-transparent text-gray-600 hover:text-gray-900"
                  }
                >
                  Nearby NGOs
                </Button>
              </div>

              <Button
                variant={sortByRating ? "default" : "outline"}
                onClick={() => setSortByRating(!sortByRating)}
                className={sortByRating ? "bg-[#1FC276] hover:bg-[#19a563]" : ""}
              >
                <SortDesc className="h-4 w-4 mr-2" />
                {sortByRating ? "Sorted by Rating" : "Sort by Rating"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeTab === "all" ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                All NGOs {sortByRating && "- Sorted by Rating"}
              </h3>
            </CardHeader>
            <CardContent className="p-5">
              {isLoadingAll ? (
                <div className="flex items-center justify-center py-12">
                  <Sparkles className="h-8 w-8 text-[#1FC276] animate-spin" />
                  <span className="ml-2 text-gray-600">Loading NGOs...</span>
                </div>
              ) : sortedFilteredNGOs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sortedFilteredNGOs.map((ngo) => renderNGOCard(ngo))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {searchTerm ? "No NGOs match your search" : "No NGOs found"}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Nearby NGOs {sortByRating && "- Sorted by Rating"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {sortedFilteredNGOs.length} NGOs found nearby
                      </p>
                    </div>
                    {locationError && (
                      <Button onClick={getLocation} className="bg-[#1FC276] hover:bg-[#19a563]">
                        <Navigation className="h-4 w-4 mr-2" />
                        Enable Location
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  {isLoadingLocation ? (
                    <div className="flex items-center justify-center py-10">
                      <Sparkles className="h-8 w-8 text-[#1FC276] animate-spin" />
                      <span className="ml-2">Finding nearby NGOs...</span>
                    </div>
                  ) : locationError ? (
                    <div className="text-center py-10">
                      <p className="text-red-500 mb-4">{locationError}</p>
                      <Button onClick={getLocation} className="bg-[#1FC276] hover:bg-[#19a563]">Enable Location</Button>
                    </div>
                  ) : sortedFilteredNGOs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {sortedFilteredNGOs.map((ngo) => renderNGOCard(ngo))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <p className="text-gray-500">
                        {searchTerm
                          ? "No NGOs match your search"
                          : "No NGOs found nearby"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-3 xl:sticky xl:top-24 h-[640px]">
              <Card className="h-full overflow-hidden border border-gray-200 shadow-sm">
                {isLoadingLocation ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <Sparkles className="h-8 w-8 text-[#1FC276] mb-2 mx-auto animate-spin" />
                      <p>Loading map...</p>
                    </div>
                  </div>
                ) : locationError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center p-4">
                      <p className="text-red-500 mb-2">{locationError}</p>
                      <Button onClick={getLocation} className="bg-[#1FC276] hover:bg-[#19a563]">Enable Location</Button>
                    </div>
                  </div>
                ) : userLocation ? (
                  <Map userLocation={userLocation} nearbyNGOs={nearbyNGOs} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center p-4">
                      <p className="text-gray-600 mb-4">
                        Enable location to see nearby NGOs
                      </p>
                      <Button onClick={getLocation} className="bg-[#1FC276] hover:bg-[#19a563]">Enable Location</Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NGOListPage;
