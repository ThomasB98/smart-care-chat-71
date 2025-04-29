
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface NearbyDoctorsProps {
  onSelectDoctor: (doctor: Doctor) => void;
  onCancel: () => void;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  address: string;
  distance: string;
  rating: number;
}

// Mock data for nearby doctors
const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "General Physician",
    address: "123 Medical Center, Downtown",
    distance: "0.7 miles",
    rating: 4.8
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Cardiologist",
    address: "456 Health Avenue, Westside",
    distance: "1.2 miles",
    rating: 4.9
  },
  {
    id: "3",
    name: "Dr. Emily Williams",
    specialty: "Pediatrician",
    address: "789 Care Boulevard, Northside",
    distance: "1.5 miles",
    rating: 4.7
  },
];

const NearbyDoctors = ({ onSelectDoctor, onCancel }: NearbyDoctorsProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's location
  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // In a real implementation, we would use Google Maps API to find nearby doctors
          // For now, we'll use mock data
          setTimeout(() => {
            setDoctors(mockDoctors);
            setLoading(false);
          }, 1000);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to access your location. Please enable location services.");
          setDoctors(mockDoctors); // Fallback to mock data
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setDoctors(mockDoctors); // Fallback to mock data
      setLoading(false);
    }
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Nearby Doctors</CardTitle>
        <CardDescription>
          Find and select a doctor near your location
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse text-healthcare-primary">Loading nearby doctors...</div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
            <p className="mt-2">Showing available doctors instead.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <div 
                key={doctor.id} 
                className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectDoctor(doctor)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>
                  <span className="text-sm bg-healthcare-light text-healthcare-primary px-2 py-1 rounded-full">
                    {doctor.distance}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  {doctor.address}
                </div>
                <div className="mt-1 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < Math.floor(doctor.rating) ? "text-yellow-500" : "text-gray-300"}`}>
                      ★
                    </span>
                  ))}
                  <span className="ml-1 text-xs text-gray-600">({doctor.rating})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NearbyDoctors;
