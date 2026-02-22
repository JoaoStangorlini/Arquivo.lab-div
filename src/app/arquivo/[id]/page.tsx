import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ShareButtons } from './ShareButtons';
import { ExportPDFButton } from './ExportPDFButton';
import { CommentsSection, Comment } from './CommentsSection';
import { ReproductionSection } from './ReproductionSection';
import { ImageCarouselClient } from './ImageCarouselClient';
import { fetchReproductionsBySubmission } from '@/app/actions/reproductions';
import { getDownloadUrl, parseMediaUrl, formatYoutubeUrl } from '@/lib/media-utils';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import { MarkdownImage } from '@/components/reading/MarkdownImageLightbox';
import { ViewTracker } from '@/components/ViewTracker';
import { ReadingExperienceProvider } from '@/components/reading/ReadingExperienceProvider';
import { ReadingViewManager } from '@/components/reading/ReadingViewManager';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getSubmission(id: string) {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .eq('status', 'aprovado')
        .single();

    if (error || !data) return null;
    return data;
}

async function getRelatedSubmissions(categoryId: string, currentSubmissionId: string) {
    if (!categoryId) return [];

    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'aprovado')
        .eq('category', categoryId)
        .neq('id', currentSubmissionId)
        .order('created_at', { ascending: false })
        .limit(3);

    if (error || !data) return [];
    return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const submission = await getSubmission(id);

    if (!submission) {
        return { title: 'Submissão não encontrada' };
    }

    const mediaUrls = Array.isArray(submission.media_url) ? submission.media_url : [submission.media_url];
    const firstImage = mediaUrls[0] || '';

    return {
        title: `${submission.title} — Hub Lab-Div`,
        description: submission.description || `Por ${submission.authors}`,
        openGraph: {
            title: submission.title,
            description: submission.description || `Submissão de ${submission.authors} no Hub de Comunicação Científica do Lab-Div`,
            images: submission.media_type === 'image' && firstImage ? [{ url: firstImage }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: submission.title,
            description: submission.description || `Por ${submission.authors}`,
            images: submission.media_type === 'image' && firstImage ? [firstImage] : [],
        },
    };
}

// Utility functions moved to @/lib/media-utils.ts

