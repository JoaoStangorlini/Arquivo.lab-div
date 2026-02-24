/* MIGRATION: Add use_pseudonym to submissions
  DESCRIPTION: Supports the Intelligent Authorship feature with pseudonym tracking.
*/

ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS use_pseudonym BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.submissions.use_pseudonym IS 'Flag to indicate if the author name is a pseudonym (limited to 2 per user).';
