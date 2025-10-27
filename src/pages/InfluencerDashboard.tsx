import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trophy, LogOut, Users, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";

const InfluencerDashboard = () => {
  const [userSession, setUserSession] = useState<any>(null);
  const [influencerData, setInfluencerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem("userSession");
    if (session) {
      const parsedSession = JSON.parse(session);
      if (parsedSession.type === "influencer") {
        setUserSession(parsedSession);
        fetchInfluencerData(parsedSession.id);
      } else {
        navigate("/");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchInfluencerData = async (influencerId: string) => {
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('id', influencerId)
        .single();

      if (error) throw error;

      setInfluencerData(data);
    } catch (error) {
      console.error('Error fetching influencer data:', error);
      toast({
        title: "Error",
        description: "Failed to load influencer data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-purple-600 to-secondary flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-600 to-secondary flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <Trophy className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Influencer Dashboard</h1>
        </div>
        <Button 
          variant="outline" 
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Card */}
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome, {influencerData?.first_name}!</CardTitle>
              <CardDescription>
                Your influencer code: <span className="font-mono font-bold text-primary">{influencerData?.code}</span>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{influencerData?.points || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Points earned from redemptions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consumer Count</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{influencerData?.consumer_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Consumers who used your code
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Info</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p><strong>Location:</strong> {influencerData?.location || "Not specified"}</p>
                  <p><strong>Age:</strong> {influencerData?.age || "Not specified"}</p>
                  <p><strong>Gender:</strong> {influencerData?.sex || "Not specified"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions Card */}
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>How to Share Your Code</CardTitle>
              <CardDescription>
                Share your influencer code with consumers so they can redeem products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Your Influencer Code:</h4>
                <div className="font-mono text-lg font-bold text-primary bg-white p-2 rounded">
                  {influencerData?.code}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>• Share this code with your followers and customers</p>
                <p>• When they redeem a product using your code, you earn points</p>
                <p>• Track your performance in real-time on this dashboard</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-white/80 text-sm">
        <p>© 2025 Campaign Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default InfluencerDashboard;
