import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, User, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Influencer } from "@/types/database";
import "./RealtimeTransitions.css";

interface RankingData extends Influencer {
  redemptions: number;
}

const RankingDashboard = () => {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();

    // Set up realtime subscriptions with granular updates
    const influencersChannel = supabase
      .channel('rankings-influencers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'influencers',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Add new influencer to rankings
            const newInfluencer = payload.new as Influencer;
            setRankings((current) => [...current, { ...newInfluencer, redemptions: 0 }]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing influencer (points changed)
            const updatedInfluencer = payload.new as Influencer;
            setRankings((current) =>
              current
                .map((rank) =>
                  rank.id === updatedInfluencer.id
                    ? { ...rank, ...updatedInfluencer }
                    : rank
                )
                .sort((a, b) => b.points - a.points) // Re-sort by points
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted influencer
            setRankings((current) =>
              current.filter((rank) => rank.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    const redemptionsChannel = supabase
      .channel('rankings-redemptions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'redemptions',
        },
        async (payload) => {
          // Increment redemption count for the influencer
          const newRedemption = payload.new as any;
          setRankings((current) =>
            current.map((rank) =>
              rank.id === newRedemption.influencer_id
                ? { ...rank, redemptions: rank.redemptions + 1 }
                : rank
            )
          );
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(influencersChannel);
      supabase.removeChannel(redemptionsChannel);
    };
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);

      // Fetch all influencers with their redemption counts
      const { data: influencers, error: influencersError } = await supabase
        .from('influencers')
        .select('*')
        .order('points', { ascending: false });

      if (influencersError) throw influencersError;

      // Fetch redemption counts for each influencer
      const rankingsWithRedemptions = await Promise.all(
        (influencers || []).map(async (influencer) => {
          const { count } = await supabase
            .from('redemptions')
            .select('*', { count: 'exact', head: true })
            .eq('influencer_id', influencer.id);

          return {
            ...influencer,
            redemptions: count || 0,
          };
        })
      );

      setRankings(rankingsWithRedemptions);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  // Calculate max points for bar width calculation
  const maxPoints = Math.max(...rankings.map(r => r.points));

  const handleExport = () => {
    const csv = [
      ["Rank", "Name", "Code", "Points", "Redemptions"],
      ...rankings.map((r, i) => [
        i + 1,
        `${r.first_name} ${r.last_name}`,
        r.code,
        r.points,
        r.redemptions,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `influencer-rankings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading rankings...</p>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No influencers found. Add some influencers to see rankings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Top 3 Performers
          </CardTitle>
          <CardDescription>Leading influencers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rankings.slice(0, 3).map((influencer, index) => (
              <Card key={influencer.id} className="border-2">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="flex justify-center">
                    {getMedalIcon(index)}
                  </div>
                  <Avatar className="h-20 w-20 mx-auto">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl">
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">
                      {influencer.first_name} {influencer.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{influencer.code}</p>
                  </div>
                  <div className="flex justify-center gap-6">
                    <div>
                      <p className="text-2xl font-bold text-primary">{influencer.points}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{influencer.redemptions}</p>
                      <p className="text-xs text-muted-foreground">Redemptions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full Rankings Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Complete Rankings</CardTitle>
              <CardDescription>All influencer performance data</CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport}>
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Section - Rankings */}
            <div className="space-y-2">
              {rankings.map((influencer, index) => {
                const barWidth = (influencer.points / maxPoints) * 100;
                const isTopThree = index < 3;
                
                return (
                  <div
                    key={influencer.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 text-center font-bold text-lg">
                          #{index + 1}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {influencer.first_name} {influencer.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{influencer.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">{influencer.points}</p>
                          <p className="text-xs text-muted-foreground">Points</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{influencer.redemptions}</p>
                          <p className="text-xs text-muted-foreground">Redemptions</p>
                        </div>
                      </div>
                    </div>
                    {/* Minimal Bar Visualization */}
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden ml-12">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTopThree
                            ? 'bg-primary'
                            : 'bg-secondary/60'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Section - Image Placeholder */}
            <div className="flex items-start justify-center lg:sticky lg:top-6">
              <div 
                className="w-full max-w-md aspect-[4/5] bg-muted rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-4"
                style={{ maxHeight: '600px' }}
              >
                <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Image Placeholder</p>
                  <p className="text-xs text-muted-foreground/70">1200 × 1500 px (Portrait)</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingDashboard;
