'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SubmitPage() {
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [authors, setAuthors] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Laboratórios');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');

    const [mediaType, setMediaType] = useState<'image' | 'video' | 'pdf' | 'text'>('image');
    const [videoUrl, setVideoUrl] = useState('');
    const [externalLink, setExternalLink] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [acceptedCC, setAcceptedCC] = useState(false);

    const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const insertFormatting = (prefix: string, suffix: string = '') => {
        const textarea = descriptionRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = description.substring(start, end);
        const before = description.substring(0, start);
        const after = description.substring(end);

        const newText = `${before}${prefix}${selectedText || 'texto'}${suffix}${after}`;
        setDescription(newText);

        // Re-focus and select the inserted text
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + prefix.length;
            const newSelEnd = newCursorPos + (selectedText || 'texto').length;
            textarea.setSelectionRange(newCursorPos, newSelEnd);
        }, 0);
    };

    const insertLinePrefix = (prefix: string) => {
        const textarea = descriptionRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = description.substring(start, end);
        const before = description.substring(0, start);
        const after = description.substring(end);

        // Add prefix to beginning of each selected line
        const lines = selectedText ? selectedText.split('\n') : [''];
        const prefixedLines = lines.map(line => `${prefix}${line}`).join('\n');
        const newText = `${before}${prefixedLines}${after}`;
        setDescription(newText);

        setTimeout(() => {
            textarea.focus();
        }, 0);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);

            // Validate PDF max size
            if (mediaType === 'pdf') {
                if (files.some(file => file.size > MAX_PDF_SIZE)) {
                    setErrorMsg('O arquivo PDF não pode ultrapassar 10MB.');
                    setSelectedFiles([]);
                    return;
                }
            }

            if (mediaType === 'image' && files.length > 10) {
                setErrorMsg('Limite máximo de 10 fotos por submissão.');
                setSelectedFiles(files.slice(0, 10));
            } else {
                setErrorMsg('');
                setSelectedFiles(files);
            }
        }
    };

    const parseYoutubeUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (!cloudName) throw new Error("Cloudinary cloud name missing");

        // PDFs must use 'image' type so Cloudinary generates a thumbnail of the first page.
        // Images use 'image' type as usual.
        const resourceType = 'image';

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Falha no upload (${res.status}): ${errText}`);
        }

        const data = await res.json();

        // For images, inject f_auto,q_auto for optimization.
        // For PDFs, DON'T inject these - they would convert the PDF to a WebP image.
        if (file.type !== 'application/pdf') {
            const urlParts = data.secure_url.split('/upload/');
            if (urlParts.length === 2) {
                return `${urlParts[0]}/upload/f_auto,q_auto/${urlParts[1]}`;
            }
        }
        return data.secure_url;
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrorMsg('');

        try {
            if (!title || !authors) {
                throw new Error("Preencha todos os campos obrigatórios (*)");
            }
            if (!email && !whatsapp) {
                throw new Error("Preencha pelo menos um contato (E-mail ou WhatsApp)");
            }
            if (mediaType === 'pdf' && !externalLink) {
                throw new Error("Para submissões de PDF, o link para o PDF completo é obrigatório.");
            }

            let finalMediaUrl: string[] = [];

            if (mediaType === 'text') {
                if (!description || description.trim().length < 50) {
                    throw new Error("O corpo do texto deve ter pelo menos 50 caracteres.");
                }
                // Text posts don't need media upload - the content goes in description
                finalMediaUrl = [];
            } else if (mediaType === 'image' || mediaType === 'pdf') {
                if (selectedFiles.length === 0) throw new Error(`Selecione pelo menos ${mediaType === 'image' ? 'uma imagem' : 'um PDF'} para upload`);

                // Upload all selected files in parallel
                finalMediaUrl = await Promise.all(
                    selectedFiles.map(file => uploadToCloudinary(file))
                );
            } else if (mediaType === 'video') {
                if (!videoUrl) throw new Error("Insira o link do vídeo");
                const videoId = parseYoutubeUrl(videoUrl);
                if (!videoId) throw new Error("Link do YouTube inválido");
                finalMediaUrl = [`https://www.youtube.com/embed/${videoId}`];
            }

            const { error: insertError } = await supabase.from('submissions').insert([{
                title,
                authors,
                description,
                category,
                email,
                whatsapp,
                media_type: mediaType,
                media_url: JSON.stringify(finalMediaUrl),
                status: 'pendente',
                external_link: externalLink || null
            }]);

            if (insertError) {
                console.error("Supabase Error:", insertError);
                throw new Error(`Erro ao salvar no banco: ${insertError.message || JSON.stringify(insertError)}`);
            }

            alert('Submissão enviada com sucesso! Em breve passará por moderação.');
            router.push('/');

        } catch (err: any) {
            console.error("Full Submit Error:", err);
            setErrorMsg(err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:30px_30px] opacity-40 -z-20"></div>

            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-brand-blue/10 dark:hidden rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse -z-10"></div>
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-brand-yellow/10 dark:hidden rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 -z-10"></div>

            {/* Simple Header */}
            <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 dark:bg-background-dark/80 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors font-medium">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        Voltar para o Hub
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-red"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                    </div>
                </div>
            </header>

            <main className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 z-10 flex justify-center">
                <div className="w-full max-w-3xl flex flex-col gap-10">

                    {/* Page Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 dark:bg-brand-red/20 border border-brand-red/20 text-brand-red text-xs font-bold uppercase tracking-wide">
                            <span className="material-symbols-outlined text-[14px]">science</span>
                            Participe do Hub
                        </div>
                        <h1 className="font-display font-bold text-4xl md:text-5xl text-gray-900 dark:text-white tracking-tight">
                            Envie sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-yellow">Contribuição</span>
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto md:text-lg mb-6">
                            Preencha o formulário abaixo para submeter fotos ou vídeos do seu trabalho para divulgação nos canais oficiais do Instituto de Física.
                        </p>
                        <Link href="/guia" className="inline-flex items-center gap-2 group px-6 py-2.5 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue hover:bg-brand-blue hover:text-white transition-all font-semibold">
                            <span className="material-symbols-outlined text-[20px] group-hover:animate-bounce">menu_book</span>
                            Confira nosso guia de boas práticas
                        </Link>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white/80 dark:bg-card-dark/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 md:p-10 relative">
                        {errorMsg && (
                            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 font-medium flex items-center gap-3">
                                <span className="material-symbols-outlined">error</span>
                                {errorMsg}
                            </div>
                        )}

                        <div className="space-y-8">

                            {/* Input Group */}
                            <div className="space-y-2 group">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="title">
                                    <span className="material-symbols-outlined text-brand-blue text-[18px]">title</span>
                                    Título do Trabalho <span className="text-brand-red">*</span>
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-form-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                                    placeholder="Ex: Novo acelerador de partículas"
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="authors">
                                    <span className="material-symbols-outlined text-brand-red text-[18px]">group</span>
                                    Autores <span className="text-brand-red">*</span>
                                </label>
                                <input
                                    id="authors"
                                    type="text"
                                    value={authors}
                                    onChange={e => setAuthors(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-form-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all"
                                    placeholder="Silva, J.; Ferreira, M."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="email">
                                        <span className="material-symbols-outlined text-gray-500 text-[18px]">alternate_email</span>
                                        E-mail para Contato
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-form-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all text-sm"
                                        placeholder="pesquisador@if.usp.br"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="whatsapp">
                                        <span className="material-symbols-outlined text-gray-500 text-[18px]">phone_iphone</span>
                                        WhatsApp
                                    </label>
                                    <input
                                        id="whatsapp"
                                        type="tel"
                                        value={whatsapp}
                                        onChange={e => setWhatsapp(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-form-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all text-sm"
                                        placeholder="(11) 90000-0000"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-1 border-l-2 border-brand-yellow">Preencha pelo menos um dos contatos (E-mail ou WhatsApp).</p>

                            <div className="space-y-2 group">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="category">
                                    <span className="material-symbols-outlined text-brand-yellow text-[18px]">category</span>
                                    Categoria <span className="text-brand-red">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="appearance-none w-full bg-gray-50 dark:bg-form-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-all cursor-pointer font-medium"
                                    >
                                        <option value="Laboratórios">Laboratórios</option>
                                        <option value="Pesquisadores">Pesquisadores</option>
                                        <option value="Eventos">Eventos</option>
                                        <option value="Uso Didático">Uso Didático</option>
                                        <option value="Bastidores da Ciência">Bastidores da Ciência</option>
                                        <option value="Convivência">Convivência</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="description">
                                    <span className="material-symbols-outlined text-gray-500 text-[18px]">{mediaType === 'text' ? 'article' : 'description'}</span>
                                    {mediaType === 'text' ? (<>Corpo do Texto <span className="text-brand-red">*</span></>) : 'Descrição ou Contexto'}
                                </label>

                                {/* Markdown Formatting Toolbar */}
                                {mediaType === 'text' && (
                                    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-700">
                                        <button type="button" onClick={() => insertFormatting('**', '**')} title="Negrito" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">format_bold</span>
                                        </button>
                                        <button type="button" onClick={() => insertFormatting('*', '*')} title="Itálico" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">format_italic</span>
                                        </button>
                                        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                                        <button type="button" onClick={() => insertLinePrefix('# ')} title="Título" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors text-xs font-bold">
                                            H1
                                        </button>
                                        <button type="button" onClick={() => insertLinePrefix('## ')} title="Subtítulo" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors text-xs font-bold">
                                            H2
                                        </button>
                                        <button type="button" onClick={() => insertLinePrefix('### ')} title="Seção" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors text-xs font-bold">
                                            H3
                                        </button>
                                        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                                        <button type="button" onClick={() => insertLinePrefix('- ')} title="Lista" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                                        </button>
                                        <button type="button" onClick={() => insertLinePrefix('1. ')} title="Lista Numerada" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                                        </button>
                                        <button type="button" onClick={() => insertFormatting('> ', '')} title="Citação" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">format_quote</span>
                                        </button>
                                    </div>
                                )}

                                <textarea
                                    id="description"
                                    ref={descriptionRef}
                                    rows={mediaType === 'text' ? 12 : 4}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className={`w-full bg-gray-50 dark:bg-form-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3.5 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all resize-none ${mediaType === 'text' ? 'rounded-b-xl font-mono text-sm' : 'rounded-xl'}`}
                                    placeholder={mediaType === 'text' ? 'Escreva aqui usando **negrito**, *itálico*, # Títulos, - listas...' : 'Detalhe o contexto da submissão...'}
                                    required={mediaType === 'text'}
                                ></textarea>
                                {mediaType === 'text' && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-1 border-l-2 border-brand-blue">
                                        Mínimo de 50 caracteres. Suporta formatação: **negrito**, *itálico*, # títulos, - listas e &gt; citações.
                                    </p>
                                )}
                            </div>

                            {mediaType === 'pdf' && (
                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="external_link">
                                        <span className="material-symbols-outlined text-brand-blue text-[18px]">link</span>
                                        Link para PDF Completo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="external_link"
                                        type="url"
                                        value={externalLink}
                                        onChange={e => setExternalLink(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-form-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all text-sm"
                                        placeholder="Link do Google Drive, Dropbox ou repositório do artigo inteiro..."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-1 border-l-2 border-brand-blue">
                                        Obrigatório. Cole o link do Google Drive, Dropbox ou repositório para visualização completa.
                                    </p>
                                </div>
                            )}
                        </div>

                        <hr className="my-10 border-gray-100 dark:border-gray-800" />

                        <div className="space-y-6">
                            <div className="flex flex-col gap-1 mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-brand-blue">perm_media</span>
                                    Tipo de Conteúdo <span className="text-brand-red">*</span>
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Escolha o formato da sua submissão.</p>
                            </div>

                            <div className="flex p-1.5 bg-gray-100/50 dark:bg-form-dark/50 rounded-2xl w-full mb-6 border border-gray-200/50 dark:border-gray-700/50 overflow-x-auto" role="tablist">
                                <button
                                    onClick={() => { setMediaType('image'); setSelectedFiles([]); }}
                                    aria-selected={mediaType === 'image'}
                                    className={`flex-1 min-w-[120px] py-3 text-sm font-bold rounded-xl transition-all ${mediaType === 'image' ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">image</span>
                                        Fotos
                                    </div>
                                </button>
                                <button
                                    onClick={() => { setMediaType('video'); setSelectedFiles([]); }}
                                    aria-selected={mediaType === 'video'}
                                    className={`flex-1 min-w-[120px] py-3 text-sm font-bold rounded-xl transition-all ${mediaType === 'video' ? 'bg-white dark:bg-gray-700 text-brand-red shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">movie</span>
                                        Vídeo
                                    </div>
                                </button>
                                <button
                                    onClick={() => { setMediaType('pdf'); setSelectedFiles([]); }}
                                    aria-selected={mediaType === 'pdf'}
                                    className={`flex-1 min-w-[120px] py-3 text-sm font-bold rounded-xl transition-all ${mediaType === 'pdf' ? 'bg-white dark:bg-gray-700 text-brand-yellow shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                        PDF
                                    </div>
                                </button>
                                <button
                                    onClick={() => { setMediaType('text'); setSelectedFiles([]); }}
                                    aria-selected={mediaType === 'text'}
                                    className={`flex-1 min-w-[120px] py-3 text-sm font-bold rounded-xl transition-all ${mediaType === 'text' ? 'bg-white dark:bg-gray-700 text-brand-blue shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]">article</span>
                                        Texto
                                    </div>
                                </button>
                            </div>

                            <div className="mt-4">
                                {mediaType === 'text' ? (
                                    <div className="flex justify-center rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700 px-6 py-8 bg-blue-50/50 dark:bg-blue-900/10">
                                        <div className="text-center">
                                            <span className="material-symbols-outlined text-4xl text-brand-blue mb-2">edit_note</span>
                                            <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Modo Texto ativo</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Escreva o conteúdo no campo &quot;Corpo do Texto&quot; acima. Nenhum arquivo é necessário.</p>
                                        </div>
                                    </div>
                                ) : mediaType === 'image' || mediaType === 'pdf' ? (
                                    <div className="flex justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 px-6 py-12 bg-gray-50/50 dark:bg-form-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="text-center relative z-10">
                                            <div className="w-16 h-16 bg-white dark:bg-form-dark rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform group-hover:border-brand-blue/20">
                                                <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-brand-blue transition-colors">cloud_upload</span>
                                            </div>
                                            <div className="mt-2 flex text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-brand-blue hover:text-brand-darkBlue focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-blue focus-within:ring-offset-2 transition-colors">
                                                    <span>{selectedFiles.length > 0 ? `${selectedFiles.length} arquivo${selectedFiles.length > 1 ? 's' : ''} selecionado${selectedFiles.length > 1 ? 's' : ''}` : `Clique para enviar ${mediaType === 'image' ? 'imagens' : 'PDFs'}`}</span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        accept={mediaType === 'image' ? "image/*" : "application/pdf"}
                                                        multiple={mediaType === 'image'}
                                                        className="sr-only"
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                                {selectedFiles.length === 0 && <p className="pl-1 hidden sm:block">ou arraste para cá</p>}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {mediaType === 'image' ? 'PNG, JPG ou GIF até 10MB' : 'Arquivo .PDF (Apenas as primeiras páginas ou resumos - Limite estrito de 10MB)'}
                                            </p>
                                            <p className="text-xs font-semibold text-brand-red mt-2">
                                                {mediaType === 'image' ? 'Limite máximo de 10 fotos por submissão.' : 'Apenas 1 PDF por submissão.'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 group">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="youtube-link">
                                            <span className="material-symbols-outlined text-brand-red text-[18px]">smart_display</span>
                                            Link do YouTube
                                        </label>
                                        <input
                                            id="youtube-link"
                                            type="url"
                                            value={videoUrl}
                                            onChange={e => setVideoUrl(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-form-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-gray-100 dark:border-gray-800">
                            <label className="flex items-start gap-3 cursor-pointer group max-w-2xl">
                                <div className="relative flex items-center mt-1">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-600 text-brand-blue focus:ring-brand-blue dark:bg-form-dark transition-colors"
                                        checked={acceptedCC}
                                        onChange={(e) => setAcceptedCC(e.target.checked)}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                    Aceito disponibilizar este material para uso educacional e de divulgação, mantendo os devidos créditos ao autor (Licença Creative Commons).
                                </span>
                            </label>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading || !acceptedCC}
                                className="group relative w-full sm:w-auto overflow-hidden rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 font-bold shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center min-w-[200px]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red opacity-0 group-hover:opacity-20 dark:group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            Submeter para Análise
                                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
