import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const InfluencerRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    age: "",
    sex: "",
    location: "",
    code: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkCodeExists = async (code: string): Promise<boolean> => {
    const { data } = await supabase
      .from('influencers')
      .select('code')
      .eq('code', code.toUpperCase())
      .single();

    return !!data;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || 
        !formData.password.trim() || !formData.code.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including your personal code.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if code already exists
      const codeExists = await checkCodeExists(formData.code);
      if (codeExists) {
        toast({
          title: "Code Already Exists",
          description: "This influencer code is already taken. Please choose a different one.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('influencers')
        .insert({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          password: formData.password, // In production, hash this password
          code: formData.code.trim().toUpperCase(),
          points: 0,
          age: formData.age ? parseInt(formData.age) : null,
          sex: formData.sex || null,
          location: formData.location.trim() || null,
          consumer_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Registration Successful!",
        description: `Welcome ${formData.firstName}! Your influencer code is ${formData.code.toUpperCase()}`,
      });
      
      // Store user info and redirect to login
      localStorage.setItem("registeredUser", JSON.stringify({
        type: "influencer",
        code: formData.code.toUpperCase()
      }));
      
      navigate("/login");
    } catch (error: any) {
      console.error('Error registering influencer:', error);
      if (error.code === '23505') {
        toast({
          title: "Code Already Exists",
          description: "This influencer code is already taken. Please choose a different one.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: "Failed to create account. Please try again.",
          variant: "destructive",
        });
      }
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
            <Users className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl">Influencer Registration</CardTitle>
          <CardDescription>
            Join as an influencer and start earning rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password *
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="h-12"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Personal Influencer Code *
              </label>
              <Input
                id="code"
                placeholder="Enter your personal code (e.g., INF-ABC)"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                className="h-12"
                required
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Choose a unique code that consumers will use to redeem products
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium">
                Age
              </label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className="h-12"
                min="13"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="sex" className="text-sm font-medium">
                Gender
              </label>
              <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                placeholder="Enter your location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register as Influencer"}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfluencerRegistration;
