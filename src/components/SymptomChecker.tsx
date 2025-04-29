
import { useState } from "react";
import { symptoms, symptomAnalysis } from "@/data/healthData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SymptomCheckerProps {
  onComplete: (analysis: string) => void;
  onCancel: () => void;
}

const SymptomChecker = ({ onComplete, onCancel }: SymptomCheckerProps) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const toggleSymptom = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(selectedSymptoms.filter(id => id !== symptomId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    }
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length === 0) {
      onComplete("Please select at least one symptom so I can provide some guidance.");
      return;
    }

    // Generate a simple analysis based on selected symptoms
    let analysis = "Based on your symptoms, here's some general information:\n\n";
    
    selectedSymptoms.forEach(symptomId => {
      const symptom = symptoms.find(s => s.id === symptomId);
      if (symptom && symptomAnalysis[symptomId]) {
        analysis += `- ${symptom.label}: ${symptomAnalysis[symptomId]}\n\n`;
      }
    });
    
    analysis += "\nThis is not a medical diagnosis. Please consult a healthcare professional for proper evaluation and treatment.";
    
    onComplete(analysis);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Symptom Checker</CardTitle>
        <CardDescription>
          Select the symptoms you're experiencing, and I'll provide some general guidance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {symptoms.map((symptom) => (
            <div key={symptom.id} className="flex items-center space-x-2">
              <Checkbox 
                id={symptom.id} 
                checked={selectedSymptoms.includes(symptom.id)}
                onCheckedChange={() => toggleSymptom(symptom.id)}
              />
              <Label htmlFor={symptom.id} className="cursor-pointer">{symptom.label}</Label>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          className="bg-healthcare-primary hover:bg-healthcare-dark"
        >
          Check Symptoms
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SymptomChecker;
