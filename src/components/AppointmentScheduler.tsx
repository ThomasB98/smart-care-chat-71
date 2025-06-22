import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { availableAppointments } from "@/data/healthData";
import { format } from "date-fns";
import { Doctor } from "@/components/NearbyDoctors";
import { Check, Calendar as CalendarIcon } from "lucide-react";

interface AppointmentSchedulerProps {
  onComplete: (details: string) => void;
  onCancel: () => void;
  selectedDoctor?: Doctor; // Optional prop for when a doctor is pre-selected
}

const AppointmentScheduler = ({ onComplete, onCancel, selectedDoctor }: AppointmentSchedulerProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedAppointment, setSelectedAppointment] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  // Group appointments by date
  const appointmentsByDate: Record<string, typeof availableAppointments> = {};
  availableAppointments.forEach(appointment => {
    if (!appointmentsByDate[appointment.date]) {
      appointmentsByDate[appointment.date] = [];
    }
    appointmentsByDate[appointment.date].push(appointment);
  });

  useEffect(() => {
    // When a doctor is selected and has a selectedTime property,
    // automatically set that time
    if (selectedDoctor && 'selectedTime' in selectedDoctor) {
      setSelectedTime(selectedDoctor.selectedTime as string);
      // Also set today's date
      setDate(new Date());
    }
  }, [selectedDoctor]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setSelectedAppointment("");
  };

  const getAvailableAppointments = () => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    return appointmentsByDate[dateStr] || [];
  };

  const handleSubmit = () => {
    if (selectedDoctor && selectedTime) {
      // Handle appointment with previously selected doctor
      const confirmationMessage = `
        Your appointment has been scheduled:
        
        Date: ${format(date || new Date(), "yyyy-MM-dd")}
        Time: ${selectedTime}
        Doctor: ${selectedDoctor.name}
        Specialty: ${selectedDoctor.specialty}
        Location: ${selectedDoctor.address}
        
        You will receive a confirmation email shortly. You can cancel or reschedule your appointment up to 24 hours before the scheduled time.
      `;
      
      onComplete(confirmationMessage);
    } else if (date && selectedAppointment) {
      const appointmentId = parseInt(selectedAppointment);
      const appointment = availableAppointments.find(a => a.id === appointmentId);
      
      if (!appointment) {
        onComplete("Sorry, there was an issue with scheduling your appointment. Please try again.");
        return;
      }

      const confirmationMessage = `
        Your appointment has been scheduled:
        
        Date: ${appointment.date}
        Time: ${appointment.time}
        Doctor: ${appointment.doctor}
        Specialty: ${appointment.specialty}
        
        You will receive a confirmation email shortly. You can cancel or reschedule your appointment up to 24 hours before the scheduled time.
      `;
      
      onComplete(confirmationMessage);
    } else {
      onComplete("Please select both a date and an appointment time to schedule your visit.");
    }
  };

  const availableSlots = getAvailableAppointments();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Schedule an Appointment</CardTitle>
        <CardDescription>
          {selectedDoctor 
            ? `Schedule your appointment with ${selectedDoctor.name}`
            : "Select a date and available time slot to book your appointment."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedDoctor ? (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-md mb-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">{selectedDoctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
                </div>
              </div>
              <div className="mt-2 ml-7 text-sm text-muted-foreground">
                {selectedDoctor.address}
              </div>
              {selectedTime && (
                <div className="mt-3 bg-green-50 border border-green-200 p-2 rounded flex items-center">
                  <Check className="text-green-500 h-4 w-4 mr-2" />
                  <span>Selected time: <span className="font-medium">{selectedTime}</span></span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Select or confirm a date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md border mx-auto"
                disabled={(date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  // Only disable if no appointments or if the date is before today (not including today)
                  return !appointmentsByDate[dateStr] || date.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                }}
              />
            </div>
            
            {!selectedTime && (
              <div className="space-y-2">
                <Label>Available Times</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedDoctor.availableTimes?.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md border"
                disabled={(date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  // Only disable if no appointments or if the date is before today (not including today)
                  return !appointmentsByDate[dateStr] || date.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                }}
              />
            </div>
            
            {date && (
              <div className="space-y-2">
                <Label htmlFor="appointment-time">Available Time Slots</Label>
                <Select
                  value={selectedAppointment}
                  onValueChange={setSelectedAppointment}
                  disabled={availableSlots.length === 0}
                >
                  <SelectTrigger id="appointment-time">
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id.toString()}>
                          {slot.time} - {slot.doctor}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No available appointments
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {availableSlots.length === 0 && date && (
                  <p className="text-sm text-muted-foreground">
                    No appointments available for this date. Please select another date.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={
            !((selectedDoctor && selectedTime) || (!selectedDoctor && date && selectedAppointment))
          }
          className="bg-healthcare-primary hover:bg-healthcare-dark"
        >
          Book Appointment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AppointmentScheduler;
