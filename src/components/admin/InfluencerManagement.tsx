import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, User, Copy, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import type { Influencer } from "@/types/database";
import "../admin/RealtimeTransitions.css";

const InfluencerManagement = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInfluencers();

    // Set up realtime subscription for influencers
    const channel = supabase
      .channel('influencers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'influencers',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Add new influencer to the list
            setInfluencers((current) => [...current, payload.new as Influencer]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing influencer
            setInfluencers((current) =>
              current.map((inf) =>
                inf.id === payload.new.id ? (payload.new as Influencer) : inf
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted influencer
            setInfluencers((current) =>
              current.filter((inf) => inf.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInfluencers = async () => {
    try {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      setInfluencers(data || []);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      toast({
        title: "Error",
        description: "Failed to load influencers.",
        variant: "destructive",
      });
    }
  };

  const generateCode = async (): Promise<string> => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    let isUnique = false;

    while (!isUnique) {
      code = "INF-";
      for (let i = 0; i < 3; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if code already exists
      const { data } = await supabase
        .from('influencers')
        .select('code')
        .eq('code', code)
        .single();

      if (!data) {
        isUnique = true;
      }
    }

    return code;
  };

  const handleAddInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both first and last name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const code = await generateCode();

      const { data, error } = await supabase
        .from('influencers')
        .insert({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          code: code,
          points: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setInfluencers([...influencers, data]);
      toast({
        title: "Influencer Added!",
        description: `${firstName} ${lastName} has been added with code ${code}`,
      });
      
      setFirstName("");
      setLastName("");
      setShowForm(false);
    } catch (error) {
      console.error('Error adding influencer:', error);
      toast({
        title: "Error",
        description: "Failed to add influencer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Code ${code} copied to clipboard`,
    });
  };

  const maxPoints = Math.max(...influencers.map(i => i.points), 1);

  return (
    <div className="space-y-6">
      {/* Points Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Influencer Performance</CardTitle>
          </div>
          <CardDescription>Visual breakdown of points earned by each influencer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {influencers
            .sort((a, b) => b.points - a.points)
            .map((influencer) => (
              <div key={influencer.id} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/20 text-xs text-foreground">
                        {influencer.first_name[0]}{influencer.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {influencer.first_name} {influencer.last_name}
                    </span>
                    <span className="text-muted-foreground">({influencer.code})</span>
                  </div>
                  <span className="font-bold text-primary">{influencer.points} pts</span>
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-3"
                    style={{ width: `${(influencer.points / maxPoints) * 100}%` }}
                  >
                    {influencer.points > 0 && (
                      <span className="text-xs font-semibold text-white">
                        {((influencer.points / maxPoints) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Influencer Management</CardTitle>
              <CardDescription>Add and manage influencers for your campaign</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Influencer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleAddInfluencer} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Influencer"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {influencers.map((influencer) => (
              <div
                key={influencer.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {influencer.first_name} {influencer.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">ID: {influencer.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1 bg-muted rounded text-sm font-mono">
                    {influencer.code}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyCode(influencer.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfluencerManagement;
