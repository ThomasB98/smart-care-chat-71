
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginProps {
  onLogin: (userData: { email: string; name: string }) => void;
  onRegister: () => void;
}

// Mock user database - in a real application, this would come from a backend service
const REGISTERED_USERS = [
  { email: "john@example.com", name: "John", password: "password123" },
  { email: "sarah@example.com", name: "Sarah", password: "secure456" },
  { email: "demo@example.com", name: "Demo", password: "demo" }
];

const Login = ({ onLogin, onRegister }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Simple validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }
    
    // Check if user exists in our mock database
    setTimeout(() => {
      setIsLoading(false);
      
      const user = REGISTERED_USERS.find(
        (user) => user.email === email && user.password === password
      );
      
      if (user) {
        toast({
          title: "Login successful",
          description: "Welcome back to your healthcare assistant!",
        });
        onLogin({ email: user.email, name: user.name });
      } else {
        setError("Invalid email or password. Please try again or register.");
      }
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center p-4 h-full bg-healthcare-light">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-12 w-12 bg-healthcare-primary">
              <MessageCircle className="h-6 w-6 text-white" />
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-bold">Healthcare Assistant</CardTitle>
          <CardDescription>
            Login to access your healthcare assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6 bg-healthcare-primary hover:bg-healthcare-dark"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button 
            variant="ghost" 
            className="mt-2"
            onClick={onRegister}
          >
            Don't have an account? Register
          </Button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Demo login: Use email "demo@example.com" with password "demo"
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
