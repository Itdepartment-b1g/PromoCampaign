import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import InfluencerManagement from "@/components/admin/InfluencerManagement";
import ProductCodeManagement from "@/components/admin/ProductCodeManagement";
import RankingDashboard from "@/components/admin/RankingDashboard";

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const admin = localStorage.getItem("isAdmin");
      if (admin === "true") {
        setIsAuthenticated(true);
      } else {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/auth");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-primary to-secondary p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Trophy className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <Tabs defaultValue="rankings" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="influencers">Influencers</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="rankings">
            <RankingDashboard />
          </TabsContent>

          <TabsContent value="influencers">
            <InfluencerManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductCodeManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
