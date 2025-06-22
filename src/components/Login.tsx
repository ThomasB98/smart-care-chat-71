
import { useState, useEffect } from "react";
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

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('Existing session found:', session.user.email);
        onLogin({
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          id: session.user.id
        });
      }
    };
    
    checkSession();
  }, [onLogin]);

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
      console.log("Attempting login with:", { email });
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        
        // More user-friendly error messages
        if (error.message.includes("Invalid login")) {
          setError("Email or password is incorrect. Please check your credentials and try again.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please confirm your email before logging in. Check your inbox for a confirmation email.");
        } else if (error.message.includes("User not found")) {
          setError("No account found with this email. Please register first or check your email address.");
        } else {
          setError(`Login failed: ${error.message}`);
        }
        
        setIsLoading(false);
        return;
      }
      
      console.log("Login successful:", data.user);
      
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
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTroubleshoot = async () => {
    try {
      // Check current session status
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session data:", sessionData);
      
      if (sessionData?.session) {
        toast({
          title: "Session found",
          description: "Attempting to restore your login...",
        });
        
        const { user } = sessionData.session;
        onLogin({
          email: user.email || email,
          name: user.user_metadata?.name || email.split('@')[0],
          id: user.id
        });
      } else {
        // Check if user exists but needs to confirm email
        if (email) {
          const { data: users } = await supabase.auth.admin.listUsers();
          console.log("Users check:", users);
        }
        
        toast({
          title: "Troubleshooting",
          description: "No active session found. Try registering if you haven't already, or check if you need to confirm your email.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Troubleshooting error:", err);
      toast({
        title: "Troubleshooting failed",
        description: "Unable to diagnose the issue. Please try registering first if you haven't already.",
        variant: "destructive"
      });
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
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
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
          
          {error && (
            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                className="text-healthcare-primary p-0 h-auto text-sm"
                onClick={handleTroubleshoot}
              >
                Having trouble? Click here to troubleshoot
              </Button>
            </div>
          )}
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
