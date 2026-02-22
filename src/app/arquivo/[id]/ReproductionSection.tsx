'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { triggerNotification } from '@/lib/notifications';

interface Reproduction {
    id: string;
    text_content: string;
    title?: string;
    media_url?: string;
    created_at: string;
    profiles: {
        full_name: string;
        avatar_url: string;
    };
}

interface ReproductionSectionProps {
    submissionId: string;
    submissionTitle: string;
    initialReproductions: any[];
}

export function ReproductionSection({ submissionId, submissionTitle, initialReproductions }: ReproductionSectionProps) {
    const [user, setUser] = useState<any>(null);
    const [reproductions, setReproductions] = useState<Reproduction[]>(initialReproductions);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [textContent, setTextContent] = useState('');
    const [title, setTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [mediaUrl, setMediaUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        checkUser();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!textContent.trim()) {
            setMessage({ type: 'error', text: 'Por favor, descreva sua experiência.' });
            return;
        }

        setIsSubmitting(true);
        try {
            let finalUrl = mediaUrl;
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                if (!cloudName) throw new Error("Cloudinary cloud name missing");

                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error('Falha ao enviar a imagem.');
                const data = await res.json();

                const urlParts = data.secure_url.split('/upload/');
                if (urlParts.length === 2) {
                    finalUrl = `${urlParts[0]}/upload/f_auto,q_auto/${urlParts[1]}`;
                } else {
                    finalUrl = data.secure_url;
                }
            }

            // Ensure profile exists before inserting (fixes FK constraint if trigger wasn't set up)
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            }, { onConflict: 'id' });

            if (profileError) {
                console.error("Profile upsert error:", profileError);
                // Don't throw — try to continue, the profile might already exist
            }

            const { error } = await supabase.from('reproductions').insert([{
                submission_id: submissionId,
                user_id: user.id,
                title: title.trim() || null,
                text_content: textContent,
                media_url: finalUrl || null,
                status: 'pendente'
            }]);

            if (error) {
                console.error("Supabase insert error:", error);
                throw error;
            }

            // Send notification
            triggerNotification({
                type: 'reproduction',
                userName: user.user_metadata?.full_name || user.email,
                submissionTitle: submissionTitle,
                content: textContent
            });

            setMessage({ type: 'success', text: 'Enviado com sucesso! Aguarde a moderação.' });
            setTextContent('');
            setTitle('');
            setSelectedFile(null);
            setMediaUrl('');
            setTimeout(() => {
                setIsFormOpen(false);
                setMessage({ type: '', text: '' });
                router.refresh();
            }, 3000);
        } catch (error: any) {
            console.error("Submission error details:", error, error?.message, error?.details);
            setMessage({ type: 'error', text: error?.message || 'Erro ao enviar. Tente novamente.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-12 pt-12 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-brand-blue">cameraswitch</span>
                        Eu Reproduzi!
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Você testou este experimento? Compartilhe seus resultados com a comunidade.
                    </p>
                </div>

                {user ? (
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${isFormOpen
                            ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            : 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:scale-105 hover:bg-brand-darkBlue'
                            }`}
                    >
                        <span className="material-symbols-outlined">{isFormOpen ? 'close' : 'add_a_photo'}</span>
                        {isFormOpen ? 'Cancelar' : 'Enviar minha versão'}
                    </button>
                ) : (
                    <div className="bg-brand-blue/5 border border-brand-blue/10 p-4 rounded-2xl flex items-center gap-3 text-brand-blue dark:text-blue-400 text-sm font-medium">
                        <span className="material-symbols-outlined">info</span>
                        <span>Faça login para compartilhar sua reprodução!</span>
                    </div>
                )}
            </div>

            {/* Submission Form */}
            {isFormOpen && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-card-dark p-8 rounded-3xl shadow-xl border border-brand-blue/20 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                                Título Curto (opcional)
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Dê um nome para sua reprodução (ex: Meu Teste Caseiro)"
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-blue focus:ring-0 outline-none transition-all text-gray-700 dark:text-gray-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                                Como foi sua experiência?
                            </label>
                            <textarea
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                placeholder="Conte o que funcionou, o que deu errado e o que você descobriu..."
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-blue focus:ring-0 outline-none transition-all min-h-[120px] text-gray-700 dark:text-gray-200"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                                    Foto da Reprodução
                                </label>
                                <div className="flex flex-col gap-4">
                                    <label htmlFor="rep-file" className="cursor-pointer inline-flex items-center justify-center h-12 px-6 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-yellow hover:bg-brand-blue/10 dark:hover:bg-brand-yellow/10 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-blue dark:hover:border-brand-yellow">
                                        <span className="material-symbols-outlined text-[20px] mr-2">add_photo_alternate</span>
                                        <span className="text-sm font-bold">{selectedFile ? 'Trocar Foto' : 'Anexar Foto'}</span>
                                        <input
                                            id="rep-file"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    if (e.target.files[0].size > 10 * 1024 * 1024) {
                                                        setMessage({ type: 'error', text: 'A imagem deve ter no máximo 10MB.' });
                                                        return;
                                                    }
                                                    setSelectedFile(e.target.files[0]);
                                                    setMessage({ type: '', text: '' });
                                                }
                                            }}
                                        />
                                    </label>
                                    {selectedFile && (
                                        <div className="flex flex-col bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-lg">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate" title={selectedFile.name}>{selectedFile.name}</span>
                                            <button type="button" onClick={() => setSelectedFile(null)} className="text-xs text-red-500 hover:text-red-600 font-medium text-left">Remover</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-center text-gray-400 font-bold text-sm uppercase md:py-8 hidden md:block">ou</div>

                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                                    Link (Drive, YouTube, etc.)
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">link</span>
                                    <input
                                        type="url"
                                        value={mediaUrl}
                                        onChange={(e) => setMediaUrl(e.target.value)}
                                        placeholder="Cole um link externo..."
                                        disabled={!!selectedFile}
                                        className={`w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent outline-none transition-all text-gray-700 dark:text-gray-200 disabled:opacity-50
                                            ${!selectedFile ? 'focus:border-brand-blue' : ''}`}
                                    />
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">Você pode anexar uma foto <span className="font-bold underline">ou</span> inserir um link, não os dois simultaneamente.</p>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-brand-blue text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-blue/20 hover:bg-brand-darkBlue transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">send</span>
                                    Enviar para Moderação
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Reproductions List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reproductions.length > 0 ? (
                    reproductions.map((rep) => (
                        <div key={rep.id} className="bg-white dark:bg-card-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center overflow-hidden border border-brand-blue/20">
                                    {rep.profiles?.avatar_url ? (
                                        <img src={rep.profiles.avatar_url} alt={rep.profiles.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-brand-blue">person</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{rep.profiles?.full_name || 'Participante'}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(rep.created_at).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                            {rep.title && (
                                <h4 className="font-bold text-gray-900 dark:text-white text-base">
                                    {rep.title}
                                </h4>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                                "{rep.text_content}"
                            </p>
                            {rep.media_url && (
                                <a
                                    href={rep.media_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline"
                                >
                                    <span className="material-symbols-outlined text-base">visibility</span>
                                    Ver Mídia Anexada
                                </a>
                            )}
                        </div>
                    ))
                ) : (
                    !isFormOpen && (
                        <div className="col-span-full py-12 text-center bg-gray-50/50 dark:bg-background-dark/20 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 mb-2">science</span>
                            <p className="text-gray-400 text-sm font-medium">Nenhuma reprodução compartilhada ainda. Seja o primeiro!</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
