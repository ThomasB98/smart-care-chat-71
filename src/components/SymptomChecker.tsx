import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SymptomCheckerProps {
  onComplete: (analysis: string) => void;
  onCancel: () => void;
}

const SymptomChecker = ({ onComplete, onCancel }: SymptomCheckerProps) => {
  const [symptoms, setSymptoms] = useState("");

  const handleSubmit = () => {
    if (symptoms.trim().length === 0) {
      onComplete("Please describe your symptoms.");
      return;
    }
    const analysis = `I am experiencing the following symptoms: ${symptoms}. What could be the possible causes?`;
    onComplete(analysis);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Symptom Checker</CardTitle>
        <CardDescription>
          Please describe your symptoms in the text area below. For example, "I have a headache and a runny nose."
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="symptoms">Your Symptoms</Label>
          <Textarea 
            placeholder="Describe your symptoms here..." 
            id="symptoms" 
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>
          Analyze Symptoms
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SymptomChecker;
