import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Reminder } from "@/types/profile";
import { generateId } from "@/utils/chatbotUtils";

interface MedicationReminderProps {
  onComplete: (reminder: Reminder) => void;
  onCancel: () => void;
}

const MedicationReminder = ({ onComplete, onCancel }: MedicationReminderProps) => {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [time, setTime] = useState("");
  
  const handleSubmit = () => {
    if (!medicationName || !time) {
      // This case should ideally be handled by disabling the button,
      // but as a fallback, we do nothing.
      return;
    }

    const newReminder: Reminder = {
      id: generateId(),
      medicationName,
      dosage,
      frequency,
      time,
      active: true
    };
    
    onComplete(newReminder);
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
            <Label htmlFor="frequency">Frequency</Label>
            <Input
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g., Daily, Twice daily"
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
        >
          Set Reminder
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MedicationReminder;
