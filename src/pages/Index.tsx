import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Trophy, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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

      // Create redemption record
      const { error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          influencer_id: influencer.id,
          product_code_id: productCodeData.id,
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

      // Increment influencer points
      const { error: updatePointsError } = await supabase
        .from('influencers')
        .update({
          points: influencer.points + 1,
        })
        .eq('id', influencer.id);

      if (updatePointsError) {
        throw updatePointsError;
      }

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
