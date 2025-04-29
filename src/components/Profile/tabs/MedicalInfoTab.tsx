
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MedicalInfo } from "@/types/profile";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MedicalInfoTabProps {
  data: MedicalInfo;
  onUpdate: (data: MedicalInfo) => void;
}

const MedicalInfoTab = ({ data, onUpdate }: MedicalInfoTabProps) => {
  const [formData, setFormData] = useState<MedicalInfo>(data);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Medical Information</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select 
                disabled={!isEditing}
                value={formData.bloodGroup}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bloodGroup: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="knownAllergies">Known Allergies</Label>
            <Textarea
              id="knownAllergies"
              name="knownAllergies"
              placeholder="List any allergies (medications, food, etc.)"
              value={formData.knownAllergies}
              onChange={handleChange}
              disabled={!isEditing}
              className="min-h-[80px]"
            />
          </div>
          
          <div>
            <Label htmlFor="chronicConditions">Chronic Conditions</Label>
            <Textarea
              id="chronicConditions"
              name="chronicConditions"
              placeholder="e.g., diabetes, hypertension, asthma"
              value={formData.chronicConditions}
              onChange={handleChange}
              disabled={!isEditing}
              className="min-h-[80px]"
            />
          </div>
          
          <div>
            <Label htmlFor="currentMedications">Current Medications</Label>
            <Textarea
              id="currentMedications"
              name="currentMedications"
              placeholder="List all medications you're currently taking"
              value={formData.currentMedications}
              onChange={handleChange}
              disabled={!isEditing}
              className="min-h-[80px]"
            />
          </div>
          
          <div>
            <Label htmlFor="pastSurgeries">Past Surgeries or Procedures</Label>
            <Textarea
              id="pastSurgeries"
              name="pastSurgeries"
              placeholder="List any past surgeries with dates if known"
              value={formData.pastSurgeries}
              onChange={handleChange}
              disabled={!isEditing}
              className="min-h-[80px]"
            />
          </div>
          
          <div>
            <Label htmlFor="vaccinationRecords">Vaccination Records</Label>
            <Textarea
              id="vaccinationRecords"
              name="vaccinationRecords"
              placeholder="List important vaccinations and dates"
              value={formData.vaccinationRecords}
              onChange={handleChange}
              disabled={!isEditing}
              className="min-h-[80px]"
            />
          </div>
          
          <div>
            <Label htmlFor="familyMedicalHistory">Family Medical History</Label>
            <Textarea
              id="familyMedicalHistory"
              name="familyMedicalHistory"
              placeholder="List any hereditary diseases in your family"
              value={formData.familyMedicalHistory}
              onChange={handleChange}
              disabled={!isEditing}
              className="min-h-[80px]"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default MedicalInfoTab;
