
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HealthRecords } from "@/types/profile";
import { Upload, File, Plus, Trash } from "lucide-react";

interface HealthRecordsTabProps {
  data: HealthRecords;
  onUpdate: (data: HealthRecords) => void;
}

const HealthRecordsTab = ({ data, onUpdate }: HealthRecordsTabProps) => {
  const [formData, setFormData] = useState<HealthRecords>(data);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleRecordUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would handle file upload to storage
    // For this demo, we'll just add a mock record
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newRecord = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        date: new Date().toISOString().split('T')[0],
        fileUrl: URL.createObjectURL(file)
      };
      
      setFormData(prev => ({
        ...prev,
        medicalReports: [...prev.medicalReports, newRecord]
      }));
    }
  };
  
  const handleRemoveReport = (id: string) => {
    setFormData(prev => ({
      ...prev,
      medicalReports: prev.medicalReports.filter(report => report.id !== id)
    }));
  };
  
  const handleInsuranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      insuranceDetails: { ...prev.insuranceDetails, [name]: value }
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Health Records</h3>
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
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium">Medical Reports</h4>
              {isEditing && (
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center text-sm text-healthcare-primary hover:text-healthcare-dark">
                      <Upload className="w-4 h-4 mr-1" />
                      Upload Document
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleRecordUpload}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </label>
                </div>
              )}
            </div>
            
            {formData.medicalReports.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-md">
                <File className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No medical reports uploaded</p>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.medicalReports.map(report => (
                  <div key={report.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <File className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium">{report.name}</p>
                        <p className="text-xs text-gray-500">{report.date}</p>
                      </div>
                    </div>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveReport(report.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Insurance Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="provider">Insurance Provider</Label>
                <Input
                  id="provider"
                  name="provider"
                  value={formData.insuranceDetails.provider}
                  onChange={handleInsuranceChange}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  name="policyNumber"
                  value={formData.insuranceDetails.policyNumber}
                  onChange={handleInsuranceChange}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="coverage">Coverage</Label>
                <Input
                  id="coverage"
                  name="coverage"
                  value={formData.insuranceDetails.coverage}
                  onChange={handleInsuranceChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HealthRecordsTab;
