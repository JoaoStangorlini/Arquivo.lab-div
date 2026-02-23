/**
 * SINGLE SOURCE OF TRUTH: Centralized Type Definitions
 * Hub Lab-Div IF-USP
 */

export type SubmissionStatus = 'pendente' | 'aprovado' | 'rejeitado';
export type MediaType = 'image' | 'video' | 'pdf' | 'text' | 'link' | 'zip' | 'sdocx';

export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    role: 'user' | 'admin';
    created_at: string;
}

export interface Submission {
    id: string;
    user_id?: string;
    title: string;
    authors: string;
    description: string;
    category?: string;
    media_type: MediaType;
    media_url: string;
    status: SubmissionStatus;
    admin_feedback?: string;
    whatsapp?: string;
    external_link?: string;
    technical_details?: string;
    alt_text?: string;
    testimonial?: string;
    is_featured: boolean;
    view_count?: number;
    tags?: string[];
    reading_time?: number;
    event_date?: string;
    location_lat?: number;
    location_lng?: number;
    location_name?: string;
    reactions_summary?: Record<string, number>;
    kudos_total?: number;
    ocr_content?: string;
    ai_suggested_tags?: string[];
    ai_suggested_alt?: string;
    ai_status?: 'pending' | 'processing' | 'completed' | 'error';
    ai_last_processed?: string;
    created_at: string;
}

export interface ReadingHistory {
    id: string;
    user_id: string;
    submission_id: string;
    progress_percent: number;
    last_accessed_at: string;
}

export interface Comment {
    id: string;
    submission_id: string;
    user_id?: string;
    author_name: string;
    content: string;
    status: SubmissionStatus;
    inline_paragraph_id?: string;
    created_at: string;
}

export interface Reproduction {
    id: string;
    submission_id: string;
    user_id: string;
    title?: string;
    text_content: string;
    media_url?: string;
    status: SubmissionStatus;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

export interface Correction {
    id: string;
    user_id: string;
    submission_id: string;
    original_text: string;
    suggested_text: string;
    comment?: string;
    status: 'pendente' | 'aceito' | 'rejeitado';
    created_at: string;
}

export interface PrivateNote {
    id: string;
    user_id: string;
    submission_id: string;
    selection_hash: string;
    note_text: string;
    created_at: string;
}
