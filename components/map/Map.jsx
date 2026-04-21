"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";

const Map = ({ userLocation, nearbyNGOs }) => {
  useEffect(() => {
    // Fix for the marker icon issue in Leaflet with Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  // Create a custom red marker for user location
  const userIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return <div>Loading map...</div>;
  }

  return (
    <MapContainer
      center={[userLocation.latitude, userLocation.longitude]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location marker */}
      <Marker
        position={[userLocation.latitude, userLocation.longitude]}
        icon={userIcon}
      >
        <Popup>Your Location</Popup>
      </Marker>

      {/* NGO markers */}
      {nearbyNGOs.map((ngo, index) => {
        const lat = ngo.location?.latitude || ngo.location?.lat;
        const lng = ngo.location?.longitude || ngo.location?.lng;

        if (!lat || !lng) {
          return null;
        }

        const key = ngo.id || ngo.ngo_id || `ngo-marker-${index}`;
        const name = ngo.ngoName || ngo.name || "NGO";

        return (
          <Marker
            key={key}
            position={[parseFloat(lat), parseFloat(lng)]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{name}</h3>
                {ngo.distance !== undefined && (
                  <p className="text-sm">{ngo.distance.toFixed(1)} km away</p>
                )}
                {ngo.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{ngo.description}</p>
                )}
                <Link
                  href={`/ngo/${ngo.id || ngo.ngo_id}`}
                  className="text-emerald-600 hover:text-emerald-700 text-sm block mt-1 font-medium"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default Map;
