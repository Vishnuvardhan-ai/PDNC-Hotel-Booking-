import { ProfileWithInterests } from "@/types";

export function calculateCompatibility(user: ProfileWithInterests, other: ProfileWithInterests): number {
  let score = 0;

  // Budget (30%) — closer budgets = higher score
  if (user.budget && other.budget) {
    const budgetDiff = Math.abs(user.budget - other.budget);
    const maxBudget = Math.max(user.budget, other.budget, 1);
    const budgetScore = Math.max(0, 1 - budgetDiff / maxBudget);
    score += budgetScore * 30;
  } else {
    score += 15; // neutral
  }

  // Sleep schedule (25%)
  if (user.sleep_schedule && other.sleep_schedule) {
    if (user.sleep_schedule === other.sleep_schedule) {
      score += 25;
    } else if (user.sleep_schedule === "flexible" || other.sleep_schedule === "flexible") {
      score += 18;
    } else {
      score += 5;
    }
  } else {
    score += 12;
  }

  // Cleanliness (15%)
  if (user.cleanliness && other.cleanliness) {
    const levels = ["relaxed", "moderate", "clean", "very_clean"];
    const diff = Math.abs(levels.indexOf(user.cleanliness) - levels.indexOf(other.cleanliness));
    score += Math.max(0, 15 - diff * 5);
  } else {
    score += 8;
  }

  // Habits - smoking & drinking (15%)
  let habitScore = 0;
  if (user.smoking === other.smoking) habitScore += 7.5;
  else habitScore += 2;
  if (user.drinking === other.drinking) habitScore += 7.5;
  else habitScore += 3;
  score += habitScore;

  // Interests overlap (15%)
  if (user.interests.length > 0 && other.interests.length > 0) {
    const userInterests = new Set(user.interests.map(i => i.interest_name.toLowerCase()));
    const overlap = other.interests.filter(i => userInterests.has(i.interest_name.toLowerCase())).length;
    const total = new Set([
      ...user.interests.map(i => i.interest_name.toLowerCase()),
      ...other.interests.map(i => i.interest_name.toLowerCase()),
    ]).size;
    score += (overlap / total) * 15;
  } else {
    score += 5;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function getMatchColor(score: number): string {
  if (score >= 80) return "text-match-excellent";
  if (score >= 60) return "text-match-good";
  if (score >= 40) return "text-match-fair";
  return "text-match-poor";
}

export function getMatchBgColor(score: number): string {
  if (score >= 80) return "bg-match-excellent";
  if (score >= 60) return "bg-match-good";
  if (score >= 40) return "bg-match-fair";
  return "bg-match-poor";
}

export function getMatchLabel(score: number): string {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Fair Match";
  return "Low Match";
}