export default async function ArquivoItemPage({ params }: PageProps) {
    const { id } = await params;
    const submission = await getSubmission(id);

    if (!submission) {
        notFound();
    }

    const urls = parseMediaUrl(submission.media_url);
    const relatedSubmissions = await getRelatedSubmissions(submission.category, submission.id);

    // Fetch likes for related submissions
    let likeMap: Record<string, number> = {};
    if (relatedSubmissions.length > 0) {
        const subIds = relatedSubmissions.map(s => s.id);
        const { data: likes } = await supabase
            .from('curtidas')
            .select('submission_id')
            .in('submission_id', subIds);

        if (likes) {
            likes.forEach(l => {
                likeMap[l.submission_id] = (likeMap[l.submission_id] || 0) + 1;
            });
        }
    }

    // Fetch reproductions
    const routeReproductions = await fetchReproductionsBySubmission(submission.id);

    // Fetch comments
    const { data: routeComments } = await supabase
        .from('comments')
        .select('*')
        .eq('submission_id', submission.id)
        .eq('status', 'aprovado')
        .order('created_at', { ascending: false });

    return (
        <ReadingExperienceProvider>
            <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
                <Header />

                <ReadingViewManager submission={submission}>
                    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                        <ViewTracker submissionId={id} />

                        {/* ─── Card de Introdução ao Índice (Hierarquia: 2º após Fogo) ─── */}
                        {submission.description && submission.description.length > 500 && (
                            <div className="mb-6 bg-white dark:bg-card-dark rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#0055ff]/10 text-[#0055ff] shrink-0">
                                    <span className="material-symbols-outlined text-2xl">format_list_bulleted</span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Este artigo possui um índice estruturado</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Use o botão <span className="inline-flex items-center align-middle mx-0.5 px-1.5 py-0.5 bg-[#0055ff]/10 text-[#0055ff] rounded text-[10px] font-bold">≡</span> no topo direito para navegar entre as seções.</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-card-dark rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">

                            {/* Media Section - skip for text/zip/sdocx */}
                            {submission.media_type !== 'text' && submission.media_type !== 'zip' && submission.media_type !== 'sdocx' && (
                                <div className="bg-black flex items-center justify-center min-h-[300px] md:min-h-[500px]">
                                    {submission.media_type === 'video' ? (
                                        urls.length > 0 ? (
                                            <iframe
                                                src={formatYoutubeUrl(urls[0])}
                                                className="w-full aspect-video"
                                                allowFullScreen
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                        ) : (
                                            <span className="text-white">Vídeo não encontrado</span>
                                        )
                                    ) : (
                                        <ImageCarouselClient urls={urls} title={submission.title} />
                                    )}
                                </div>
                            )}

                            {/* Details Section */}
                            <div className="p-6 md:p-10 space-y-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    {submission.category && (
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold tracking-wide uppercase">
                                            {submission.category}
                                        </span>
                                    )}
                                    {submission.is_featured && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-brand-red to-brand-yellow text-white rounded-full text-xs font-bold tracking-wide uppercase">
                                            Destaque
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white leading-tight">
                                    {submission.title}
                                </h1>

                                <div className="flex items-center gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
                                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary dark:text-blue-400 font-bold text-sm uppercase shrink-0">
                                        {submission.authors.substring(0, 2)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Autore(s)</span>
                                        <span className="text-base font-bold text-gray-900 dark:text-white">{submission.authors}</span>

                                        {submission.co_authors && Array.isArray(submission.co_authors) && submission.co_authors.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {submission.co_authors.map((co: any, idx: number) => (
                                                    <span key={idx} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                                        {co.full_name} {co.email && `(${co.email})`}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {submission.description && (
                                    <div id="submission-content" className="mt-8">
                                        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Descrição</h2>
                                        <div className="text-gray-600 dark:text-gray-400 leading-relaxed prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-200 prose-a:text-brand-blue prose-img:rounded-xl overflow-x-auto">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeSanitize, rehypeKatex]}
                                                components={{
                                                    p: ({ node, ...props }) => {
                                                        const id = `p-${node?.position?.start.line}`;
                                                        return <p data-block-id={id} {...props} />;
                                                    },
                                                    h1: ({ node, ...props }) => <h1 data-block-id={`h1-${node?.position?.start.line}`} {...props} />,
                                                    h2: ({ node, ...props }) => <h2 data-block-id={`h2-${node?.position?.start.line}`} {...props} />,
                                                    h3: ({ node, ...props }) => <h3 data-block-id={`h3-${node?.position?.start.line}`} {...props} />,
                                                    blockquote: ({ node, ...props }) => <blockquote data-block-id={`bq-${node?.position?.start.line}`} {...props} />,
                                                    img: (props) => <MarkdownImage {...props} />,
                                                }}
                                            >
                                                {submission.description}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}

                                {/* Download and Security Notice */}
                                {(submission.media_type === 'image' || submission.media_type === 'pdf' || submission.media_type === 'zip' || submission.media_type === 'sdocx') && urls.length > 0 && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 dark:bg-background-dark/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <a
                                            href={getDownloadUrl(urls[0])}
                                            className="px-6 py-2.5 bg-brand-blue hover:bg-brand-darkBlue text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">download</span>
                                            Baixar arquivo
                                        </a>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-brand-green text-[20px]">verified_user</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                Segurança: Arquivo verificado contra vírus pela curadoria administrativa.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Share & Export Buttons */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <ShareButtons title={submission.title} id={submission.id} />
                                    <ExportPDFButton />
                                </div>

                                {/* Eu Reproduzi! Section */}
                                <ReproductionSection
                                    submissionId={submission.id}
                                    submissionTitle={submission.title}
                                    initialReproductions={routeReproductions}
                                />

                                {/* Interactive Comments */}
                                <CommentsSection
                                    submissionId={submission.id}
                                    submissionTitle={submission.title}
                                    initialComments={(routeComments as Comment[]) || []}
                                />
                            </div>
                        </div>

                        {/* Related Materials Section */}
                        {relatedSubmissions.length > 0 && (
                            <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-12">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Materiais Relacionados</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Outras submissões aprovadas na categoria <span className="font-semibold text-brand-blue">{submission.category}</span></p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {relatedSubmissions.map(rel => {
                                        const relUrls = parseMediaUrl(rel.media_url);
                                        const thumb = rel.media_type === 'video' ? formatYoutubeUrl(relUrls[0] || '') : (relUrls[0] || ''); // fallback
                                        return (
                                            <a key={rel.id} href={`/arquivo/${rel.id}`} className="group block bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                                <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                                                    {rel.media_type === 'video' ? (
                                                        <div className="w-full h-full flex items-center justify-center bg-black">
                                                            <span className="material-symbols-outlined text-4xl text-white/50">play_circle</span>
                                                        </div>
                                                    ) : rel.media_type === 'text' ? (
                                                        <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                                                            <span className="material-symbols-outlined text-4xl text-brand-blue/50">article</span>
                                                        </div>
                                                    ) : (
                                                        <img src={typeof thumb === 'string' && thumb ? thumb.replace(/\.pdf$/i, '.jpg') : '/placeholder.jpg'} alt={rel.alt_text || rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand-blue transition-colors">{rel.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide truncate">{rel.authors}</p>
                                                </div>
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </main>
                </ReadingViewManager>

                <Footer />
            </div>
        </ReadingExperienceProvider>
    );
}
