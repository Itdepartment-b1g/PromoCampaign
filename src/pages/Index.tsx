import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trophy, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [influencerCode, setInfluencerCode] = useState("");
  const [productCode, setProductCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!influencerCode.trim() || !productCode.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both codes to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate validation (mock data for now)
    setTimeout(() => {
      const mockInfluencers = ["INF-001", "INF-002", "INF-003"];
      const mockUsedCodes = ["PROD-USED1", "PROD-USED2"];
      
      if (!mockInfluencers.includes(influencerCode.toUpperCase())) {
        toast({
          title: "Invalid Influencer Code",
          description: "The influencer code you entered does not exist.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (mockUsedCodes.includes(productCode.toUpperCase())) {
        toast({
          title: "Product Code Already Used",
          description: "This product code has already been redeemed.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Success
      toast({
        title: "Success! 🎉",
        description: "Your product has been redeemed successfully!",
      });
      
      setInfluencerCode("");
      setProductCode("");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-600 to-secondary flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <Trophy className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Campaign Tracker</h1>
        </div>
        <Link to="/auth">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Admin Login
          </Button>
        </Link>
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
              Enter your influencer code and product code to claim your reward
            </CardDescription>
          </CardHeader>
          <CardContent>
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
