import { z } from 'zod';

// Core Submission Schema
export const SubmissionSchema = z.object({
    title: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(100),
    description: z.string().min(10, "Descrição muito curta").max(2000),
    category: z.string().min(1, "Categoria é obrigatória"),
    authors: z.string().min(2, "Autores são obrigatórios"),
    media_type: z.enum(['image', 'video', 'pdf', 'text', 'link', 'zip', 'sdocx']),
    media_url: z.string().min(1, "URL de mídia é obrigatória"), // Can be JSON string or single URL
    video_url: z.string().optional().nullable(),
    tags: z.array(z.string()).max(10, "Máximo de 10 tags permitidas").default([]),
    location_name: z.string().optional().nullable(),
    location_lat: z.number().optional().nullable(),
    location_lng: z.number().optional().nullable(),
    event_date: z.string().optional().nullable(),
    whatsapp: z.string().optional().nullable(),
    external_link: z.string().optional().nullable(),
    technical_details: z.string().optional().nullable(),
    alt_text: z.string().optional().nullable(),
    testimonial: z.string().optional().nullable(),
    reading_time: z.number().optional().nullable(),
    co_authors: z.array(z.any()).default([]), // jsonb
    use_pseudonym: z.boolean().optional(),
    event_year: z.string().optional().nullable(),
    pseudonym_id: z.string().uuid().optional().nullable(),
    new_pseudonym: z.string().max(30).optional().nullable(),
    read_guide: z.boolean().optional(),
    accepted_cc: z.boolean().optional(),
    quiz: z.array(z.any()).default([]), // jsonb: [{id, question, options, correct_option}]
});

// Reaction/Engagement Schema
export const ReactionSchema = z.object({
    submission_id: z.string().uuid(),
    reaction_type: z.string().min(1),
});

// Atomic Reaction Schema
export const AtomicReactionSchema = z.object({
    submission_id: z.string().uuid(),
    profile_id: z.string().uuid(),
});

// Analytics Query Schema
export const AnalyticsQuerySchema = z.object({
    timeframe: z.enum(['day', 'week', 'month', 'year']).default('month'),
    metric: z.string().optional(),
});

// Admin Bulk Action Schema
export const BulkActionSchema = z.object({
    ids: z.array(z.string().uuid()).min(1),
    action: z.enum(['approve', 'reject', 'delete', 'tag']),
    payload: z.any().optional(),
});
