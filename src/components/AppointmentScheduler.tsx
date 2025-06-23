import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { Hospital } from "./NearbyHospitals";
import { Calendar as CalendarIcon } from "lucide-react";

interface AppointmentSchedulerProps {
  onComplete: (details: string) => void;
  onCancel: () => void;
  selectedHospital?: Hospital;
}

const AppointmentScheduler = ({ onComplete, onCancel, selectedHospital }: AppointmentSchedulerProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Generate available times for the selected date
  useEffect(() => {
    if (date) {
      // Example: generate times from 9 AM to 5 PM, 30-min intervals
      const times: string[] = [];
      for (let i = 9; i <= 16; i++) {
        times.push(`${i}:00`);
        times.push(`${i}:30`);
      }
      // Simulate some times being booked
      const filteredTimes = times.filter(() => Math.random() > 0.3);
      setAvailableTimes(filteredTimes);
      setSelectedTime(""); // Reset selected time when date changes
    }
  }, [date]);

  const handleSubmit = () => {
    if (date && selectedTime && selectedHospital) {
      const confirmationMessage = `Your appointment at ${selectedHospital.name} has been scheduled for ${format(date, "MMMM d, yyyy")} at ${selectedTime}.`;
      onComplete(confirmationMessage);
    } else {
      // This case should ideally not be hit if the button is disabled properly
      onComplete("Please select a date and time for your appointment.");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Schedule an Appointment</CardTitle>
        <CardDescription>
          {selectedHospital 
            ? `Schedule your visit at ${selectedHospital.name}`
            : "Select a date and time for your appointment."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedHospital && (
          <div className="bg-muted/50 p-4 rounded-md">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">{selectedHospital.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedHospital.address}</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <Label>Select a date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={(d) => d < new Date().setHours(0, 0, 0, 0) || d > addDays(new Date(), 30)}
            />
          </div>
          {date && (
            <div className="flex-1 space-y-2">
              <Label>Available Times for {format(date, "MMMM d")}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {availableTimes.length > 0 ? (
                  availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))
                ) : (
                  <p className="col-span-full text-muted-foreground">No available times for this date.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!date || !selectedTime || !selectedHospital}>
          Confirm Appointment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AppointmentScheduler;
