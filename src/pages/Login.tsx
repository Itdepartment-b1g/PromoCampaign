import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { LogIn, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "", // Can be influencer code or consumer name
    password: "",
    userType: "consumer" // "influencer" or "consumer"
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user just registered
  useEffect(() => {
    const registeredUser = localStorage.getItem("registeredUser");
    if (registeredUser) {
      const user = JSON.parse(registeredUser);
      if (user.type === "influencer") {
        setFormData(prev => ({ ...prev, userType: "influencer", identifier: user.code }));
      } else if (user.type === "consumer") {
        setFormData(prev => ({ ...prev, userType: "consumer", identifier: user.name }));
      }
      localStorage.removeItem("registeredUser");
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.identifier.trim() || !formData.password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your identifier and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (formData.userType === "influencer") {
        // Login as influencer using code
        const { data: influencer, error } = await supabase
          .from('influencers')
          .select('*')
          .eq('code', formData.identifier.toUpperCase())
          .eq('password', formData.password)
          .single();

        if (error || !influencer) {
          toast({
            title: "Invalid Credentials",
            description: "Influencer code or password is incorrect.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Store influencer session
        localStorage.setItem("userSession", JSON.stringify({
          type: "influencer",
          id: influencer.id,
          name: `${influencer.first_name} ${influencer.last_name}`,
          code: influencer.code,
          points: influencer.points
        }));

        toast({
          title: "Welcome back!",
          description: `Hello ${influencer.first_name}! You're logged in as an influencer.`,
        });

        navigate("/influencer-dashboard");

      } else {
        // Login as consumer using name
        const { data: consumer, error } = await supabase
          .from('consumers')
          .select('*')
          .eq('first_name', formData.identifier.split(' ')[0])
          .eq('last_name', formData.identifier.split(' ')[1] || '')
          .eq('password', formData.password)
          .single();

        if (error || !consumer) {
          toast({
            title: "Invalid Credentials",
            description: "Name or password is incorrect.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Store consumer session
        localStorage.setItem("userSession", JSON.stringify({
          type: "consumer",
          id: consumer.id,
          name: `${consumer.first_name} ${consumer.last_name}`,
          redeemedCount: consumer.redeemed_codes_count
        }));

        toast({
          title: "Welcome back!",
          description: `Hello ${consumer.first_name}! You're logged in as a consumer.`,
        });

        navigate("/");
      }

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-600 to-secondary flex flex-col items-center justify-center p-6">
      <Link to="/" className="absolute top-6 left-6">
        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Link>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-2">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl">Sign In</CardTitle>
          <CardDescription>
            Login as an influencer or consumer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="userType" className="text-sm font-medium">
                Account Type
              </label>
              <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consumer">Consumer</SelectItem>
                  <SelectItem value="influencer">Influencer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-medium">
                {formData.userType === "influencer" ? "Influencer Code" : "Full Name"} *
              </label>
              <Input
                id="identifier"
                placeholder={formData.userType === "influencer" ? "Enter your influencer code" : "Enter your full name"}
                value={formData.identifier}
                onChange={(e) => handleInputChange("identifier", e.target.value)}
                className="h-12"
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.userType === "influencer" 
                  ? "Enter your personal influencer code" 
                  : "Enter your first and last name"}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password *
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="h-12"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  to={formData.userType === "influencer" ? "/register/influencer" : "/register/consumer"} 
                  className="text-primary hover:underline"
                >
                  Register as {formData.userType}
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                Or{" "}
                <Link 
                  to={formData.userType === "influencer" ? "/register/consumer" : "/register/influencer"} 
                  className="text-primary hover:underline"
                >
                  register as {formData.userType === "influencer" ? "consumer" : "influencer"}
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
