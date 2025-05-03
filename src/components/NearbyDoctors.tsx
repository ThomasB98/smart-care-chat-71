import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Hospital, MapPin, User, Clock, Phone } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from "@/utils/chatbotUtils";

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
  location?: [number, number]; // [longitude, latitude]
  availableTimes?: string[];
  phone?: string;
}

// Mock data for nearby doctors
const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "General Physician",
    address: "123 Medical Center, Downtown",
    distance: "0.7 miles",
    rating: 4.8,
    location: [-73.98, 40.73],
    availableTimes: ["9:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"],
    phone: "+1 (555) 123-4567"
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Cardiologist",
    address: "456 Health Avenue, Westside",
    distance: "1.2 miles",
    rating: 4.9,
    location: [-73.97, 40.74],
    availableTimes: ["10:00 AM", "1:00 PM", "3:30 PM"],
    phone: "+1 (555) 987-6543"
  },
  {
    id: "3",
    name: "Dr. Emily Williams",
    specialty: "Pediatrician",
    address: "789 Care Boulevard, Northside",
    distance: "1.5 miles",
    rating: 4.7,
    location: [-73.99, 40.72],
    availableTimes: ["9:30 AM", "12:00 PM", "2:30 PM", "5:00 PM"],
    phone: "+1 (555) 456-7890"
  },
];

const NearbyDoctors = ({ onSelectDoctor, onCancel }: NearbyDoctorsProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Get user's location
  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // In a real implementation, we would use Mapbox API to find nearby doctors
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

  // Initialize map when user location is available
  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [userLocation.lng, userLocation.lat],
      zoom: 13
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add user marker
    new mapboxgl.Marker({ color: "#3b82f6" })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML("<p>Your location</p>"))
      .addTo(map.current);

    // Add doctor markers if we have their locations
    doctors.forEach(doctor => {
      if (doctor.location) {
        const el = document.createElement('div');
        el.className = 'doctor-marker';
        el.style.width = '25px';
        el.style.height = '25px';
        el.style.backgroundImage = 'url(https://img.icons8.com/color/48/000000/doctor-male.png)';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';
        
        new mapboxgl.Marker(el)
          .setLngLat(doctor.location!)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="min-width: 180px;">
                  <h3 style="font-weight: bold; margin-bottom: 5px;">${doctor.name}</h3>
                  <p style="margin: 0 0 3px 0;">${doctor.specialty}</p>
                  <p style="font-size: 12px; margin: 0 0 3px 0;">${doctor.address}</p>
                  <p style="font-size: 12px; margin: 0;">Rating: ${doctor.rating}/5</p>
                </div>
              `)
          )
          .addTo(map.current!);
      }
    });

    // Find nearby hospitals when the map loads
    map.current.on('load', () => {
      findNearbyHospitals([userLocation.lng, userLocation.lat]);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [userLocation, doctors]);

  const findNearbyHospitals = (location: [number, number]) => {
    // Create a request to the Geocoding API to find hospitals
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/hospital.json?proximity=${location[0]},${location[1]}&access_token=${MAPBOX_TOKEN}&types=poi&limit=10`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Store hospitals data
        setHospitals(data.features);
        
        // Add hospital markers to map
        data.features.forEach((feature: any) => {
          const el = document.createElement('div');
          el.className = 'hospital-marker';
          el.style.width = '25px';
          el.style.height = '25px';
          el.style.backgroundImage = 'url(https://img.icons8.com/color/48/000000/hospital-2.png)';
          el.style.backgroundSize = 'cover';
          
          new mapboxgl.Marker(el)
            .setLngLat(feature.center)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <h3 style="font-weight: bold; margin-bottom: 5px;">${feature.text}</h3>
                  <p style="font-size: 12px; margin: 0">${feature.place_name}</p>
                `)
            )
            .addTo(map.current!);
        });
      })
      .catch(err => {
        console.error("Error fetching hospitals:", err);
        setError("Unable to fetch nearby hospitals.");
      });
  };

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    // If user clicks on a doctor in the list, center the map on their location
    if (map.current && doctor.location) {
      map.current.flyTo({
        center: doctor.location,
        zoom: 15
      });
    }
  };

  const handleScheduleAppointment = () => {
    if (selectedDoctor && selectedTime) {
      // Add time to the doctor object before passing it up
      const doctorWithTime = {
        ...selectedDoctor,
        selectedTime
      };
      onSelectDoctor(doctorWithTime as Doctor);
    }
  };

  if (selectedDoctor) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{selectedDoctor.name}</CardTitle>
              <CardDescription>{selectedDoctor.specialty}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedDoctor(null)}>
              Back to List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{selectedDoctor.address}</span>
            </div>
            
            {selectedDoctor.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{selectedDoctor.phone}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-sm ${i < Math.floor(selectedDoctor.rating) ? "text-yellow-500" : "text-gray-300"}`}>
                    ★
                  </span>
                ))}
                <span className="ml-1 text-xs text-gray-600">({selectedDoctor.rating})</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Available Appointment Times</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedDoctor.availableTimes?.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className="flex items-center justify-center"
                    onClick={() => setSelectedTime(time)}
                  >
                    <Clock className="mr-1 h-4 w-4" />
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setSelectedDoctor(null)}>
            Cancel
          </Button>
          <Button 
            className="bg-healthcare-primary hover:bg-healthcare-dark" 
            disabled={!selectedTime}
            onClick={handleScheduleAppointment}
          >
            Schedule Appointment
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Nearby Healthcare Providers</CardTitle>
        <CardDescription>
          Find hospitals and doctors near your location
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Map container */}
        <div ref={mapContainer} className="w-full h-64 mb-6 rounded-md border" />
        
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
          <div>
            <h3 className="font-semibold mb-2">Doctors</h3>
            <ScrollArea className="h-[200px] rounded-md">
              <div className="space-y-4 pr-4">
                {doctors.map((doctor) => (
                  <div 
                    key={doctor.id} 
                    className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleDoctorClick(doctor)}
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
            </ScrollArea>
            
            {hospitals.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Nearby Hospitals</h3>
                <ScrollArea className="h-[150px] rounded-md">
                  <div className="space-y-3 pr-4">
                    {hospitals.map((hospital, index) => (
                      <div key={index} className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                        <h4 className="font-medium">{hospital.text}</h4>
                        <p className="text-sm text-gray-600">{hospital.place_name}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
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
