import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle, User, Settings } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import SymptomChecker from "./SymptomChecker";
import AppointmentScheduler from "./AppointmentScheduler";
import MedicationReminder from "./MedicationReminder";
import HealthTips from "./HealthTips";
import NearbyDoctors from "./NearbyDoctors";
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
import { generateId, processUserInput, MessageType, getSymptomAnalysis, getFAQResponse } from "@/utils/chatbotUtils";

const ChatInterface = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [userData, setUserData] = useState<{ email: string; name: string } | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: generateId(),
      content: "Hello! I'm your Smart Healthcare Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'options',
      options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby doctors"]
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleLogin = (userData: { email: string; name: string }) => {
    setIsLoggedIn(true);
    setUserData(userData);
    
    // Update welcome message with user's name
    simulateTyping(() => {
      const welcomeMessage: MessageType = {
        id: generateId(),
        content: `Welcome back, ${userData.name}! How can I help you with your healthcare needs today?`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'options',
        options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby doctors"]
      };
      setMessages([welcomeMessage]);
    });
  };

  const handleRegister = (userData: { email: string; name: string }) => {
    setIsLoggedIn(true);
    setUserData(userData);
    setShowRegistration(false);
    
    // Update welcome message for new user
    simulateTyping(() => {
      const welcomeMessage: MessageType = {
        id: generateId(),
        content: `Welcome, ${userData.name}! Thank you for registering. I'm your healthcare assistant. How can I help you today?`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'options',
        options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby doctors"]
      };
      setMessages([welcomeMessage]);
    });
  };

  const switchToRegister = () => {
    setShowRegistration(true);
  };

  const switchToLogin = () => {
    setShowRegistration(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    setMessages([
      {
        id: generateId(),
        content: "Hello! I'm your Smart Healthcare Assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'options',
        options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby doctors"]
      }
    ]);
  };

  const goToProfile = () => {
    navigate('/profile', { state: { userData } });
  };

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: MessageType = {
      id: generateId(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    addMessage(userMessage);
    
    // Process user input and generate bot response
    simulateTyping(() => {
      const botResponse = processUserInput(content);
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
    });
  };

  const handleOptionClick = (option: string) => {
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
    simulateTyping(() => {
      if (option === "Check symptoms") {
        setActiveComponent('symptom-checker');
        return;
      } else if (option === "Schedule appointment") {
        setActiveComponent('appointment');
        return;
      } else if (option === "Set medication reminder") {
        setActiveComponent('reminder');
        return;
      } else if (option === "Get health tips") {
        setActiveComponent('health-tips');
        return;
      } else if (option === "Find nearby doctors") {
        setActiveComponent('nearby-doctors');
        return;
      } else if (option === "Ask health questions") {
        const botResponse: MessageType = {
          id: generateId(),
          content: "Here are some common health questions. Select one to learn more:",
          sender: 'bot',
          timestamp: new Date(),
          type: 'options',
          options: ["How to prevent cold?", "What is high blood pressure?", "Benefits of exercise", "Healthy diet tips", "Sleep hygiene"]
        };
        addMessage(botResponse);
        return;
      }
      
      // Check if it's a symptom from the list
      const symptomAnalysis = getSymptomAnalysis(option);
      if (symptomAnalysis) {
        const botResponse: MessageType = {
          id: generateId(),
          content: `About ${option}: ${symptomAnalysis}`,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        };
        addMessage(botResponse);
        return;
      }
      
      // Check if it's an FAQ question
      const faqResponse = getFAQResponse(option);
      if (faqResponse) {
        const botResponse: MessageType = {
          id: generateId(),
          content: faqResponse,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        };
        addMessage(botResponse);
        return;
      }
      
      // Default response if not recognized
      const botResponse = processUserInput(option);
      addMessage(botResponse);
    });
  };

  const handleSymptomCheckerComplete = (analysis: string) => {
    setActiveComponent(null);
    
    simulateTyping(() => {
      const botResponse: MessageType = {
        id: generateId(),
        content: analysis,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      addMessage(botResponse);
    });
  };

  const handleAppointmentComplete = (details: string) => {
    setActiveComponent(null);
    
    simulateTyping(() => {
      const botResponse: MessageType = {
        id: generateId(),
        content: details,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      addMessage(botResponse);
    });
  };

  const handleReminderComplete = (details: string) => {
    setActiveComponent(null);
    
    simulateTyping(() => {
      const botResponse: MessageType = {
        id: generateId(),
        content: details,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      addMessage(botResponse);
    });
  };

  const handleHealthTipSelect = (content: string) => {
    setActiveComponent(null);
    
    simulateTyping(() => {
      const botResponse: MessageType = {
        id: generateId(),
        content,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      addMessage(botResponse);
    });
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setActiveComponent('appointment');
    
    simulateTyping(() => {
      const botResponse: MessageType = {
        id: generateId(),
        content: `You selected ${doctor.name}, ${doctor.specialty}. Please schedule your appointment below.`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      addMessage(botResponse);
    });
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
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 chat-container">
              {messages.map(message => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  onOptionClick={handleOptionClick}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {activeComponent === 'symptom-checker' && (
              <div className="p-4 border-t">
                <SymptomChecker
                  onComplete={handleSymptomCheckerComplete}
                  onCancel={() => setActiveComponent(null)}
                />
              </div>
            )}
            
            {activeComponent === 'appointment' && (
              <div className="p-4 border-t">
                <AppointmentScheduler
                  onComplete={handleAppointmentComplete}
                  onCancel={() => setActiveComponent(null)}
                />
              </div>
            )}
            
            {activeComponent === 'reminder' && (
              <div className="p-4 border-t">
                <MedicationReminder
                  onComplete={handleReminderComplete}
                  onCancel={() => setActiveComponent(null)}
                />
              </div>
            )}
            
            {activeComponent === 'health-tips' && (
              <div className="p-4 border-t">
                <HealthTips
                  onSelect={handleHealthTipSelect}
                  onClose={() => setActiveComponent(null)}
                />
              </div>
            )}

            {activeComponent === 'nearby-doctors' && (
              <div className="p-4 border-t">
                <NearbyDoctors
                  onSelectDoctor={handleDoctorSelect}
                  onCancel={() => setActiveComponent(null)}
                />
              </div>
            )}
            
            {!activeComponent && (
              <ChatInput 
                onSendMessage={handleSendMessage} 
                isTyping={isTyping} 
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
