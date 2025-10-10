import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, User, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RankingData {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  points: number;
  redemptions: number;
}

const RankingDashboard = () => {
  // Mock data - will be replaced with real data from backend
  const rankings: RankingData[] = [
    { id: "1", firstName: "Sarah", lastName: "Johnson", code: "INF-001", points: 156, redemptions: 156 },
    { id: "2", firstName: "Mike", lastName: "Chen", code: "INF-002", points: 142, redemptions: 142 },
    { id: "3", firstName: "Emma", lastName: "Davis", code: "INF-003", points: 128, redemptions: 128 },
    { id: "4", firstName: "James", lastName: "Wilson", code: "INF-004", points: 95, redemptions: 95 },
    { id: "5", firstName: "Lisa", lastName: "Anderson", code: "INF-005", points: 87, redemptions: 87 },
    { id: "6", firstName: "Tom", lastName: "Brown", code: "INF-006", points: 72, redemptions: 72 },
    { id: "7", firstName: "Amy", lastName: "Taylor", code: "INF-007", points: 64, redemptions: 64 },
    { id: "8", firstName: "Chris", lastName: "Lee", code: "INF-008", points: 58, redemptions: 58 },
    { id: "9", firstName: "Maria", lastName: "Garcia", code: "INF-009", points: 51, redemptions: 51 },
    { id: "10", firstName: "David", lastName: "Martinez", code: "INF-010", points: 45, redemptions: 45 },
  ];

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
    // Mock export functionality
    const csv = [
      ["Rank", "Name", "Code", "Points", "Redemptions"],
      ...rankings.map((r, i) => [
        i + 1,
        `${r.firstName} ${r.lastName}`,
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
    a.download = "influencer-rankings.csv";
    a.click();
  };

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
                      {influencer.firstName} {influencer.lastName}
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
                            {influencer.firstName} {influencer.lastName}
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
