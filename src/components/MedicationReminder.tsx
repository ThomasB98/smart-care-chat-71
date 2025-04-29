
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface MedicationReminderProps {
  onComplete: (details: string) => void;
  onCancel: () => void;
}

const MedicationReminder = ({ onComplete, onCancel }: MedicationReminderProps) => {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [time, setTime] = useState("");
  
  const handleSubmit = () => {
    if (!medicationName || !time) {
      onComplete("Please enter at least the medication name and time to set a reminder.");
      return;
    }

    const reminderDetails = `
      Medication reminder set:
      
      Medication: ${medicationName}
      ${dosage ? `Dosage: ${dosage}` : ''}
      ${frequency ? `Frequency: ${frequency}` : ''}
      Time: ${time}
      
      I'll remind you to take your medication at the scheduled time.
    `;
    
    onComplete(reminderDetails);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Medication Reminder</CardTitle>
        <CardDescription>
          Set up a reminder for your medication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medication-name">Medication Name</Label>
            <Input
              id="medication-name"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="Enter medication name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage (optional)</Label>
            <Input
              id="dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 10mg, 1 tablet"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency (optional)</Label>
            <Input
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g., Daily, Twice daily, Every 8 hours"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!medicationName || !time}
          className="bg-healthcare-primary hover:bg-healthcare-dark"
        >
          Set Reminder
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MedicationReminder;
