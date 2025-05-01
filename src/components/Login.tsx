
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoginProps {
  onLogin: (userData: { email: string; name: string; id: string }) => void;
  onRegister: () => void;
}

const Login = ({ onLogin, onRegister }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Simple validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }
    
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast({
          title: "Login successful",
          description: "Welcome back to your healthcare assistant!",
        });
        
        onLogin({ 
          email: data.user.email || email, 
          name: data.user.user_metadata?.name || email.split('@')[0],
          id: data.user.id
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Invalid email or password. Please try again or register.");
    } finally {
      setIsLoading(false);
    }
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
            Sign up to save your health profile data securely
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
