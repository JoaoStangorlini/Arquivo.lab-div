import { supabase } from '@/lib/supabase';
import { TimelineView } from '@/components/timeline/TimelineView';
import { Submission } from '@/types';

export const metadata = {
    title: 'Linha do Tempo | Hub Lab-Div',
    description: 'Explore a trajetória histórica dos laboratórios do IF-USP.',
};

export default async function TimelinePage() {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'aprovado')
        .order('event_date', { ascending: false, nullsFirst: false });

    if (error) {
        console.error('Error fetching timeline data:', error);
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Erro ao carregar a linha do tempo.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#121212] pt-20 pb-20">
            <TimelineView submissions={submissions as Submission[]} />
        </main>
    );
}
