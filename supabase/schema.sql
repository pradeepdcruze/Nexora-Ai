-- Nexora AI Supabase Migration Schema
-- Run this script in your Supabase SQL Editor to set up tables, RLS, and seed data.

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------
-- 1. PROFILES TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    headline TEXT DEFAULT 'Early Career Professional | Aspiring Software Engineer',
    bio TEXT,
    phone TEXT,
    career_goal TEXT DEFAULT 'Land a Full-Stack Engineering role at a high-growth Tech SaaS company',
    target_roles TEXT[] DEFAULT ARRAY['Junior Software Engineer', 'Full-Stack Developer', 'Frontend Developer'],
    location TEXT DEFAULT 'San Francisco, CA (Open to Remote)',
    education TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    theme TEXT DEFAULT 'dark',
    skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-------------------------------------------------------
-- 2. RESUMES TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT,
    raw_text TEXT,
    parsed_data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'parsed' CHECK (status IN ('uploading', 'parsing', 'parsed', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own resumes" 
    ON public.resumes FOR ALL 
    USING (auth.uid() = user_id);

-------------------------------------------------------
-- 3. SKILLS TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Technical' CHECK (category IN ('Technical', 'Behavioral', 'Domain', 'Tools', 'Soft Skills')),
    proficiency INT CHECK (proficiency BETWEEN 0 AND 100),
    confidence INT CHECK (confidence BETWEEN 0 AND 100),
    source TEXT DEFAULT 'resume' CHECK (source IN ('resume', 'quiz', 'interview', 'manual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their skills" 
    ON public.skills FOR ALL 
    USING (auth.uid() = user_id);

-------------------------------------------------------
-- 4. QUIZ ATTEMPTS TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_type TEXT NOT NULL,
    score INT NOT NULL,
    answers JSONB DEFAULT '[]'::jsonb,
    insights TEXT[] DEFAULT ARRAY[]::TEXT[],
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their quiz attempts" 
    ON public.quiz_attempts FOR ALL 
    USING (auth.uid() = user_id);

-------------------------------------------------------
-- 5. INTERVIEW SESSIONS TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interview_type TEXT NOT NULL CHECK (interview_type IN ('HR', 'Behavioral', 'Technical', 'Role-specific')),
    target_role TEXT NOT NULL DEFAULT 'Software Engineer',
    difficulty TEXT DEFAULT 'Intermediate' CHECK (difficulty IN ('Entry Level', 'Intermediate', 'Advanced', 'Senior')),
    questions JSONB DEFAULT '[]'::jsonb,
    answers JSONB DEFAULT '[]'::jsonb,
    scores JSONB DEFAULT '{"overall": 0, "technical": 0, "communication": 0, "confidence": 0, "grammar": 0, "completeness": 0, "problem_solving": 0}'::jsonb,
    feedback JSONB DEFAULT '{}'::jsonb,
    overall_score INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their interview sessions" 
    ON public.interview_sessions FOR ALL 
    USING (auth.uid() = user_id);

-------------------------------------------------------
-- 5B. INTERVIEW ANSWERS TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interview_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_index INT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    evaluation JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their interview answers" 
    ON public.interview_answers FOR ALL 
    USING (auth.uid() = user_id);

-------------------------------------------------------
-- 5C. INTERVIEW SCORES TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interview_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    technical INT DEFAULT 0,
    communication INT DEFAULT 0,
    confidence INT DEFAULT 0,
    grammar INT DEFAULT 0,
    completeness INT DEFAULT 0,
    problem_solving INT DEFAULT 0,
    overall INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.interview_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their interview scores" 
    ON public.interview_scores FOR ALL 
    USING (auth.uid() = user_id);

-------------------------------------------------------
-- 5D. CAREER TWIN TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_twin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    completion_score INT DEFAULT 0,
    interview_readiness INT DEFAULT 0,
    communication_score INT DEFAULT 50,
    confidence_score INT DEFAULT 50,
    technical_score INT DEFAULT 50,
    skill_confidence INT DEFAULT 50,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.career_twin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their career twin record" 
    ON public.career_twin FOR ALL 
    USING (auth.uid() = user_id);

-------------------------------------------------------
-- 6. OPPORTUNITIES TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    employment_type TEXT DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote')),
    description TEXT NOT NULL,
    required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public read access for opportunities catalog
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to opportunities" 
    ON public.opportunities FOR SELECT 
    USING (true);

-------------------------------------------------------
-- 7. OPPORTUNITY MATCHES TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunity_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    match_score INT NOT NULL CHECK (match_score BETWEEN 0 AND 100),
    matching_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    missing_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.opportunity_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their opportunity matches" 
    ON public.opportunity_matches FOR ALL 
    USING (auth.uid() = user_id);

-------------------------------------------------------
-- 8. PROGRESS SNAPSHOTS TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.progress_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    career_twin_score INT NOT NULL,
    interview_readiness INT NOT NULL,
    skill_metrics JSONB DEFAULT '{}'::jsonb,
    snapshot_date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.progress_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their progress snapshots" 
    ON public.progress_snapshots FOR ALL 
    USING (auth.uid() = user_id);

-------------------------------------------------------
-- SEED DATA FOR DEMO OPPORTUNITIES
-------------------------------------------------------
INSERT INTO public.opportunities (id, title, company, location, employment_type, description, required_skills)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Junior Software Engineer', 'Nexus Systems', 'San Francisco, CA (Hybrid)', 'Full-time', 'Build modern web applications using React, TypeScript, and Node.js.', ARRAY['React', 'TypeScript', 'Node.js', 'Git', 'REST APIs']),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Data Analyst', 'CloudAnalytics Inc', 'New York, NY (Remote)', 'Full-time', 'Analyze product usage telemetry, create dashboards, and write optimized SQL queries.', ARRAY['SQL', 'Python', 'Data Visualization', 'Statistics', 'Tableau']),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Product Associate', 'Aura Labs', 'Austin, TX', 'Full-time', 'Collaborate with engineering and design to define product requirements and sprint goals.', ARRAY['Product Strategy', 'Agile/Scrum', 'User Research', 'Wireframing', 'Data Analysis']),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Frontend Developer', 'Vortex AI', 'Boston, MA (Remote)', 'Full-time', 'Craft ultra-responsive Next.js web applications with modern design systems.', ARRAY['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Web Vitals']),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'AI Engineering Intern', 'Synthetic Labs', 'Seattle, WA', 'Internship', 'Work alongside senior researchers fine-tuning LLM pipelines and embedding indices.', ARRAY['Python', 'PyTorch', 'Vector DBs', 'FastAPI', 'Machine Learning']);
