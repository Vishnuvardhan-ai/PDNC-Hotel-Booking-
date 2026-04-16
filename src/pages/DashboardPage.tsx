import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileWithInterests, MatchWithProfile } from "@/types";
import { calculateCompatibility } from "@/utils/matching";
import AppNavbar from "@/components/AppNavbar";
import RoommateCard from "@/components/RoommateCard";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<{ profile: ProfileWithInterests; score: number; matchId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<ProfileWithInterests | null>(null);

  useEffect(() => {
    if (!user) return;
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;
    setLoading(true);

    // Load my profile
    const { data: me } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: myInterests } = await supabase
      .from("interests")
      .select("*")
      .eq("user_id", user.id);

    if (!me) {
      setLoading(false);
      return;
    }

    const meWithInterests: ProfileWithInterests = { ...me, interests: myInterests || [] };
    setMyProfile(meWithInterests);

    // Load all other profiles
    const { data: others } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", user.id)
      .eq("profile_complete", true);

    if (!others || others.length === 0) {
      setMatches([]);
      setLoading(false);
      return;
    }

    // Load interests for all
    const otherUserIds = others.map((p) => p.user_id);
    const { data: allInterests } = await supabase
      .from("interests")
      .select("*")
      .in("user_id", otherUserIds);

    // Build profiles with interests
    const othersWithInterests: ProfileWithInterests[] = others.map((p) => ({
      ...p,
      interests: (allInterests || []).filter((i) => i.user_id === p.user_id),
    }));

    // Calculate scores and upsert matches
    const scored = othersWithInterests.map((other) => {
      const score = calculateCompatibility(meWithInterests, other);
      return { profile: other, score };
    });

    // Upsert matches to DB
    for (const s of scored) {
      await supabase.from("matches").upsert(
        {
          user1_id: user.id,
          user2_id: s.profile.user_id,
          compatibility_score: s.score,
        },
        { onConflict: "user1_id,user2_id" }
      );
    }

    // Reload matches from DB for IDs
    const { data: dbMatches } = await supabase
      .from("matches")
      .select("*")
      .eq("user1_id", user.id)
      .neq("status", "skipped");

    const result = scored
      .filter((s) => {
        const m = dbMatches?.find((dm) => dm.user2_id === s.profile.user_id);
        return m && m.status !== "skipped";
      })
      .map((s) => ({
        ...s,
        matchId: dbMatches?.find((dm) => dm.user2_id === s.profile.user_id)?.id || "",
      }))
      .sort((a, b) => b.score - a.score);

    setMatches(result);
    setLoading(false);
  };

  const handleAction = async (matchId: string, status: "liked" | "skipped") => {
    await supabase.from("matches").update({ status }).eq("id", matchId);
    if (status === "liked") toast.success("Liked!");
    setMatches((prev) => prev.filter((m) => status === "liked" || m.matchId !== matchId));
    if (status === "skipped") setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
  };

  const profileIncomplete = myProfile && !myProfile.profile_complete;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Your Matches</h1>
            <p className="text-muted-foreground">Sorted by compatibility score</p>
          </div>
          <Link to="/profile">
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          </Link>
        </div>

        {profileIncomplete && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center mb-8">
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">Complete Your Profile</h3>
            <p className="text-muted-foreground mb-4">Set up your preferences to start finding matches</p>
            <Link to="/profile">
              <Button className="gradient-primary border-0 text-primary-foreground">Set Up Profile</Button>
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold text-foreground mb-2">No matches yet</h3>
            <p className="text-muted-foreground">Check back soon as more people join!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((m) => (
              <RoommateCard
                key={m.matchId}
                profile={m.profile}
                score={m.score}
                matchId={m.matchId}
                onLike={() => handleAction(m.matchId, "liked")}
                onSkip={() => handleAction(m.matchId, "skipped")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
