import { ThumbsUp, ThumbsDown, MapPin, Moon, Sun, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMatchColor, getMatchBgColor, getMatchLabel } from "@/utils/matching";
import { ProfileWithInterests } from "@/types";
import { Link } from "react-router-dom";

interface RoommateCardProps {
  profile: ProfileWithInterests;
  score: number;
  matchId: string;
  onLike: () => void;
  onSkip: () => void;
}

const RoommateCard = ({ profile, score, matchId, onLike, onSkip }: RoommateCardProps) => {
  const scheduleIcon = profile.sleep_schedule === "early_bird" ? Sun : Moon;
  const ScheduleIcon = scheduleIcon;

  return (
    <div className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-heading text-xl font-bold text-card-foreground">{profile.name || "Anonymous"}</h3>
            {profile.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </div>
            )}
            {profile.age && (
              <p className="text-sm text-muted-foreground">Age {profile.age}</p>
            )}
          </div>
          <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl ${getMatchBgColor(score)} text-primary-foreground`}>
            <span className="text-xl font-bold">{score}%</span>
          </div>
        </div>

        <Badge variant="secondary" className="mb-3">
          <Sparkles className="h-3 w-3 mr-1" />
          {getMatchLabel(score)}
        </Badge>

        <div className="flex flex-wrap gap-2 mb-4 text-xs text-muted-foreground">
          {profile.sleep_schedule && (
            <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-full">
              <ScheduleIcon className="h-3 w-3" />
              {profile.sleep_schedule === "early_bird" ? "Early Bird" : profile.sleep_schedule === "night_owl" ? "Night Owl" : "Flexible"}
            </span>
          )}
          {profile.cleanliness && (
            <span className="bg-secondary px-2 py-1 rounded-full capitalize">
              {profile.cleanliness.replace("_", " ")}
            </span>
          )}
          {profile.budget && (
            <span className="bg-secondary px-2 py-1 rounded-full">${profile.budget}/mo</span>
          )}
        </div>

        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {profile.interests.slice(0, 4).map((i) => (
              <Badge key={i.id} variant="outline" className="text-xs">
                {i.interest_name}
              </Badge>
            ))}
            {profile.interests.length > 4 && (
              <Badge variant="outline" className="text-xs">+{profile.interests.length - 4}</Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onSkip}>
            <ThumbsDown className="h-4 w-4 mr-1" /> Skip
          </Button>
          <Button size="sm" className="flex-1 gradient-primary border-0 text-primary-foreground" onClick={onLike}>
            <ThumbsUp className="h-4 w-4 mr-1" /> Like
          </Button>
          <Link to={`/match/${matchId}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoommateCard;
