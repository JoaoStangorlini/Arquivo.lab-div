const SUPABASE_URL = "https://bqszadfunqgtfpaorwvx.supabase.co";
const SUPABASE_KEY = "sb_publishable_xQINQGX7-gqwgXHqOF0RWw_ZebOhOoI";

async function test() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/submissions?select=id,title,description,authors,media_type,media_url,category,is_featured,external_link,created_at,technical_details,alt_text,tags,views,reading_time,like_count&limit=1`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

test();
