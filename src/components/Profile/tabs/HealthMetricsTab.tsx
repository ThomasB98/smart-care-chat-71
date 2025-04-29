
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HealthMetrics } from "@/types/profile";

interface HealthMetricsTabProps {
  data: HealthMetrics;
  onUpdate: (data: HealthMetrics) => void;
}

const HealthMetricsTab = ({ data, onUpdate }: HealthMetricsTabProps) => {
  const [formData, setFormData] = useState<HealthMetrics>(data);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-calculate BMI if height and weight are provided
    if (name === 'height' || name === 'weight') {
      const updatedFormData = { ...formData, [name]: value };
      const heightInMeters = parseFloat(name === 'height' ? value : formData.height) / 100; // Convert cm to m
      const weightInKg = parseFloat(name === 'weight' ? value : formData.weight);
      
      if (!isNaN(heightInMeters) && !isNaN(weightInKg) && heightInMeters > 0) {
        const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        updatedFormData.bmi = bmi;
      }
      
      setFormData(updatedFormData);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Health Metrics</h3>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">Edit</Button>
        ) : (
          <div className="space-x-2">
            <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
            <Button onClick={handleSubmit} type="submit">Save</Button>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="bmi">BMI</Label>
              <Input
                id="bmi"
                name="bmi"
                value={formData.bmi}
                disabled={true}
                className={
                  parseFloat(formData.bmi) < 18.5 ? "bg-blue-50" :
                  parseFloat(formData.bmi) < 25 ? "bg-green-50" :
                  parseFloat(formData.bmi) < 30 ? "bg-yellow-50" :
                  "bg-red-50"
                }
              />
              {formData.bmi && (
                <p className="text-xs text-gray-500 mt-1">
                  {parseFloat(formData.bmi) < 18.5 ? "Underweight" :
                   parseFloat(formData.bmi) < 25 ? "Normal weight" :
                   parseFloat(formData.bmi) < 30 ? "Overweight" :
                   "Obesity"}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
              <Input
                id="bloodPressure"
                name="bloodPressure"
                placeholder="e.g., 120/80"
                value={formData.bloodPressure}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
              <Input
                id="heartRate"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="glucoseLevels">Glucose Levels (mg/dL)</Label>
              <Input
                id="glucoseLevels"
                name="glucoseLevels"
                value={formData.glucoseLevels}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
              <Input
                id="oxygenSaturation"
                name="oxygenSaturation"
                value={formData.oxygenSaturation}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="sleepPatterns">Sleep Patterns (hrs/night)</Label>
              <Input
                id="sleepPatterns"
                name="sleepPatterns"
                value={formData.sleepPatterns}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="exerciseRoutine">Exercise Routine</Label>
            <Input
              id="exerciseRoutine"
              name="exerciseRoutine"
              placeholder="Describe your typical exercise routine"
              value={formData.exerciseRoutine}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default HealthMetricsTab;
