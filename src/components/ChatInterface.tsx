import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle, User, Settings, History, X } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import SymptomChecker from "./SymptomChecker";
import AppointmentScheduler from "./AppointmentScheduler";
import MedicationReminder from "./MedicationReminder";
import HealthTips from "./HealthTips";
import NearbyHospitals from "./NearbyHospitals";
import Login from "./Login";
import Registration from "./Registration";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateId, processUserInput, MessageType, generateSuggestedReply } from "@/utils/chatbotUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileData, loadProfileData, saveProfileData, ChatHistoryItem, Reminder } from "@/types/profile";
import { Hospital } from "./NearbyHospitals";

const ChatInterface = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [userData, setUserData] = useState<{ email: string; name: string; id: string } | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [inputValue, setInputValue] = useState("");
  
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to schedule a single notification
  const scheduleNotification = (reminder: Reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      // If the time is in the past for today, schedule it for tomorrow
      if (reminderTime < now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      // Check if already notified today
      const today = new Date().toISOString().slice(0, 10);
      if (reminder.lastNotified === today) {
        return; // Already notified today
      }

      const delay = reminderTime.getTime() - now.getTime();

      if (delay > 0) {
        setTimeout(async () => {
          new Notification('Medication Reminder', {
            body: `It's time to take your ${reminder.medicationName}.`,
            icon: '/favicon.ico' 
          });
          // Update lastNotified and save to DB
          const updatedReminder = { ...reminder, lastNotified: new Date().toISOString().slice(0, 10) };
          if (profileData && userData) {
            const updatedReminders = profileData.medicalInfo.reminders.map(r => r.id === reminder.id ? updatedReminder : r);
            const updatedProfileData = {
              ...profileData,
              medicalInfo: {
                ...profileData.medicalInfo,
                reminders: updatedReminders
              }
            };
            setProfileData(updatedProfileData);
            await saveProfileData(updatedProfileData, userData.id);
          }
        }, delay);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if user is already logged in with Supabase
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsLoggedIn(true);
        const userDataObj = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
        };
        setUserData(userDataObj);
        
        // Load user profile data
        try {
          const profile = await loadProfileData(userDataObj);
          setProfileData(profile);
          
          // If we have stored chat history, use it
          if (profile.aiPersonalization.chatHistory.length > 0) {
            // Just load the welcome message for now
            // We'll load chat history when the user clicks on history
            const welcomeMessage: MessageType = {
              id: generateId(),
              content: `Welcome back, ${userDataObj.name}! How can I help you with your healthcare needs today?`,
              sender: 'bot',
              timestamp: new Date(),
              type: 'options',
              options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby hospitals", "View chat history"]
            };
            setMessages([welcomeMessage]);
          } else {
            // Update welcome message with user's name
            const welcomeMessage: MessageType = {
              id: generateId(),
              content: `Welcome back, ${userDataObj.name}! How can I help you with your healthcare needs today?`,
              sender: 'bot',
              timestamp: new Date(),
              type: 'options',
              options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby hospitals"]
            };
            setMessages([welcomeMessage]);
          }
        } catch (error) {
          console.error("Error loading profile data:", error);
          // Fallback welcome message
          const welcomeMessage: MessageType = {
            id: generateId(),
            content: `Welcome back, ${userDataObj.name}! How can I help you with your healthcare needs today?`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'options',
            options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby hospitals"]
          };
          setMessages([welcomeMessage]);
        }
      } else {
        // Default message for non-logged in users
        setMessages([
          {
            id: generateId(),
            content: "Hello! I'm your Smart Healthcare Assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date(),
            type: 'options',
            options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby hospitals"]
          }
        ]);
      }
    };
    
    checkAuth();
  }, []);

  // Schedule notifications for existing reminders on load
  useEffect(() => {
    if (profileData?.medicalInfo.reminders) {
      profileData.medicalInfo.reminders.forEach(reminder => {
        if (reminder.active) {
          scheduleNotification(reminder);
        }
      });
    }
  }, [profileData]);

  // Save chat history when messages change
  useEffect(() => {
    const saveHistory = async () => {
      // Only save if user is logged in and we have some meaningful conversation
      if (isLoggedIn && userData && profileData && messages.length > 2) {
        // Create a chat summary
        const userMessages = messages
          .filter(msg => msg.sender === 'user')
          .map(msg => msg.content)
          .slice(-5) // Get last 5 messages
          .join(", ");
        
        const botMessages = messages
          .filter(msg => msg.sender === 'bot' && msg.type === 'text')
          .map(msg => msg.content)
          .slice(-3) // Get last 3 messages
          .join(", ");

        // Only save meaningful conversations
        if (userMessages.length > 10) {
          // Create a summary of the conversation
          const topic = userMessages.split(" ").slice(0, 5).join(" ") + "...";
          const summary = `User asked about: ${userMessages}. Bot provided: ${botMessages}`;
          
          // Create a chat history item
          const chatHistoryItem = {
            id: generateId(),
            topic,
            date: new Date(),
            summary,
            messages: messages.slice(-10) // Store last 10 messages
          };
          
          // Add to profile data
          const updatedProfileData = { 
            ...profileData,
            aiPersonalization: {
              ...profileData.aiPersonalization,
              chatHistory: [
                chatHistoryItem,
                ...profileData.aiPersonalization.chatHistory.slice(0, 9) // Keep only 10 most recent
              ]
            }
          };
          
          // Save the updated profile
          try {
            await saveProfileData(updatedProfileData, userData.id);
            setProfileData(updatedProfileData);
          } catch (error) {
            console.error("Error saving chat history:", error);
          }
        }
      }
    };
    
    // Use a debounce mechanism to avoid too frequent saves
    const timeoutId = setTimeout(saveHistory, 5000);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoggedIn, userData, profileData]);

  const simulateTyping = (callback: () => void) => {
    setIsTyping(true);
    const typingDelay = Math.random() * 1000 + 500; // Random delay between 500ms and 1500ms
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, typingDelay);
  };

  const addMessage = (message: MessageType) => {
    setMessages(prev => [...prev, message]);
  };

  const handleLogin = async (userData: { email: string; name: string; id: string }) => {
    setIsLoggedIn(true);
    setUserData(userData);
    
    // Load user profile data
    try {
      const profile = await loadProfileData(userData);
      setProfileData(profile);
      
      // Update welcome message with user's name
      simulateTyping(() => {
        const welcomeMessage: MessageType = {
          id: generateId(),
          content: `Welcome back, ${userData.name}! How can I help you with your healthcare needs today?`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'options',
          options: profile.aiPersonalization.chatHistory.length > 0 
            ? ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby hospitals", "View chat history"] 
            : ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby hospitals"]
        };
        setMessages([welcomeMessage]);
      });
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast({
        title: "Error loading profile",
        description: "Could not load your profile data. Some features may be limited.",
        variant: "destructive"
      });
      
      // Fallback welcome message
      simulateTyping(() => {
        const welcomeMessage: MessageType = {
          id: generateId(),
          content: `Welcome back, ${userData.name}! How can I help you with your healthcare needs today?`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'options',
          options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby hospitals"]
        };
        setMessages([welcomeMessage]);
      });
    }
  };

  const handleRegister = async (userData: { email: string; name: string; id: string }) => {
    setIsLoggedIn(true);
    setUserData(userData);
    setShowRegistration(false);
    
    // Load or create new profile
    try {
      const profile = await loadProfileData(userData);
      setProfileData(profile);
      
      // Update welcome message for new user
      simulateTyping(() => {
        const welcomeMessage: MessageType = {
          id: generateId(),
          content: `Welcome, ${userData.name}! Thank you for registering. I'm your healthcare assistant. How can I help you today?`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'options',
          options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby hospitals"]
        };
        setMessages([welcomeMessage]);
      });
    } catch (error) {
      console.error("Error loading profile data:", error);
      // Fallback welcome message
      simulateTyping(() => {
        const welcomeMessage: MessageType = {
          id: generateId(),
          content: `Welcome, ${userData.name}! Thank you for registering. I'm your healthcare assistant. How can I help you today?`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'options',
          options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby hospitals"]
        };
        setMessages([welcomeMessage]);
      });
    }
  };

  const switchToRegister = () => {
    setShowRegistration(true);
  };

  const switchToLogin = () => {
    setShowRegistration(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserData(null);
    setProfileData(null);
    setMessages([
      {
        id: generateId(),
        content: "Hello! I'm your Smart Healthcare Assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'options',
        options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby hospitals"]
      }
    ]);
  };

  const goToProfile = () => {
    navigate('/profile', { state: { userData } });
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: MessageType = {
      id: generateId(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    addMessage(userMessage);
    
    // Process user input and generate bot response with AI
    setIsTyping(true);
    try {
      const botResponse = await processUserInput(content);
      setTimeout(() => {
        setIsTyping(false);
        addMessage(botResponse);
        
        // Activate component based on response type
        if (botResponse.type === 'symptom-checker') {
          setActiveComponent('symptom-checker');
        } else if (botResponse.type === 'appointment') {
          setActiveComponent('appointment');
        } else if (botResponse.type === 'reminder') {
          setActiveComponent('reminder');
        } else if (botResponse.type === 'health-tip' || botResponse.type === 'options') {
          // For these types, we just show the message with options
        }
      }, Math.random() * 1000 + 500);
    } catch (error) {
      console.error('Error processing message:', error);
      setIsTyping(false);
      addMessage({
        id: generateId(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      });
    }
  };

  const handleOptionClick = async (option: string) => {
    // Add user message for the selected option
    const userMessage: MessageType = {
      id: generateId(),
      content: option,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    addMessage(userMessage);
    
    // Handle different option types
    setIsTyping(true);
    try {
      const lowerCaseOption = option.toLowerCase();
      if (lowerCaseOption === "check symptoms") {
        setIsTyping(false);
        setActiveComponent('symptom-checker');
        return;
      } else if (lowerCaseOption === "schedule appointment" || lowerCaseOption.startsWith("schedule an appointment at")) {
        setIsTyping(false);
        setActiveComponent('appointment');
        return;
      } else if (lowerCaseOption === "set medication reminder") {
        setIsTyping(false);
        setActiveComponent('reminder');
        return;
      } else if (lowerCaseOption === "get health tips") {
        setIsTyping(false);
        setActiveComponent('health-tips');
        return;
      } else if (lowerCaseOption === "find nearby hospitals") {
        setIsTyping(false);
        setActiveComponent('nearby-hospitals');
        return;
      } else if (lowerCaseOption === "view chat history") {
        setShowHistoryPanel(true);
        setIsTyping(false);
        return;
      } else if (lowerCaseOption === "ask health questions") {
        setTimeout(() => {
          setIsTyping(false);
          const botResponse: MessageType = {
            id: generateId(),
            content: "Here are some common health questions. Select one to learn more:",
            sender: 'bot',
            timestamp: new Date(),
            type: 'options',
            options: ["How to prevent cold?", "What is high blood pressure?", "Benefits of exercise", "Healthy diet tips", "Sleep hygiene"]
          };
          addMessage(botResponse);
        }, 800);
        return;
      }
      
      if (profileData) {
        const historyItem = profileData.aiPersonalization.chatHistory.find(
          history => `${history.topic} (${new Date(history.date).toLocaleDateString()})` === option
        );
        
        if (historyItem) {
          const summaryMessage: MessageType = {
            id: generateId(),
            content: `Summary of conversation on ${new Date(historyItem.date).toLocaleDateString()}: ${historyItem.summary}`,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          };
          addMessage(summaryMessage);
          return;
        }
      }
      
      // Use AI for other options
      const botResponse = await processUserInput(option);
      setTimeout(() => {
        setIsTyping(false);
        addMessage(botResponse);
      }, 800);
    } catch (error) {
      console.error('Error processing option:', error);
      setIsTyping(false);
      addMessage({
        id: generateId(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      });
    }
  };

  const handleSymptomCheckerComplete = (symptoms: string) => {
    setActiveComponent(null);
    handleSendMessage(symptoms);
  };

  const handleAppointmentComplete = (details: string) => {
    simulateTyping(() => {
      addMessage({
        id: generateId(),
        content: details,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      });
    });
    setActiveComponent(null);
    setSelectedHospital(null); // Clear selected hospital after booking
  };

  const handleReminderComplete = async (reminder: Reminder) => {
    if (!profileData || !userData) {
      toast({
        title: "Error",
        description: "You must be logged in to set a reminder.",
        variant: "destructive"
      });
      setActiveComponent(null);
      return;
    }

    // Update profile data with new reminder
    const updatedProfileData = {
      ...profileData,
      medicalInfo: {
        ...profileData.medicalInfo,
        reminders: [...profileData.medicalInfo.reminders, reminder]
      }
    };
    
    setProfileData(updatedProfileData);

    try {
      // Save to database
      await saveProfileData(updatedProfileData, userData.id);

      // Schedule notification
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          scheduleNotification(reminder);
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              scheduleNotification(reminder);
            }
          });
        }
      }

      // Show confirmation message
      simulateTyping(() => {
        addMessage({
          id: generateId(),
          content: `Reminder set for ${reminder.medicationName} at ${reminder.time} ${reminder.frequency}. I'll notify you when it's time.`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        });
      });

    } catch (error) {
      console.error("Failed to save reminder:", error);
      toast({
        title: "Error",
        description: "Could not save your reminder. Please try again.",
        variant: "destructive"
      });
    }
    
    setActiveComponent(null);
  };

  const handleHealthTipSelect = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setActiveComponent(null); // Hide the hospitals list
    simulateTyping(() => {
      addMessage({
        id: generateId(),
        content: `You've selected ${hospital.name}. I can help you schedule an appointment or get directions. What would you like to do?`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'options',
        options: [`Schedule an appointment at ${hospital.name}`, `Get directions to ${hospital.name}`]
      });
    });
  };

  const handleHistorySelect = (historyItem: ChatHistoryItem) => {
    setMessages(historyItem.messages);
    setShowHistoryPanel(false);
    // Add a message to indicate that history was loaded
    setTimeout(() => {
      addMessage({
        id: generateId(),
        content: `Continuing conversation from ${new Date(historyItem.date).toLocaleDateString()}.`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
      });
    }, 200);
  };

  const handleGenerateReply = async (botMessage: string) => {
    setIsGeneratingReply(true);
    try {
      const suggestedReply = await generateSuggestedReply(botMessage);
      setInputValue(suggestedReply);
    } catch (error) {
      console.error("Failed to generate reply:", error);
      toast({
        title: "Could not generate reply",
        description: "There was a problem generating a suggested reply.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReply(false);
    }
  };

  if (!isLoggedIn) {
    if (showRegistration) {
      return <Registration onRegister={handleRegister} onBackToLogin={switchToLogin} />;
    }
    return <Login onLogin={handleLogin} onRegister={switchToRegister} />;
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full border-none">
        <CardHeader className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3 bg-healthcare-primary">
                <MessageCircle className="h-5 w-5 text-white" />
              </Avatar>
              <CardTitle className="text-xl font-bold">Smart Healthcare Assistant</CardTitle>
            </div>
            {userData && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 hidden md:inline-block">
                  Logged in as {userData.name}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8 bg-healthcare-primary/10 text-healthcare-primary">
                        <User className="h-4 w-4" />
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 z-50">
                    <div className="flex items-center justify-start p-2">
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium">{userData.name}</p>
                        <p className="text-xs text-gray-500">{userData.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={goToProfile}>
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowHistoryPanel(true)}>
                      <History className="mr-2 h-4 w-4" />
                      <span>Chat History</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>
        
        <div className="flex flex-col flex-1 overflow-y-hidden">
          <div className="flex flex-1 overflow-y-hidden">
            <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map(message => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  onOptionClick={handleOptionClick}
                  onGenerateReply={handleGenerateReply}
                />
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {showHistoryPanel && profileData && (
              <div className="w-full md:w-1/3 border-l bg-gray-50/50 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Chat History</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowHistoryPanel(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="overflow-y-auto flex-1">
                  {profileData.aiPersonalization.chatHistory.length > 0 ? (
                    <ul className="divide-y">
                      {profileData.aiPersonalization.chatHistory.map(item => (
                        <li 
                          key={item.id} 
                          className="p-3 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleHistorySelect(item)}
                        >
                          <p className="font-medium truncate">{item.topic}</p>
                          <p className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-4 text-center text-gray-500">No chat history found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="px-4 pb-4">
            {activeComponent === 'symptom-checker' && (
              <SymptomChecker
                onComplete={handleSymptomCheckerComplete}
                onCancel={() => setActiveComponent(null)}
              />
            )}
            
            {activeComponent === 'appointment' && (
              <AppointmentScheduler 
                onComplete={handleAppointmentComplete}
                onCancel={() => setActiveComponent(null)}
                selectedHospital={selectedHospital}
              />
            )}
            
            {activeComponent === 'reminder' && (
              <MedicationReminder
                onComplete={handleReminderComplete}
                onCancel={() => setActiveComponent(null)}
              />
            )}
            
            {activeComponent === 'health-tips' && (
              <HealthTips
                onSelect={handleHealthTipSelect}
                onClose={() => setActiveComponent(null)}
              />
            )}

            {activeComponent === 'nearby-hospitals' && (
              <NearbyHospitals 
                onSelectHospital={handleHospitalSelect}
                onCancel={() => setActiveComponent(null)}
              />
            )}
          </div>
        </div>
            
        {!activeComponent && (
          <div className="p-4 border-t">
            <ChatInput 
              onSendMessage={handleSendMessage} 
              isTyping={isTyping || isGeneratingReply} 
              inputValue={inputValue}
              setInputValue={setInputValue}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatInterface;
