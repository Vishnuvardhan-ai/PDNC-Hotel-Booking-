import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AppNavbar from "@/components/AppNavbar";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState(500);
  const [cleanliness, setCleanliness] = useState("moderate");
  const [sleepSchedule, setSleepSchedule] = useState("flexible");
  const [smoking, setSmoking] = useState(false);
  const [drinking, setDrinking] = useState(false);
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setName(profile.name || "");
        setAge(profile.age || "");
        setLocation(profile.location || "");
        setBudget(profile.budget || 500);
        setCleanliness(profile.cleanliness || "moderate");
        setSleepSchedule(profile.sleep_schedule || "flexible");
        setSmoking(profile.smoking || false);
        setDrinking(profile.drinking || false);
        setBio(profile.bio || "");
      }

      const { data: ints } = await supabase
        .from("interests")
        .select("interest_name")
        .eq("user_id", user.id);

      if (ints) setInterests(ints.map((i) => i.interest_name));
    };
    load();
  }, [user]);

  const addInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !interests.includes(trimmed) && interests.length < 10) {
      setInterests([...interests, trimmed]);
      setInterestInput("");
    }
  };

  const removeInterest = (name: string) => {
    setInterests(interests.filter((i) => i !== name));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        name: name.trim(),
        age: age || null,
        location: location.trim(),
        budget,
        cleanliness,
        sleep_schedule: sleepSchedule,
        smoking,
        drinking,
        bio: bio.trim(),
        profile_complete: true,
      })
      .eq("user_id", user.id);

    if (profileError) {
      toast.error("Failed to save profile");
      setLoading(false);
      return;
    }

    // Sync interests
    await supabase.from("interests").delete().eq("user_id", user.id);
    if (interests.length > 0) {
      await supabase.from("interests").insert(
        interests.map((name) => ({ user_id: user.id, interest_name: name }))
      );
    }

    setLoading(false);
    toast.success("Profile saved!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Set Up Your Profile</h1>
        <p className="text-muted-foreground mb-8">Help us find your perfect roommate match</p>

        <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <Label>Age</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")} placeholder="25" min={16} max={99} />
            </div>
          </div>

          <div>
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
          </div>

          <div>
            <Label>Monthly Budget: ${budget}</Label>
            <Slider value={[budget]} onValueChange={([v]) => setBudget(v)} min={100} max={3000} step={50} className="mt-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$100</span><span>$3,000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Cleanliness</Label>
              <Select value={cleanliness} onValueChange={setCleanliness}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_clean">Very Clean</SelectItem>
                  <SelectItem value="clean">Clean</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sleep Schedule</Label>
              <Select value={sleepSchedule} onValueChange={setSleepSchedule}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="early_bird">Early Bird</SelectItem>
                  <SelectItem value="night_owl">Night Owl</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <Switch checked={smoking} onCheckedChange={setSmoking} />
              <Label>Smoker</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={drinking} onCheckedChange={setDrinking} />
              <Label>Drinks</Label>
            </div>
          </div>

          <div>
            <Label>Interests</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="Type an interest..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
              />
              <Button type="button" variant="secondary" onClick={addInterest}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {interests.map((i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {i}
                  <button onClick={() => removeInterest(i)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell potential roommates about yourself..."
              className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={500}
            />
          </div>

          <Button className="w-full gradient-primary border-0 text-primary-foreground" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save & Find Matches"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
