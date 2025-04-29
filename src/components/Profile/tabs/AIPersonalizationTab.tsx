
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIPersonalizationData } from "@/types/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  Chart, 
  LineElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Tooltip, 
  Legend,
  Title,
  BarElement
} from "chart.js";
import { ChartBar, ChartLine, Heart, MessageSquare, Smile, Frown } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Line, Bar } from "recharts";

Chart.register(
  LineElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Tooltip, 
  Legend,
  Title,
  BarElement
);

interface AIPersonalizationTabProps {
  data: AIPersonalizationData;
  onUpdate: (data: AIPersonalizationData) => void;
}

const moodEmojis = {
  'very-sad': '😢',
  'sad': '😔',
  'neutral': '😐',
  'happy': '😊',
  'very-happy': '😄'
};

const AIPersonalizationTab = ({ data, onUpdate }: AIPersonalizationTabProps) => {
  const [formData, setFormData] = useState<AIPersonalizationData>(data || {
    frequentSymptoms: [],
    healthGoals: [],
    chatHistory: [],
    moodTracking: []
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [newSymptom, setNewSymptom] = useState('');
  const [newGoal, setNewGoal] = useState({
    goal: '',
    target: '',
    progress: 0,
    startDate: new Date(),
    targetDate: null as Date | null
  });
  const [newMood, setNewMood] = useState({
    date: new Date(),
    mood: 'neutral' as 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy',
    notes: ''
  });
  const [activeTab, setActiveTab] = useState("symptoms");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };
  
  const addSymptom = () => {
    if (newSymptom.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        frequentSymptoms: [...prev.frequentSymptoms, newSymptom]
      }));
      setNewSymptom('');
    }
  };
  
  const removeSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      frequentSymptoms: prev.frequentSymptoms.filter(s => s !== symptom)
    }));
  };
  
  const addHealthGoal = () => {
    if (newGoal.goal.trim() !== '' && newGoal.target.trim() !== '') {
      setFormData(prev => ({
        ...prev,
        healthGoals: [...prev.healthGoals, { ...newGoal }]
      }));
      setNewGoal({
        goal: '',
        target: '',
        progress: 0,
        startDate: new Date(),
        targetDate: null
      });
    }
  };
  
  const removeHealthGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.filter((_, i) => i !== index)
    }));
  };
  
  const updateGoalProgress = (index: number, progress: number) => {
    const updatedGoals = [...formData.healthGoals];
    updatedGoals[index].progress = progress;
    setFormData(prev => ({
      ...prev,
      healthGoals: updatedGoals
    }));
  };
  
  const addMoodEntry = () => {
    setFormData(prev => ({
      ...prev,
      moodTracking: [...prev.moodTracking, { ...newMood }]
    }));
    setNewMood({
      date: new Date(),
      mood: 'neutral',
      notes: ''
    });
  };

  const removeMoodEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      moodTracking: prev.moodTracking.filter((_, i) => i !== index)
    }));
  };
  
  // Prepare data for recharts
  const moodChartData = formData.moodTracking.map(entry => ({
    date: format(new Date(entry.date), 'MMM dd'),
    value: entry.mood === 'very-happy' ? 5 : 
           entry.mood === 'happy' ? 4 : 
           entry.mood === 'neutral' ? 3 : 
           entry.mood === 'sad' ? 2 : 1,
    mood: entry.mood
  })).sort((a, b) => a.date.localeCompare(b.date));
  
  const goalChartData = formData.healthGoals.map(goal => ({
    name: goal.goal,
    progress: goal.progress,
    target: 100
  }));
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">AI Personalization Data</h3>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">Edit</Button>
        ) : (
          <div className="space-x-2">
            <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
            <Button onClick={handleSubmit} type="submit">Save</Button>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="symptoms" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="symptoms" className="flex items-center">
            <Heart className="mr-2 h-4 w-4" />
            <span>Symptoms</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center">
            <ChartBar className="mr-2 h-4 w-4" />
            <span>Health Goals</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Chat History</span>
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex items-center">
            <Smile className="mr-2 h-4 w-4" />
            <span>Mood Tracking</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="symptoms">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-2">Frequently Reported Symptoms</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.frequentSymptoms.map((symptom, index) => (
                  <Badge key={index} className="flex gap-1 items-center">
                    {symptom}
                    {isEditing && (
                      <X 
                        size={12} 
                        className="cursor-pointer" 
                        onClick={() => removeSymptom(symptom)}
                      />
                    )}
                  </Badge>
                ))}
                {formData.frequentSymptoms.length === 0 && (
                  <p className="text-gray-500 text-sm">No symptoms recorded yet.</p>
                )}
              </div>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add symptom"
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                  />
                  <Button type="button" size="sm" onClick={addSymptom}>
                    <Plus size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="goals">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-4">Health Goals</h4>
              
              {formData.healthGoals.length > 0 && (
                <div className="mb-6 h-64">
                  <div className="flex justify-center w-full h-full">
                    {goalChartData.length > 0 && (
                      <div className="w-full h-full">
                        <Bar
                          data={goalChartData}
                          width={500}
                          height={250}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {formData.healthGoals.map((goal, index) => (
                <Card key={index} className="p-4 mb-4">
                  <div className="flex justify-between">
                    <div>
                      <h5 className="font-medium">{goal.goal}</h5>
                      <p className="text-sm text-gray-600">Target: {goal.target}</p>
                      <p className="text-sm text-gray-600">
                        {goal.startDate && `Started: ${format(new Date(goal.startDate), 'MMM dd, yyyy')}`}
                        {goal.targetDate && ` • Target Date: ${format(new Date(goal.targetDate), 'MMM dd, yyyy')}`}
                      </p>
                    </div>
                    {isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeHealthGoal(index)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-4">
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div 
                          className="bg-healthcare-primary h-2 rounded-full" 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{goal.progress}%</span>
                    </div>
                    {isEditing && (
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={goal.progress}
                        className="w-full mt-2"
                        onChange={(e) => updateGoalProgress(index, parseInt(e.target.value))}
                      />
                    )}
                  </div>
                </Card>
              ))}
              
              {formData.healthGoals.length === 0 && (
                <p className="text-gray-500 text-sm">No health goals set yet.</p>
              )}
              
              {isEditing && (
                <Card className="p-4 border-dashed">
                  <h5 className="font-medium mb-3">Add New Health Goal</h5>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="goal">Goal</Label>
                      <Input
                        id="goal"
                        placeholder="e.g., Weight loss, Blood sugar control"
                        value={newGoal.goal}
                        onChange={(e) => setNewGoal({...newGoal, goal: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="target">Target</Label>
                      <Input
                        id="target"
                        placeholder="e.g., Lose 10 lbs, Keep blood sugar under 120"
                        value={newGoal.target}
                        onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newGoal.startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newGoal.startDate ? (
                                format(newGoal.startDate, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newGoal.startDate || undefined}
                              onSelect={(date) => setNewGoal({...newGoal, startDate: date})}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label>Target Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newGoal.targetDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newGoal.targetDate ? (
                                format(newGoal.targetDate, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newGoal.targetDate || undefined}
                              onSelect={(date) => setNewGoal({...newGoal, targetDate: date})}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      onClick={addHealthGoal}
                      className="w-full mt-2"
                    >
                      Add Health Goal
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="chat">
          <div>
            <h4 className="text-lg font-medium mb-4">Chatbot Interaction History</h4>
            {formData.chatHistory.length > 0 ? (
              <div className="space-y-3">
                {formData.chatHistory.map((chat, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between">
                      <h5 className="font-medium">{chat.topic}</h5>
                      <span className="text-sm text-gray-500">
                        {format(new Date(chat.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm mt-2">{chat.summary}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No chat history recorded yet.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="mood">
          <div className="space-y-6">
            <h4 className="text-lg font-medium mb-4">Mood Tracking</h4>
            
            {formData.moodTracking.length > 0 && (
              <div className="mb-6 h-64">
                <div className="flex justify-center w-full h-full">
                  {moodChartData.length > 0 && (
                    <div className="w-full h-full">
                      <Line
                        data={moodChartData}
                        width={500}
                        height={250}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {formData.moodTracking.map((entry, index) => (
              <Card key={index} className="p-4 mb-3">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{moodEmojis[entry.mood]}</span>
                    <div>
                      <h5 className="font-medium capitalize">{entry.mood.replace('-', ' ')}</h5>
                      <p className="text-sm text-gray-500">
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  {isEditing && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeMoodEntry(index)}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
                {entry.notes && (
                  <p className="text-sm mt-2">{entry.notes}</p>
                )}
              </Card>
            ))}
            
            {formData.moodTracking.length === 0 && (
              <p className="text-gray-500 text-sm">No mood tracking data recorded yet.</p>
            )}
            
            {isEditing && (
              <Card className="p-4 border-dashed">
                <h5 className="font-medium mb-3">Add New Mood Entry</h5>
                <div className="space-y-3">
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(newMood.date, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newMood.date}
                          onSelect={(date) => date && setNewMood({...newMood, date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>How are you feeling today?</Label>
                    <div className="flex justify-between mt-2">
                      {(['very-sad', 'sad', 'neutral', 'happy', 'very-happy'] as const).map((mood) => (
                        <Button
                          key={mood}
                          type="button"
                          variant={newMood.mood === mood ? "default" : "outline"}
                          className="flex-1 mx-1"
                          onClick={() => setNewMood({...newMood, mood})}
                        >
                          <span className="text-xl">{moodEmojis[mood]}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Anything specific about your mood today?"
                      value={newMood.notes}
                      onChange={(e) => setNewMood({...newMood, notes: e.target.value})}
                      className="resize-none"
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={addMoodEntry}
                    className="w-full mt-2"
                  >
                    Add Mood Entry
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPersonalizationTab;
