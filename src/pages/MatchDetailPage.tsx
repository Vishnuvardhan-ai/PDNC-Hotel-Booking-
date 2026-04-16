import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileWithInterests } from "@/types";
import { calculateCompatibility, getMatchBgColor, getMatchLabel } from "@/utils/matching";
import AppNavbar from "@/components/AppNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Moon, Sun, DollarSign, Sparkles, Cigarette, Wine } from "lucide-react";

const MatchDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [match, setMatch] = useState<{ profile: ProfileWithInterests; score: number; explanation: string | null } | null>(null);
  const [myProfile, setMyProfile] = useState<ProfileWithInterests | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    load();
  }, [user, id]);

  const load = async () => {
    if (!user || !id) return;
    setLoading(true);

    const { data: matchData } = await supabase.from("matches").select("*").eq("id", id).single();
    if (!matchData) { setLoading(false); return; }

    const otherId = matchData.user1_id === user.id ? matchData.user2_id : matchData.user1_id;

    const [{ data: otherProfile }, { data: otherInterests }, { data: meProfile }, { data: meInterests }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", otherId).single(),
      supabase.from("interests").select("*").eq("user_id", otherId),
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("interests").select("*").eq("user_id", user.id),
    ]);

    if (otherProfile && meProfile) {
      const other: ProfileWithInterests = { ...otherProfile, interests: otherInterests || [] };
      const me: ProfileWithInterests = { ...meProfile, interests: meInterests || [] };
      setMyProfile(me);
      setMatch({
        profile: other,
        score: matchData.compatibility_score,
        explanation: matchData.ai_explanation,
      });
    }
    setLoading(false);
  };

  const generateExplanation = async () => {
    if (!match || !myProfile || !id) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-explain", {
        body: { myProfile, otherProfile: match.profile, score: match.score },
      });

      if (error) throw error;

      const explanation = data?.explanation || "You two seem like a great match based on your shared preferences!";

      await supabase.from("matches").update({ ai_explanation: explanation }).eq("id", id);
      setMatch((prev) => prev ? { ...prev, explanation } : null);
    } catch (e) {
      console.error(e);
    }
    setAiLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Match not found</p>
          <Link to="/dashboard"><Button variant="outline" className="mt-4">Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const p = match.profile;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Matches
        </Link>

        <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-card-foreground">{p.name || "Anonymous"}</h1>
              {p.location && <p className="text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-4 w-4" /> {p.location}</p>}
              {p.age && <p className="text-sm text-muted-foreground">Age {p.age}</p>}
            </div>
            <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl ${getMatchBgColor(match.score)} text-primary-foreground`}>
              <span className="text-2xl font-bold">{match.score}%</span>
              <span className="text-xs">{getMatchLabel(match.score)}</span>
            </div>
          </div>

          {p.bio && <p className="text-foreground mb-6">{p.bio}</p>}

          <h3 className="font-heading text-lg font-bold text-card-foreground mb-3">Compatibility Breakdown</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 bg-secondary rounded-xl p-3">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="text-sm font-medium text-secondary-foreground">${p.budget}/mo</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-secondary rounded-xl p-3">
              {p.sleep_schedule === "early_bird" ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
              <div>
                <p className="text-xs text-muted-foreground">Sleep</p>
                <p className="text-sm font-medium text-secondary-foreground capitalize">{p.sleep_schedule?.replace("_", " ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-secondary rounded-xl p-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Cleanliness</p>
                <p className="text-sm font-medium text-secondary-foreground capitalize">{p.cleanliness?.replace("_", " ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-secondary rounded-xl p-3">
              <div className="flex gap-1">
                <Cigarette className={`h-4 w-4 ${p.smoking ? "text-destructive" : "text-muted-foreground"}`} />
                <Wine className={`h-4 w-4 ${p.drinking ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Habits</p>
                <p className="text-sm font-medium text-secondary-foreground">
                  {p.smoking ? "Smokes" : "Non-smoker"} · {p.drinking ? "Drinks" : "Non-drinker"}
                </p>
              </div>
            </div>
          </div>

          {p.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="font-heading text-lg font-bold text-card-foreground mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {p.interests.map((i) => (
                  <Badge key={i.id} variant="outline">{i.interest_name}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-heading text-lg font-bold text-card-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> AI Explanation
            </h3>
            {match.explanation ? (
              <p className="text-foreground bg-primary/5 rounded-xl p-4 italic">"{match.explanation}"</p>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-3">Get an AI-generated explanation of your compatibility</p>
                <Button
                  onClick={generateExplanation}
                  disabled={aiLoading}
                  className="gradient-primary border-0 text-primary-foreground"
                >
                  {aiLoading ? "Generating..." : "Generate Explanation"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailPage;
