"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import Script from "next/script";

const LocationDialog = ({ onLocationSelect, defaultLocation = null }) => {
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [error, setError] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const isGoogleMapsReady = () =>
    typeof window !== "undefined" && !!window.google?.maps;

  const mapsScriptSrc = googleMapsKey
    ? `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=geometry,places`
    : null;

  // Function to initialize the map
  const initializeMap = () => {
    if (!mapContainerRef.current || !inputRef.current || !isGoogleMapsReady()) {
      return;
    }

    try {
      // Initialize the map
      const defaultMapLocation = { lat: 19.076, lng: 72.877 }; // Default to Mumbai
      const initialLocation = selectedLocation
        ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
        : defaultMapLocation;

      // Create the map
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: initialLocation,
        zoom: 13,
      });
      mapRef.current = map;

      const input = inputRef.current;

      // Create the autocomplete object and bind it to the input field
      const autocomplete = new window.google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", map);
      autocompleteRef.current = autocomplete;

      // Create initial marker if location exists
      if (selectedLocation) {
        const marker = new window.google.maps.Marker({
          position: initialLocation,
          map: map,
          draggable: true,
        });
        markerRef.current = marker;

        // Add drag end listener to marker
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          reverseGeocode({
            latitude: pos.lat(),
            longitude: pos.lng(),
          });
        });
      }

      // Set up the event listener for when the user selects a place
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          console.log("No details available for input: '" + place.name + "'");
          return;
        }

        // Update map view
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        // Update or create marker
        const coordinates = {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          address: place.formatted_address,
        };

        if (markerRef.current) {
          markerRef.current.setPosition({
            lat: coordinates.latitude,
            lng: coordinates.longitude,
          });
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: {
              lat: coordinates.latitude,
              lng: coordinates.longitude,
            },
            map: map,
            draggable: true,
          });

          markerRef.current.addListener("dragend", () => {
            const pos = markerRef.current.getPosition();
            reverseGeocode({
              latitude: pos.lat(),
              longitude: pos.lng(),
            });
          });
        }

        setSelectedLocation(coordinates);
      });

      // Add click listener to map
      map.addListener("click", (event) => {
        const coordinates = {
          latitude: event.latLng.lat(),
          longitude: event.latLng.lng(),
        };

        if (markerRef.current) {
          markerRef.current.setPosition({
            lat: coordinates.latitude,
            lng: coordinates.longitude,
          });
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: {
              lat: coordinates.latitude,
              lng: coordinates.longitude,
            },
            map: map,
            draggable: true,
          });

          markerRef.current.addListener("dragend", () => {
            const pos = markerRef.current.getPosition();
            reverseGeocode({
              latitude: pos.lat(),
              longitude: pos.lng(),
            });
          });
        }

        reverseGeocode(coordinates);
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please refresh the page.");
    }
  };

  // If Google Maps is already available (for example from a previous dialog open), mark script as ready.
  useEffect(() => {
    if (isGoogleMapsReady()) {
      setIsScriptLoaded(true);
    }
  }, []);

  // Initialize map when dialog opens and script is loaded
  useEffect(() => {
    if (isOpen && isScriptLoaded && !mapRef.current) {
      initializeMap();
    }

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      mapRef.current = null;
      markerRef.current = null;
      autocompleteRef.current = null;
    };
  }, [isOpen, isScriptLoaded, selectedLocation]);

  const reverseGeocode = async (coordinates) => {
    if (!isGoogleMapsReady()) {
      setError("Map is still loading. Please wait a moment and try again.");
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat: coordinates.latitude, lng: coordinates.longitude };

      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
          setSelectedLocation({
            ...coordinates,
            address: results[0].formatted_address,
          });
        } else {
          setSelectedLocation({
            ...coordinates,
            address: `Lat: ${coordinates.latitude.toFixed(6)}, Lng: ${coordinates.longitude.toFixed(6)}`,
          });
        }
      });
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      setSelectedLocation({
        ...coordinates,
        address: `Lat: ${coordinates.latitude.toFixed(6)}, Lng: ${coordinates.longitude.toFixed(6)}`,
      });
    }
  };

  const handleGetCurrentLocation = () => {
    setError(null);

    if (!isGoogleMapsReady()) {
      setError("Map is still loading. Please wait a moment and try again.");
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          if (mapRef.current) {
            mapRef.current.setCenter({
              lat: coordinates.latitude,
              lng: coordinates.longitude,
            });
            mapRef.current.setZoom(17);

            if (markerRef.current) {
              markerRef.current.setPosition({
                lat: coordinates.latitude,
                lng: coordinates.longitude,
              });
            } else {
              markerRef.current = new window.google.maps.Marker({
                position: {
                  lat: coordinates.latitude,
                  lng: coordinates.longitude,
                },
                map: mapRef.current,
                draggable: true,
              });

              markerRef.current.addListener("dragend", () => {
                const pos = markerRef.current.getPosition();
                reverseGeocode({
                  latitude: pos.lat(),
                  longitude: pos.lng(),
                });
              });
            }
          }

          reverseGeocode(coordinates);
        },
        (err) => {
          console.error("Error getting location:", err);
          setError(
            "Unable to retrieve your location. Please enable location services."
          );
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      setIsOpen(false);
    }
  };

  return (
    <>
      {mapsScriptSrc && (
        <Script
          src={mapsScriptSrc}
          strategy="afterInteractive"
          onLoad={() => setIsScriptLoaded(isGoogleMapsReady())}
          onError={() => {
            setError("Failed to load Google Maps. Please try refreshing the page.");
            setIsScriptLoaded(false);
          }}
        />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Set NGO Location</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="location-search">Search Location</Label>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  id="location-search"
                  placeholder="Enter address, landmark, or area"
                  className="flex-grow"
                />
                <Button onClick={handleGetCurrentLocation} variant="secondary">
                  Use Current
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 p-4 rounded-md text-red-800">
                {error}
              </div>
            )}

            {!googleMapsKey && (
              <div className="bg-amber-100 p-4 rounded-md text-amber-800">
                Google Maps API key is missing. Please set
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.
              </div>
            )}

            <div className="h-[400px] rounded-md border">
              <div ref={mapContainerRef} className="w-full h-full">
                {!isScriptLoaded && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <p>Loading map...</p>
                  </div>
                )}
              </div>
            </div>

            {selectedLocation && (
              <div className="space-y-2">
                <Label>Selected Location</Label>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium">{selectedLocation.address}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lat: {selectedLocation.latitude.toFixed(6)}, Lng:{" "}
                    {selectedLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleConfirmLocation}
                disabled={!selectedLocation}
              >
                Confirm Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationDialog;
