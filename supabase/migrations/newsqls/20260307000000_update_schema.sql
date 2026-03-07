-- Migration: Add category_map column
ALTER TABLE learning_trails ADD COLUMN IF NOT EXISTS category_map JSONB DEFAULT '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb;
