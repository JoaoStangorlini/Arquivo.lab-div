-- Migration: Bifurcation of Profiles (USP vs Curioso)
-- Description: Adds fields for Curiosos (external users) who don't have an IF-USP course/institute.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS education_level text,
ADD COLUMN IF NOT EXISTS external_institution text;
