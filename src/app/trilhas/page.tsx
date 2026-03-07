import { createServerSupabase } from '@/lib/supabase/server';
import TrilhasClient from './TrilhasClient';

export const revalidate = 0;

export const metadata = {
    title: 'Projeto Síncrotron | IFUSP',
    description: 'Painel de Controle de Trilhas Curriculares do IFUSP.',
};

async function getTrails() {
    const supabase = await createServerSupabase();
    const { data: trails } = await supabase
        .from('learning_trails')
        .select('*')
        .order('excitation_level', { ascending: true });

    if (!trails) return [];

    // Busca contagem de artigos para cada trilha de forma otimizada (evita N+1 e Stack Overflow no Next.js)
    const { data: allSubmissions } = await supabase
        .from('trail_submissions')
        .select('trail_id');

    const countsByTrail: Record<string, number> = {};
    if (allSubmissions) {
        allSubmissions.forEach(sub => {
            countsByTrail[sub.trail_id] = (countsByTrail[sub.trail_id] || 0) + 1;
        });
    }

    const trailsWithStats = trails.map((trail) => {
        return {
            ...trail,
            submissionCount: countsByTrail[trail.id] || 0,
        };
    });

    return trailsWithStats;
}

export default async function TrilhasPage() {
    const trails = await getTrails();
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    let cursandoTrails: any[] = [];
    let completedTrailIds: string[] = [];
    let userProfile: any = null;

    if (user) {
        // Fetch current profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        userProfile = profile;

        // Fetch "Cursando Agora"
        const { data: progress } = await supabase
            .from('user_trail_progress')
            .select('trail_id')
            .eq('user_id', user.id)
            .eq('status', 'cursando');

        if (progress && progress.length > 0) {
            const trailIds = progress.map(p => p.trail_id);
            cursandoTrails = trails.filter(t => trailIds.includes(t.id));
        }

        // Fetch "Já Fiz" (Completed)
        const { data: completed } = await supabase
            .from('user_completed_trails')
            .select('trail_id')
            .eq('user_id', user.id);

        if (completed) {
            completedTrailIds = completed.map(c => c.trail_id);
        }
    }

    return (
        <TrilhasClient
            initialTrails={trails}
            cursandoTrails={cursandoTrails}
            completedTrailIds={completedTrailIds}
            userProfile={userProfile}
        />
    );
}
