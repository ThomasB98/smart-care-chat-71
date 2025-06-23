import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Hospital as HospitalIcon, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from "@/utils/chatbotUtils";
import { useToast } from "@/hooks/use-toast";

mapboxgl.accessToken = MAPBOX_TOKEN;

interface NearbyHospitalsProps {
  onSelectHospital: (hospital: Hospital) => void;
  onCancel: () => void;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  distance: string;
  location: [number, number]; // [longitude, latitude]
}

const NearbyHospitals = ({ onSelectHospital, onCancel }: NearbyHospitalsProps) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          fetchNearbyHospitals(location);
        },
        () => {
          setError("Unable to access your location. Please enable location services.");
          setLoading(false);
          toast({ title: "Location Error", description: "Could not access your location.", variant: "destructive" });
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, [toast]);

  const fetchNearbyHospitals = async (location: { lat: number; lng: number }) => {
    setLoading(true);
    try {
      // Use the Search Box API for category search for better results
      const category = "hospital"; // You can expand this to more categories if needed
      const url = `https://api.mapbox.com/search/searchbox/v1/category/${category}?proximity=${location.lng},${location.lat}&access_token=${MAPBOX_TOKEN}&limit=15`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const hospitalResults: Hospital[] = data.features.map((feature: any) => ({
          id: feature.properties.mapbox_id,
          name: feature.properties.name,
          address: feature.properties.full_address || feature.properties.place_formatted,
          location: feature.geometry.coordinates,
          distance: calculateDistance(location.lat, location.lng, feature.geometry.coordinates[1], feature.geometry.coordinates[0]).toFixed(2),
        }));
        setHospitals(hospitalResults);
      } else {
        // Fallback to a broader text search if category search fails
        toast({ title: "No Hospitals Found", description: "Broadening search to other healthcare facilities..." });
        fetchWithBroaderSearch(location);
      }
    } catch (err) {
      console.error("Error fetching hospitals:", err);
      setError("Failed to fetch nearby hospitals.");
      toast({ title: "API Error", description: "Could not fetch data from the map service.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to use broad text search if category search yields no results
  const fetchWithBroaderSearch = async (location: { lat: number; lng: number }) => {
    setLoading(true);
    try {
      const searchTerms = ["hospital", "clinic", "medical center"];
      let allResults: Hospital[] = [];

      for (const term of searchTerms) {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?proximity=${location.lng},${location.lat}&access_token=${MAPBOX_TOKEN}&types=poi&limit=10`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const termResults: Hospital[] = data.features.map((feature: any) => ({
            id: feature.id,
            name: feature.text,
            address: feature.properties.address || feature.place_name,
            location: feature.center,
            distance: calculateDistance(location.lat, location.lng, feature.center[1], feature.center[0]).toFixed(2),
          }));
          allResults.push(...termResults);
        }
      }

      if (allResults.length > 0) {
        const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());
        uniqueResults.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        setHospitals(uniqueResults);
      } else {
        toast({ title: "No Healthcare Facilities Found", description: "Could not find any hospitals or clinics nearby." });
      }
    } catch (err) {
      console.error("Error fetching with broader search:", err);
      setError("Failed to fetch nearby healthcare facilities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [userLocation.lng, userLocation.lat],
      zoom: 12,
    });

    new mapboxgl.Marker({ color: '#FF0000' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setText("Your Location"))
      .addTo(map.current);

    return () => map.current?.remove();
  }, [userLocation]);

  useEffect(() => {
    if (!map.current || hospitals.length === 0) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    hospitals.forEach(hospital => {
      const marker = new mapboxgl.Marker()
        .setLngLat(hospital.location)
        .setPopup(new mapboxgl.Popup().setText(hospital.name))
        .addTo(map.current!);
      markers.current.push(marker);
    });
  }, [hospitals]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Nearby Healthcare Facilities</CardTitle>
        <CardDescription>
          Showing hospitals and clinics near your location. Select one to proceed.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
        <div ref={mapContainer} className="w-full h-full rounded-md" />
        <ScrollArea className="h-full">
          {loading && <p>Searching for nearby hospitals...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <ul className="space-y-2">
            {hospitals.map(hospital => (
              <li key={hospital.id}>
                <Button
                  variant="outline"
                  className="w-full h-auto justify-start text-left p-3"
                  onClick={() => onSelectHospital(hospital)}
                >
                  <HospitalIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">{hospital.name}</h3>
                    <p className="text-sm text-muted-foreground">{hospital.address}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 inline-block mr-1" />
                      {hospital.distance} km away
                    </p>
                  </div>
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </CardFooter>
    </Card>
  );
};

export default NearbyHospitals;
