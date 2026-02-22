import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
    const { data, error } = await supabase
        .from('submissions')
        .select('id, title, description, authors, media_type, media_url, category, is_featured, external_link, created_at, technical_details, alt_text, tags, views, reading_time, like_count')
        .limit(1);

    console.log('Error:', error);
}

test();
