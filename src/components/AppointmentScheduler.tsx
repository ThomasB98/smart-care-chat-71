
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { availableAppointments } from "@/data/healthData";
import { format } from "date-fns";

interface AppointmentSchedulerProps {
  onComplete: (details: string) => void;
  onCancel: () => void;
}

const AppointmentScheduler = ({ onComplete, onCancel }: AppointmentSchedulerProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedAppointment, setSelectedAppointment] = useState<string>("");
  
  // Group appointments by date
  const appointmentsByDate: Record<string, typeof availableAppointments> = {};
  availableAppointments.forEach(appointment => {
    if (!appointmentsByDate[appointment.date]) {
      appointmentsByDate[appointment.date] = [];
    }
    appointmentsByDate[appointment.date].push(appointment);
  });

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
    if (!date || !selectedAppointment) {
      onComplete("Please select both a date and an appointment time to schedule your visit.");
      return;
    }

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
  };

  const availableSlots = getAvailableAppointments();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Schedule an Appointment</CardTitle>
        <CardDescription>
          Select a date and available time slot to book your appointment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md border"
              disabled={(date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return !appointmentsByDate[dateStr] || date < new Date();
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
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!date || !selectedAppointment}
          className="bg-healthcare-primary hover:bg-healthcare-dark"
        >
          Book Appointment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AppointmentScheduler;
