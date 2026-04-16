-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  age INTEGER,
  gender TEXT,
  location TEXT DEFAULT '',
  budget INTEGER DEFAULT 500,
  cleanliness TEXT DEFAULT 'moderate' CHECK (cleanliness IN ('very_clean', 'clean', 'moderate', 'relaxed')),
  sleep_schedule TEXT DEFAULT 'flexible' CHECK (sleep_schedule IN ('early_bird', 'night_owl', 'flexible')),
  smoking BOOLEAN DEFAULT false,
  drinking BOOLEAN DEFAULT false,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interests table
CREATE TABLE public.interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_name TEXT NOT NULL,
  UNIQUE(user_id, interest_name)
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility_score INTEGER NOT NULL DEFAULT 0,
  ai_explanation TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'liked', 'skipped', 'mutual')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Interests policies
CREATE POLICY "Interests are viewable by authenticated users"
  ON public.interests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own interests"
  ON public.interests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interests"
  ON public.interests FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view their own matches"
  ON public.matches FOR SELECT TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create matches involving themselves"
  ON public.matches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "Users can update matches they created"
  ON public.matches FOR UPDATE TO authenticated
  USING (auth.uid() = user1_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();