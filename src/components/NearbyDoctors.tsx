
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Hospital, MapPin, User, Clock, Phone } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from "@/utils/chatbotUtils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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
  selectedTime?: string;
}

// Function to calculate distance between two coordinates in kilometers using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Function to generate random available appointment times
const generateRandomTimes = (): string[] => {
  const times = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
                "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"];
  
  // Randomly select 3-5 times
  const numTimes = Math.floor(Math.random() * 3) + 3;
  const selectedTimes: string[] = [];
  
  while (selectedTimes.length < numTimes) {
    const randomTime = times[Math.floor(Math.random() * times.length)];
    if (!selectedTimes.includes(randomTime)) {
      selectedTimes.push(randomTime);
    }
  }
  
  // Sort by time
  return selectedTimes.sort((a, b) => {
    return new Date(`01/01/2023 ${a}`) < new Date(`01/01/2023 ${b}`) ? -1 : 1;
  });
};

const NearbyDoctors = ({ onSelectDoctor, onCancel }: NearbyDoctorsProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { toast } = useToast();
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Get user's location and fetch real doctors nearby
  useEffect(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          try {
            // Fetch real doctors nearby using the Mapbox geocoding API with expanded search radius
            const response = await fetchNearbyDoctors(location);
            
            if (response.length === 0) {
              // If no results, try with a wider radius
              toast({
                title: "Expanding search radius",
                description: "Looking for healthcare providers in a wider area",
              });
              const expandedResponse = await fetchNearbyDoctorsWithRadius(location, 20); // 20km radius
              setDoctors(expandedResponse);
            } else {
              setDoctors(response);
            }
            setLoading(false);
          } catch (err) {
            console.error("Error fetching doctors:", err);
            setError("Unable to fetch nearby doctors. Using generated data instead.");
            // Fall back to generated data if API fails
            const fallbackDoctors = generateDoctorsNearLocation(location.lng, location.lat);
            setDoctors(fallbackDoctors);
            setLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to access your location. Please enable location services.");
          
          // Fall back to a default location
          const fallbackLocation = { lat: 51.5074, lng: -0.1278 };
          setUserLocation(fallbackLocation);
          
          // Generate doctors near the fallback location
          const fallbackDoctors = generateDoctorsNearLocation(fallbackLocation.lng, fallbackLocation.lat);
          setDoctors(fallbackDoctors);
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      // Fall back to default location
      const fallbackLocation = { lat: 51.5074, lng: -0.1278 };
      setUserLocation(fallbackLocation);
      
      // Generate doctors near the fallback location
      const fallbackDoctors = generateDoctorsNearLocation(fallbackLocation.lng, fallbackLocation.lat);
      setDoctors(fallbackDoctors);
      setLoading(false);
    }
  }, []);

  // Fetch nearby doctors using Mapbox Geocoding API with specific search
  const fetchNearbyDoctors = async (location: { lat: number; lng: number }): Promise<Doctor[]> => {
    // Use multiple specific search terms for better results
    const searchTerms = ["doctor", "hospital", "clinic", "medical center", "healthcare"];
    let allResults: Doctor[] = [];
    
    // Search for each term and combine results
    for (const term of searchTerms) {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${term}.json?proximity=${location.lng},${location.lat}&access_token=${MAPBOX_TOKEN}&types=poi&limit=10`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          // Transform the response into our Doctor interface
          const doctorResults = data.features.map((feature: any, index: number) => {
            const distance = calculateDistance(
              location.lat, 
              location.lng, 
              feature.center[1], 
              feature.center[0]
            );
            
            // Only include results within reasonable distance (20km)
            if (distance <= 20) {
              return createDoctorFromFeature(feature, distance, location, index);
            }
            return null;
          }).filter(Boolean); // Filter out null entries
          
          allResults = [...allResults, ...doctorResults];
        }
      } catch (err) {
        console.error(`Error searching for ${term}:`, err);
      }
    }
    
    // Filter duplicate locations and sort by distance
    const uniqueResults = filterDuplicateDoctors(allResults);
    return uniqueResults.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  // Fetch nearby doctors with a specific radius
  const fetchNearbyDoctorsWithRadius = async (location: { lat: number; lng: number }, radiusKm: number): Promise<Doctor[]> => {
    const searchTerms = ["doctor", "hospital", "clinic", "medical center", "healthcare"];
    let allResults: Doctor[] = [];
    
    for (const term of searchTerms) {
      try {
        // Convert radius to approximate bounding box (rough estimation)
        const latRadius = radiusKm / 111; // 1 degree lat is ~111km
        const lonRadius = radiusKm / (111 * Math.cos(deg2rad(location.lat))); // Adjust for longitude
        
        const bbox = `${location.lng - lonRadius},${location.lat - latRadius},${location.lng + lonRadius},${location.lat + latRadius}`;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${term}.json?bbox=${bbox}&access_token=${MAPBOX_TOKEN}&types=poi&limit=15`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const doctorResults = data.features.map((feature: any, index: number) => {
            const distance = calculateDistance(
              location.lat, 
              location.lng, 
              feature.center[1], 
              feature.center[0]
            );
            
            // Include results within the specified radius
            if (distance <= radiusKm) {
              return createDoctorFromFeature(feature, distance, location, index);
            }
            return null;
          }).filter(Boolean);
          
          allResults = [...allResults, ...doctorResults];
        }
      } catch (err) {
        console.error(`Error searching for ${term} with radius:`, err);
      }
    }
    
    const uniqueResults = filterDuplicateDoctors(allResults);
    return uniqueResults.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  // Create a doctor object from a Mapbox feature
  const createDoctorFromFeature = (feature: any, distance: number, location: { lat: number; lng: number }, index: number): Doctor => {
    // Generate some specialties based on the name or use a default
    let specialty = "General Physician";
    const name = feature.text.toLowerCase();
    
    if (name.includes("pediatric") || name.includes("children")) {
      specialty = "Pediatrician";
    } else if (name.includes("cardio") || name.includes("heart")) {
      specialty = "Cardiologist";
    } else if (name.includes("derma") || name.includes("skin")) {
      specialty = "Dermatologist";
    } else if (name.includes("ortho") || name.includes("bone")) {
      specialty = "Orthopedist";
    } else if (name.includes("neuro") || name.includes("brain")) {
      specialty = "Neurologist";
    } else if (name.includes("hospital") || name.includes("medical center")) {
      specialty = "Hospital";
    } else if (name.includes("clinic")) {
      specialty = "Medical Clinic";
    }
    
    // Generate a doctor name if the place doesn't have a proper name
    const doctorName = feature.text.includes("Dr.") ? 
      feature.text : 
      `Dr. ${["Sarah", "Michael", "Emily", "David", "Jessica"][Math.floor(Math.random() * 5)]} ${["Johnson", "Smith", "Patel", "Garcia", "Wilson"][Math.floor(Math.random() * 5)]}`;
    
    // Generate a unique ID
    const uniqueId = `${feature.id || index}-${distance.toFixed(2)}`;
    
    return {
      id: uniqueId,
      name: doctorName,
      specialty: specialty,
      address: feature.place_name,
      distance: `${distance.toFixed(1)} km`,
      rating: 4 + Math.random() * 0.9, // Rating between 4.0 and 4.9
      location: feature.center,
      availableTimes: generateRandomTimes(),
      phone: `+${Math.floor(Math.random() * 2) + 1} (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    };
  };

  // Filter out duplicate doctors based on similar locations
  const filterDuplicateDoctors = (doctors: Doctor[]): Doctor[] => {
    const uniqueDoctors: Doctor[] = [];
    const locationMap = new Map();
    
    doctors.forEach(doctor => {
      if (doctor.location) {
        // Round coordinates to 5 decimal places (~1.1m precision) to identify nearby duplicates
        const roundedLocation = doctor.location.map(coord => Math.round(coord * 100000) / 100000).join(',');
        
        if (!locationMap.has(roundedLocation)) {
          locationMap.set(roundedLocation, doctor);
          uniqueDoctors.push(doctor);
        }
      }
    });
    
    return uniqueDoctors;
  };

  // Function to generate doctors near a specific location (fallback)
  const generateDoctorsNearLocation = (userLng: number, userLat: number): Doctor[] => {
    // Create random offsets to generate nearby locations (within ~1-3km)
    const createNearbyLocation = (): [number, number] => {
      // ~0.01 degree is roughly 1km depending on latitude
      const lngOffset = (Math.random() - 0.5) * 0.03;
      const latOffset = (Math.random() - 0.5) * 0.03;
      return [userLng + lngOffset, userLat + latOffset];
    };
    
    const specialties = [
      "General Physician", 
      "Cardiologist", 
      "Pediatrician", 
      "Dermatologist", 
      "Orthopedist",
      "Neurologist"
    ];
    
    const firstNames = ["Sarah", "Michael", "Emily", "David", "Jessica", "James", "Lisa", "Robert", "Emma", "John"];
    const lastNames = ["Johnson", "Chen", "Williams", "Smith", "Patel", "Garcia", "Brown", "Miller", "Wilson", "Taylor"];
    
    // Generate 5 random doctors
    return Array.from({ length: 5 }, (_, i) => {
      const location = createNearbyLocation();
      const distance = calculateDistance(userLat, userLng, location[1], location[0]);
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];
      
      return {
        id: (i + 1).toString(),
        name: `Dr. ${firstName} ${lastName}`,
        specialty: specialty,
        address: `${Math.floor(Math.random() * 999) + 1} Medical Center, ${specialty} Dept`,
        distance: `${distance.toFixed(1)} km`,
        rating: 4 + Math.random() * 0.9, // Rating between 4.0 and 4.9
        location: location,
        availableTimes: generateRandomTimes(),
        phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
      };
    });
  };

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
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat(doctor.location!)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="min-width: 180px;">
                  <h3 style="font-weight: bold; margin-bottom: 5px;">${doctor.name}</h3>
                  <p style="margin: 0 0 3px 0;">${doctor.specialty}</p>
                  <p style="font-size: 12px; margin: 0 0 3px 0;">${doctor.address}</p>
                  <p style="font-size: 12px; margin: 0;">Rating: ${doctor.rating.toFixed(1)}/5</p>
                </div>
              `)
          )
          .addTo(map.current!);
          
        // Add click event to marker to show doctor details
        el.addEventListener('click', () => {
          handleDoctorClick(doctor);
        });
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
    setShowDetailDialog(true);
    
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
      setShowDetailDialog(false);
    }
  };

  const handleBackToList = () => {
    setSelectedDoctor(null);
    setSelectedTime("");
    setShowDetailDialog(false);
    
    // Zoom out to show all doctors
    if (map.current && userLocation) {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 13
      });
    }
  };

  // Get directions to the doctor
  const handleGetDirections = () => {
    if (selectedDoctor?.location && userLocation) {
      // Open directions in a new tab using Mapbox Directions API
      const userCoords = `${userLocation.lng},${userLocation.lat}`;
      const doctorCoords = `${selectedDoctor.location[0]},${selectedDoctor.location[1]}`;
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedDoctor.location[1]},${selectedDoctor.location[0]}&travelmode=driving`;
      
      window.open(directionsUrl, '_blank');
      
      toast({
        title: "Opening directions",
        description: "Directions to the healthcare provider will open in a new window",
      });
    }
  };

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
            <div className="animate-pulse text-healthcare-primary">Finding healthcare providers near you...</div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
            <p className="mt-2">Showing available doctors instead.</p>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-2">Doctors & Medical Facilities</h3>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <div className="space-y-4 pr-4">
                {doctors.length > 0 ? (
                  doctors.map((doctor) => (
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
                        <span className="ml-1 text-xs text-gray-600">({doctor.rating.toFixed(1)})</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No healthcare providers found nearby. Try expanding your search area.
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {hospitals.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Nearby Hospitals</h3>
                <ScrollArea className="h-[150px] rounded-md border p-2">
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

      {/* Doctor details dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedDoctor?.name}</DialogTitle>
            <DialogDescription>{selectedDoctor?.specialty}</DialogDescription>
          </DialogHeader>
          
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedDoctor.address}</span>
              </div>
              
              {selectedDoctor.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedDoctor.phone}</span>
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
                  <span className="ml-1 text-xs text-gray-600">({selectedDoctor.rating.toFixed(1)})</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center"
                onClick={handleGetDirections}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Get Directions
              </Button>
              
              <div className="mt-4">
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
          )}
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBackToList}>
              Back to List
            </Button>
            <Button 
              className="bg-healthcare-primary hover:bg-healthcare-dark" 
              disabled={!selectedTime}
              onClick={handleScheduleAppointment}
            >
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NearbyDoctors;
