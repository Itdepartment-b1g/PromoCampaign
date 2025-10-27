import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trophy, CheckCircle2, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [influencerCode, setInfluencerCode] = useState("");
  const [productCode, setProductCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  // Check if user is logged in
  useEffect(() => {
    const session = localStorage.getItem("userSession");
    if (session) {
      setUserSession(JSON.parse(session));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    setUserSession(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in as consumer
    if (!userSession || userSession.type !== "consumer") {
      toast({
        title: "Login Required",
        description: "You must be logged in as a consumer to redeem codes.",
        variant: "destructive",
      });
      return;
    }
    
    if (!influencerCode.trim() || !productCode.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both codes to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if influencer code exists
      const { data: influencer, error: influencerError } = await supabase
        .from('influencers')
        .select('*')
        .eq('code', influencerCode.toUpperCase())
        .single();

      if (influencerError || !influencer) {
        toast({
          title: "Invalid Influencer Code",
          description: "The influencer code you entered does not exist.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if product code exists and is not used
      const { data: productCodeData, error: productCodeError } = await supabase
        .from('product_codes')
        .select('*')
        .eq('code', productCode.toUpperCase())
        .single();

      if (productCodeError || !productCodeData) {
        toast({
          title: "Invalid Product Code",
          description: "The product code you entered does not exist.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (productCodeData.is_used) {
        toast({
          title: "Product Code Already Used",
          description: "This product code has already been redeemed.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create redemption record with consumer information
      const { error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          influencer_id: influencer.id,
          product_code_id: productCodeData.id,
          consumer_id: userSession.id,
          consumer_info: {
            name: userSession.name,
            redeemed_at: new Date().toISOString()
          }
        });

      if (redemptionError) {
        throw redemptionError;
      }

      // Mark product code as used
      const { error: updateCodeError } = await supabase
        .from('product_codes')
        .update({
          is_used: true,
          used_by_influencer_id: influencer.id,
          used_at: new Date().toISOString(),
        })
        .eq('id', productCodeData.id);

      if (updateCodeError) {
        throw updateCodeError;
      }

      // Increment influencer points and consumer count
      const { error: updateInfluencerError } = await supabase
        .from('influencers')
        .update({
          points: influencer.points + 1,
          consumer_count: influencer.consumer_count + 1,
        })
        .eq('id', influencer.id);

      if (updateInfluencerError) {
        throw updateInfluencerError;
      }

      // Increment consumer redeemed codes count
      const { error: updateConsumerError } = await supabase
        .from('consumers')
        .update({
          redeemed_codes_count: userSession.redeemedCount + 1,
        })
        .eq('id', userSession.id);

      if (updateConsumerError) {
        throw updateConsumerError;
      }

      // Update local session
      const updatedSession = {
        ...userSession,
        redeemedCount: userSession.redeemedCount + 1
      };
      localStorage.setItem("userSession", JSON.stringify(updatedSession));
      setUserSession(updatedSession);

      // Success
      toast({
        title: "Success! 🎉",
        description: "Your product has been redeemed successfully!",
      });
      
      setInfluencerCode("");
      setProductCode("");
    } catch (error) {
      console.error('Redemption error:', error);
      toast({
        title: "Error",
        description: "An error occurred during redemption. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-600 to-secondary flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <Trophy className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Campaign Tracker</h1>
        </div>
        <div className="flex items-center gap-4">
          {userSession ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-white">
                <User className="h-4 w-4" />
                <span className="text-sm">{userSession.name}</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">
                  {userSession.type === "consumer" ? "Consumer" : "Influencer"}
                </span>
              </div>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Login
                </Button>
              </Link>
              <Link to="/register/consumer">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Register
                </Button>
              </Link>
            </div>
          )}
          <Link to="/auth">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Redeem Your Product</CardTitle>
            <CardDescription>
              {userSession && userSession.type === "consumer" 
                ? `Welcome ${userSession.name}! Enter your codes to claim your reward`
                : "Login as a consumer to redeem product codes"
              }
            </CardDescription>
            {userSession && userSession.type === "consumer" && (
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  Codes Redeemed: {userSession.redeemedCount}
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {userSession && userSession.type === "consumer" ? (
              <form onSubmit={handleRedeem} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="influencer-code" className="text-sm font-medium">
                    Influencer Code
                  </label>
                  <Input
                    id="influencer-code"
                    placeholder="e.g. INF-001"
                    value={influencerCode}
                    onChange={(e) => setInfluencerCode(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the code provided by your influencer
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="product-code" className="text-sm font-medium">
                    Product Code
                  </label>
                  <Input
                    id="product-code"
                    placeholder="e.g. PROD-12345"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Found on your product packaging
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={loading}
                >
                  {loading ? "Validating..." : "Redeem Product"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  You need to be logged in as a consumer to redeem product codes.
                </p>
                <div className="space-y-2">
                  <Link to="/login" className="block">
                    <Button className="w-full h-12 text-base">
                      Login as Consumer
                    </Button>
                  </Link>
                  <Link to="/register/consumer" className="block">
                    <Button variant="outline" className="w-full h-12 text-base">
                      Register as Consumer
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-white/80 text-sm">
        <p>© 2025 Campaign Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
