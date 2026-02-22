'use client';

import { useState } from 'react';
import { addComment } from '@/app/actions/comments';
import { triggerNotification } from '@/lib/notifications';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';

export interface Comment {
    id: string;
    author_name: string;
    content: string;
    created_at: string;
    inline_paragraph_id?: string;
}

export function CommentsSection({ submissionId, submissionTitle, initialComments }: { submissionId: string, submissionTitle: string, initialComments: Comment[] }) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [filterParagraph, setFilterParagraph] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsSubmitting(true);

        try {
            let finalContent = content;

            // Handle image upload if a file is selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

                if (cloudName && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
                    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!res.ok) throw new Error('Falha ao enviar a imagem.');
                    const data = await res.json();

                    // Optimize Cloudinary URL
                    const urlParts = data.secure_url.split('/upload/');
                    const finalUrl = urlParts.length === 2
                        ? `${urlParts[0]}/upload/f_auto,q_auto/${urlParts[1]}`
                        : data.secure_url;

                    // Append image as Markdown
                    finalContent += `\n\n![Imagem anexada](${finalUrl})`;
                } else {
                    console.warn("Cloudinary env vars missing. Skipping image upload.");
                }
            }

            await addComment(submissionId, name, finalContent, filterParagraph || undefined);

            // Send notification
            triggerNotification({
                type: 'comment',
                userName: name,
                submissionTitle: submissionTitle,
                content: finalContent
            });

            setSuccessMsg('Seu comentário foi enviado com sucesso e será publicado após uma breve moderação da equipe.');
            setName('');
            setContent('');
            setSelectedFile(null);
        } catch (err: any) {
            setError(err.message || 'Erro ao publicar comentário.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredComments = filterParagraph
        ? comments.filter(c => c.inline_paragraph_id === filterParagraph)
        : comments;

    return (
        <div id="comments-section" className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-brand-blue">forum</span>
                    Comentários Acadêmicos
                </h3>

                {/* Inline Filter Toggle */}
                {comments.some(c => c.inline_paragraph_id) && (
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                            onClick={() => setFilterParagraph(null)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!filterParagraph ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => {
                                // This is a bit tricky without a specific selection, but let's show unique IDs found
                                const firstInline = comments.find(c => c.inline_paragraph_id)?.inline_paragraph_id;
                                if (firstInline) setFilterParagraph(firstInline);
                            }}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filterParagraph ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Em Linha
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-card-dark/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 mb-10">
                {error && <div className="mb-4 text-sm text-red-500 font-bold">{error}</div>}
                {successMsg && (
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            {successMsg}
                        </div>
                    </div>
                )}

                {filterParagraph && (
                    <div className="mb-4 flex items-center justify-between bg-brand-blue/10 border border-brand-blue/20 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-brand-blue">
                            <span className="material-symbols-outlined text-sm">link</span>
                            Respondendo ao bloco: {filterParagraph}
                        </div>
                        <button onClick={() => setFilterParagraph(null)} className="text-brand-blue hover:text-brand-darkBlue">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Seu Nome</label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white dark:bg-form-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue outline-none"
                            placeholder="Nome Completo ou Instituição"
                        />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Comentário (Suporta Markdown e LaTeX)</label>
                        <textarea
                            id="content"
                            required
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-white dark:bg-form-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                            placeholder="Deixe uma reflexão, dúvida ou contribuição sobre esta publicação..."
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-brand-blue hover:bg-brand-darkBlue text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Publicando...</>
                            ) : (
                                <><span className="material-symbols-outlined text-[18px]">send</span> Publicar Comentário</>
                            )}
                        </button>

                        <div className="flex items-center gap-3">
                            <label htmlFor="comment-file" className="cursor-pointer text-gray-500 hover:text-brand-blue dark:text-gray-400 font-bold text-sm flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                                Anexar Imagem
                            </label>
                            <input
                                id="comment-file"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        if (e.target.files[0].size > 5 * 1024 * 1024) {
                                            setError('A imagem deve ter no máximo 5MB.');
                                            return;
                                        }
                                        setSelectedFile(e.target.files[0]);
                                        setError('');
                                    }
                                }}
                            />
                            {selectedFile && (
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{selectedFile.name}</span>
                                    <button type="button" onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500 flex items-center">
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            <div className="space-y-6">
                {filteredComments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                        {filterParagraph ? 'Não há comentários neste bloco ainda.' : 'Seja o primeiro a deixar um comentário nesta publicação.'}
                    </p>
                ) : (
                    filteredComments.map(comment => (
                        <div key={comment.id} className="bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm relative group">
                            {comment.inline_paragraph_id && (
                                <div className="absolute top-4 right-4 text-[10px] font-bold text-brand-blue bg-brand-blue/5 px-2 py-0.5 rounded-full border border-brand-blue/10">
                                    CONTEÚDO EM LINHA
                                </div>
                            )}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {comment.author_name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{comment.author_name}</h4>
                                    <span className="text-xs text-gray-400">
                                        {new Date(comment.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <div className="text-gray-600 dark:text-gray-300 text-sm prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeSanitize, rehypeKatex]}>
                                    {comment.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
