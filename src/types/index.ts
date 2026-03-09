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
    username?: string;
    use_nickname?: boolean;
    avatar_url?: string;
    bio?: string;
    institute?: string;
    xp?: number;
    level?: number;
    is_usp_member: boolean;
    entrance_year?: number;
    course?: string;
    whatsapp?: string;
    lattes_url?: string;
    usp_proof_url?: string;
    available_to_mentor: boolean;
    seeking_mentor: boolean;
    education_level?: string;
    external_institution?: string;
    school_year?: string;
    objective?: string;
    interests: string[];
    artistic_interests: string[];
    role: string; // 'user', 'admin', 'moderator'
    is_labdiv: boolean;
    is_visible: boolean;
    is_public: boolean;
    review_status: 'pending' | 'approved' | 'rejected';
    bio_draft?: string;
    completion_year?: number;
    major?: string;
    usp_status?: string;
    has_scholarship: boolean;
    seeking_scholarship: boolean;
    interest_in_team: boolean;
    pending_edits?: any;
    created_at: string;
}

export interface Freshman {
    id: string;
    full_name?: string;
    username?: string;
    use_nickname?: boolean;
    avatar_url?: string;
    course?: string;
    institute?: string;
    entrance_year?: number;
    bio?: string;
    whatsapp?: string;
    email?: string;
    xp?: number;
    level?: number;
    is_labdiv?: boolean;
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
    co_author_ids?: string[];
    use_pseudonym?: boolean;
    event_date?: string;
    location_lat?: number;
    location_lng?: number;
    location_name?: string;
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

// 🏛️ O GRANDE COLISOR (Wiki Schema)
export interface WikiArticle {
    id: string;
    parent_id?: string;
    title: string;
    slug: string;
    content: string;
    technical_metadata: {
        equipment_id?: string;
        lab_room?: string;
        safety_level: number;
    };
    is_stable: boolean;
    author_id?: string;
    created_at: string;
    updated_at: string;
}

export interface WikiCitation {
    id: string;
    source_article_id: string;
    target_article_id: string;
    citation_type: 'reference' | 'equipment' | 'lab' | 'theory';
    created_at: string;
}

// 🛰️ EMARANHAMENTO (Chat)
export interface EntanglementMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    attachment_particle_id?: string;
    attachment_type?: 'particle' | 'article';
    is_read: boolean;
    created_at: string;
}

// ALIASES PARA V3.2.0
export type Particle = Submission;
