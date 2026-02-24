'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSubmissionStore } from '@/store/useSubmissionStore';
import { useFormAutoSave } from '@/hooks/useFormAutoSave';
import { supabase } from '@/lib/supabase';
import { getTrendingTags, createSubmission } from '@/app/actions/submissions';
import { useErrorMap } from '@/hooks/useErrorMap';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';

import { submissionSchema, type SubmissionFormData } from '../schema';


const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FormStep() {
    const router = useRouter();
    const { notifyError } = useErrorMap();
    const {
        category, mediaType, setStep,
        reset: resetStore
    } = useSubmissionStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoadingOCR, setIsLoadingOCR] = useState(false);


    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isDirty },
        reset: resetForm
    } = useForm<SubmissionFormData>({
        resolver: zodResolver(submissionSchema) as any,
        defaultValues: {
            title: '',
            authors: '',
            description: '',
            whatsapp: '',
            videoUrl: '',
            externalLink: '',
            technicalDetails: '',
            altText: '',
            testimonial: '',
            readGuide: false,
            acceptedCC: false,
            tags: [],
            readingTime: 0,
            coAuthors: [],
            use_pseudonym: false
        }
    });

    const [realName, setRealName] = useState('');
    const usePseudonym = watch('use_pseudonym');

    const [tagInput, setTagInput] = useState('');
    const [smartTags, setSmartTags] = useState<string[]>([]);

    useEffect(() => {
        getTrendingTags().then(tags => setSmartTags(tags || [])).catch(() => { });
    }, []);



    const watchedValues = watch();

    // Auto-save integration
    const { clearAutoSave } = useFormAutoSave({ register, handleSubmit, watch, setValue, formState: { errors, isDirty }, reset: resetForm } as any, {
        key: 'submission-form-draft',
        debounceMs: 1500
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search for co-authors
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsSearching(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
                .limit(5);

            if (!error && data) {
                setSearchResults(data);
            }
            setIsSearching(false);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const addCoAuthor = (user: any) => {
        const current = watchedValues.coAuthors || [];
        if (current.find(c => c.id === user.id)) return;
        setValue('coAuthors', [...current, user], { shouldDirty: true });
        setSearchTerm('');
        setSearchResults([]);
    };

    const removeCoAuthor = (id: string) => {
        const current = watchedValues.coAuthors || [];
        setValue('coAuthors', current.filter(c => c.id !== id), { shouldDirty: true });
    };

    // Tag management
    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const tag = tagInput.trim().replace(/^#/, '');
            if (tag && !(watchedValues.tags || []).includes(tag)) {
                setValue('tags', [...(watchedValues.tags || []), tag], { shouldDirty: true });
            }
            setTagInput('');
        } else if (e.key === 'Backspace' && !tagInput && (watchedValues.tags || []).length > 0) {
            const newTags = [...(watchedValues.tags || [])];
            newTags.pop();
            setValue('tags', newTags, { shouldDirty: true });
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue('tags', (watchedValues.tags || []).filter(t => t !== tagToRemove), { shouldDirty: true });
    };

    // Reading time calculation
    useEffect(() => {
        const text = watchedValues.description || '';

        // Count KaTeX blocks
        const inlineMathMatches = text.match(/\$(.+?)\$/g) || [];
        const blockMathMatches = text.match(/\$\$(.+?)\$\$/g) || [];

        // Remove KaTeX from text to count regular words accurately
        let cleanText = text.replace(/\$\$(.+?)\$\$/g, '').replace(/\$(.+?)\$/g, '');
        const words = cleanText.trim().split(/\s+/).filter(w => w.length > 0).length;

        // Weights: inline math ~ 5 words of cognitive load, block math ~ 20 words
        const mathWeight = (inlineMathMatches.length * 5) + (blockMathMatches.length * 20);

        const totalWords = words + mathWeight;
        const time = Math.max(1, Math.ceil(totalWords / 200));
        if (watchedValues.readingTime !== time) {
            setValue('readingTime', time);
        }
    }, [watchedValues.description, setValue, watchedValues.readingTime]);

    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserEmail(session.user.email || '');

                // Fetch Profile for real name
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.full_name) {
                    setRealName(profile.full_name);
                    // Set default author as real name if not using pseudonym
                    if (!watchedValues.use_pseudonym) {
                        setValue('authors', profile.full_name);
                    }
                }
            }
        };
        fetchUser();

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty, watchedValues.use_pseudonym, setValue]);



    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    // Staggered variants for children
    const itemVariants: any = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
        exit: (idx: any) => ({
            opacity: 0,
            x: (idx % 2 === 0) ? -600 : 600,
            transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
        })
    };

    const containerVariants = {
        visible: {
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    // Dynamic Visibility Logic
    const showAltText = mediaType === 'image' || mediaType === 'video';
    const showFileUpload = ['image', 'pdf', 'zip', 'sdocx'].includes(mediaType);
    const showVideoUrl = mediaType === 'video';
    const isTextMode = mediaType === 'text';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE);
            if (validFiles.length < files.length) {
                setErrorMsg("Alguns arquivos excedem o limite de 10MB.");
            }
            setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 10));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE);
        if (validFiles.length < files.length) {
            setErrorMsg("Alguns arquivos excedem o limite de 10MB.");
        }
        setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 10));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };


    const insertFormatting = (prefix: string, suffix: string = '') => {

        const textarea = descriptionRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentDescription = watchedValues.description || '';
        const selectedText = currentDescription.substring(start, end);
        const before = currentDescription.substring(0, start);
        const after = currentDescription.substring(end);
        const newText = `${before}${prefix}${selectedText || 'texto'}${suffix}${after}`;
        setValue('description', newText, { shouldDirty: true });
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
        const currentDescription = watchedValues.description || '';
        const selectedText = currentDescription.substring(start, end);
        const before = currentDescription.substring(0, start);
        const after = currentDescription.substring(end);
        const lines = selectedText ? selectedText.split('\n') : [''];
        const prefixedLines = lines.map(line => `${prefix}${line}`).join('\n');
        const newText = `${before}${prefixedLines}${after}`;
        setValue('description', newText, { shouldDirty: true });
        setTimeout(() => textarea.focus(), 0);
    };


    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const resourceType = (mediaType === 'image' || mediaType === 'pdf') ? 'image' : 'auto';
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error("Falha no upload");
        const data = await res.json();
        if (mediaType === 'image') {
            const urlParts = data.secure_url.split('/upload/');
            if (urlParts.length === 2) return `${urlParts[0]}/upload/f_auto,q_auto/${urlParts[1]}`;
        }
        return data.secure_url;
    };

    const parseYoutubeUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const onFormSubmit = async (data: SubmissionFormData) => {

        setIsLoading(true);
        setErrorMsg('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Você precisa estar logado.");

            let finalMediaUrl: string[] = [];
            if (isTextMode) {
                if (data.description.trim().length < 50) throw new Error("Texto deve ter 50+ caracteres.");
            } else if (showFileUpload) {
                if (selectedFiles.length === 0) throw new Error("Selecione os arquivos.");
                finalMediaUrl = await Promise.all(selectedFiles.map(f => uploadToCloudinary(f)));
            } else if (showVideoUrl) {
                const vidId = parseYoutubeUrl(data.videoUrl || '');
                if (!vidId) throw new Error("Link YouTube inválido.");
                finalMediaUrl = [`https://www.youtube.com/embed/${vidId}`];
            }

            // 0. Rate Limiting Check (Máx 3 submissões por 15 minutos)
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
            const { count: recentSubmissions, error: countError } = await supabase
                .from('submissions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id)
                .gte('created_at', fifteenMinsAgo);

            if (countError) throw new Error("Erro ao verificar limites de envio.");
            if (recentSubmissions && recentSubmissions >= 3) {
                throw new Error("Muitos envios recentes. Por favor, aguarde 15 minutos antes de enviar novamente.");
            }

            // 1. Ensure Profile Exists (Critical for Foreign Key constraint)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error("Profile check error:", profileError);
                throw new Error(`Erro ao verificar perfil: ${profileError.message}`);
            }

            if (!profile) {
                await supabase.from('profiles').insert([{
                    id: session.user.id,
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || data.authors.split(',')[0],
                    avatar_url: session.user.user_metadata?.avatar_url || null
                }]);
            }

            // Perform Server Action (Zod Hardened)
            const result = await createSubmission({
                title: data.title,
                authors: data.authors,
                description: data.description,
                category: category || 'Outros',
                whatsapp: data.whatsapp || null,
                media_type: mediaType as any,
                media_url: JSON.stringify(finalMediaUrl),
                external_link: data.externalLink || null,
                technical_details: data.technicalDetails || null,
                alt_text: data.altText || null,
                testimonial: data.testimonial || null,
                co_authors: data.coAuthors || [],
                tags: data.tags || [],
                reading_time: data.readingTime || 0,
                use_pseudonym: data.use_pseudonym
            });

            if (result.error) {
                const firstErr = Object.values(result.error)[0];
                const msg = Array.isArray(firstErr) ? firstErr[0] : "ERR_DATABASE_GENERAL";

                notifyError(msg);
                throw new Error("Erro de validação processado.");
            }

            fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authors: data.authors, title: data.title, category })
            }).catch(() => { });

            clearAutoSave(); // Clear draft on successful submission

            setIsSubmitted(true);
            setTimeout(() => {
                resetForm();
                resetStore();
                router.push('/');
            }, 5000);
        } catch (err: any) {
            console.error("Submit error:", err);
            setErrorMsg(err.message || "Erro inesperado.");
        } finally {
            setIsLoading(false);
        }
    };


    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center space-y-8"
            >
                <div className="relative">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 100 }}
                        className="w-32 h-32 bg-brand-yellow rounded-full flex items-center justify-center text-white shadow-2xl relative z-10"
                    >
                        <span className="material-symbols-outlined text-6xl">rocket_launch</span>
                    </motion.div>
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-brand-yellow rounded-full blur-2xl"
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-gray-900 dark:text-white">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow italic mr-2">Voou!</span>
                        Contribuição Recebida
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
                        Sua ideia agora faz parte do Hub. Nossa curadoria vai analisar tudo com carinho e logo ela aparecerá na vitrine principal.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4 pt-10">
                    <div className="flex items-center gap-2 text-brand-blue font-bold uppercase tracking-widest text-xs">
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Voltando para a home em instantes...
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-10 pb-20"
        >
            {/* Top Banner for Final Step */}
            <motion.div variants={itemVariants} custom={0}
                className="relative overflow-hidden bg-white dark:bg-card-dark rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-brand-yellow/5 mb-10"
            >
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                <div className="relative p-8 md:p-10 flex flex-col lg:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-brand-yellow/10 rounded-3xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-4xl text-brand-yellow">verified</span>
                    </div>

                    <div className="flex-grow space-y-3 text-center lg:text-left">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            Quase lá! Vamos <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow">detalhar</span> sua ideia?
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                            Preencha os campos abaixo com atenção. Informações precisas ajudam nossa curadoria a destacar seu trabalho na vitrine principal do Hub.
                            Lembre-se de aceitar os termos de uso antes de finalizar.
                        </p>
                    </div>

                    <a
                        href="/guia"
                        target="_blank"
                        className="group relative overflow-hidden px-8 py-5 rounded-2xl font-bold shadow-xl hover:-translate-y-1 flex items-center gap-3 shrink-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red opacity-100 transition-opacity"></div>
                        <span className="relative z-10 text-white flex items-center gap-2">
                            Abrir Guia
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">open_in_new</span>
                        </span>
                    </a>

                    <div className="shrink-0 flex -space-x-4">
                        <div className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 bg-brand-blue flex items-center justify-center text-white scale-110 z-10">
                            <span className="material-symbols-outlined text-xl">1</span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 bg-brand-red flex items-center justify-center text-white scale-110 z-20">
                            <span className="material-symbols-outlined text-xl">2</span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-800 bg-brand-yellow flex items-center justify-center text-white scale-110 z-30 shadow-lg">
                            <span className="material-symbols-outlined text-xl">3</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} custom={1} className="flex items-center gap-4">
                <button onClick={() => setStep('format')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detalhes Finais</h1>
            </motion.div>

            {errorMsg && (
                <motion.div variants={itemVariants} custom={2} className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined">error</span>
                    {errorMsg}
                </motion.div>
            )}

            <motion.div variants={itemVariants} custom={3} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 lg:col-span-2">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-xl">alternate_email</span>
                        E-mail de Assinatura (Logado)
                    </label>
                    <input
                        type="email"
                        value={userEmail || 'Carregando...'}
                        readOnly
                        className="w-full bg-gray-50 dark:bg-form-dark/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 cursor-not-allowed opacity-70 outline-none transition-all dark:text-gray-400 font-medium"
                    />
                </div>
                <div className="space-y-3 lg:col-span-2">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-brand-blue">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">title</span>
                            Título da Contribuição *
                        </div>
                        <span className={`text-[10px] font-bold ${(watchedValues.title || '').length > 60 ? 'text-brand-red' : 'text-gray-400'}`}>
                            {(watchedValues.title || '').length}/60
                        </span>


                    </label>
                    <input
                        type="text" {...register('title')}
                        className={`w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4 focus:ring-4 outline-none transition-all dark:text-white ${errors.title ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-blue focus:ring-brand-blue/10'}`}
                        placeholder="Ex: Luz e Sombra no Lab de Óptica"
                    />
                    {errors.title && <p className="text-red-500 text-xs font-bold">{errors.title.message}</p>}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-brand-red">
                            <span className="material-symbols-outlined text-xl">group</span>
                            Autor(es) *
                        </label>

                        {/* [I04] Pseudonym Toggle */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                {...register('use_pseudonym')}
                                className="peer sr-only"
                            />
                            <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-brand-blue relative transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Usar Pseudônimo</span>
                        </label>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            {...register('authors')}
                            readOnly={!usePseudonym}
                            className={`w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4 focus:ring-4 outline-none transition-all dark:text-white 
                                ${!usePseudonym ? 'opacity-60 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/10' : ''}
                                ${errors.authors ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-red focus:ring-brand-red/10'}`}
                            placeholder={usePseudonym ? "Nome Criativo / Pseudônimo" : "Nome do Perfil (Travado)"}
                        />
                        {!usePseudonym && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                NOME REAL
                            </div>
                        )}
                    </div>

                    {usePseudonym && (
                        <p className="text-[10px] text-brand-yellow font-bold italic flex items-center gap-1 animate-in slide-in-from-top-1 duration-300">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Limite de 2 pseudônimos por conta. Use com sabedoria.
                        </p>
                    )}

                    {errors.authors && <p className="text-red-500 text-xs font-bold">{errors.authors.message}</p>}
                </div>
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">phone_iphone</span>
                            WhatsApp (Opcional)
                        </div>
                        <div className="relative group/tooltip">
                            <span className="material-symbols-outlined text-gray-300 text-[18px] cursor-help hover:text-brand-blue transition-colors">help</span>
                            <div className="absolute right-0 bottom-full mb-2 w-56 p-3 bg-gray-900 dark:bg-card-dark text-white text-[10px] rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 shadow-2xl font-medium leading-relaxed border border-white/10 normal-case tracking-normal">
                                Para comunicação rápida sobre sua submissão. Inclua o DDD.
                            </div>
                        </div>
                    </label>

                    <input
                        type="tel" {...register('whatsapp')}
                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all dark:text-white"
                        placeholder="(11) 99999-9999"
                    />
                </div>

                {/* Tags Input (Chips) */}
                <div className="space-y-3 lg:col-span-2">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-brand-yellow">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">sell</span>
                            Tags / Palavras-chave
                        </div>
                        <span className="text-[10px] text-gray-400">Pressione Enter ou Espaço para adicionar</span>
                    </label>
                    <div className={`flex flex-wrap gap-2 p-3 bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl focus-within:border-brand-yellow focus-within:ring-4 focus-within:ring-brand-yellow/10 transition-all`}>
                        {watchedValues.tags?.map((tag: string) => (
                            <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 rounded-xl text-xs font-bold animate-in fade-in zoom-in duration-200">
                                #{tag}
                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-brand-red transition-colors">
                                    <span className="material-symbols-outlined text-[14px] font-black">close</span>
                                </button>
                            </span>
                        ))}
                        <datalist id="smart-tags">
                            {smartTags.filter(t => !watchedValues.tags?.includes(t)).map((tag) => (
                                <option key={tag} value={tag} />
                            ))}
                        </datalist>
                        <input
                            type="text"
                            list="smart-tags"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            className="flex-grow bg-transparent outline-none text-sm dark:text-white placeholder:text-gray-400 min-w-[150px]"
                            placeholder={watchedValues.tags?.length ? "Adicionar mais..." : "Física, Óptica, Experimento..."}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Co-Authorship Section */}
            <motion.div variants={itemVariants} custom={3.5} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[32px] border-2 border-dashed border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-brand-blue text-3xl">person_add</span>
                    <div>
                        <h3 className="font-black uppercase tracking-tighter text-gray-900 dark:text-white flex items-center gap-2">
                            Co-autores (Opcional)
                            <div className="relative group/tooltip inline-flex">
                                <span className="material-symbols-outlined text-gray-300 text-[18px] cursor-help hover:text-brand-blue transition-colors">help</span>
                                <div className="absolute left-0 bottom-full mb-2 w-56 p-3 bg-gray-900 dark:bg-card-dark text-white text-[10px] rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 shadow-2xl font-medium leading-relaxed border border-white/10 normal-case tracking-normal">
                                    Adicione colegas que também participaram deste trabalho. Eles precisam ter um perfil no Hub para serem encontrados.
                                </div>
                            </div>
                        </h3>
                        <p className="text-xs text-gray-500">Marque outros usuários do sistema.</p>
                    </div>

                </div>

                <div className="relative mb-6">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nome..."
                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl pl-12 pr-6 py-3 outline-none focus:border-brand-blue transition-all dark:text-white text-sm"
                    />
                    {isSearching ? (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="material-symbols-outlined animate-spin text-brand-blue text-sm">progress_activity</span>
                        </div>
                    ) : (
                        searchTerm.length >= 2 && searchResults.length === 0 && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 italic">
                                Nenhum autor encontrado
                            </div>
                        )
                    )}

                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-form-dark rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-gray-800 z-[100] overflow-hidden">
                            {searchResults.map(user => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => addCoAuthor(user)}
                                    className="w-full px-5 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{user.full_name}</div>
                                        <div className="text-[10px] text-gray-400">{user.email}</div>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-300 group-hover:text-brand-blue transition-colors">add_circle</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {watchedValues.coAuthors && watchedValues.coAuthors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {watchedValues.coAuthors.map((user: any) => (
                            <div key={user.id} className="bg-white dark:bg-form-dark border-2 border-brand-blue/20 rounded-xl px-4 py-2 flex items-center gap-3 group animate-in fade-in zoom-in duration-300">
                                <div>
                                    <div className="text-xs font-black text-gray-900 dark:text-white">{user.full_name}</div>
                                    <div className="text-[9px] text-brand-blue font-bold opacity-60 tracking-wider">CO-AUTOR</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeCoAuthor(user.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>


            {/* Dynamic Description/Text Body */}
            <motion.div variants={itemVariants} custom={4} className="space-y-3">
                <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-brand-yellow">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">{isTextMode ? 'article' : 'description'}</span>
                        {isTextMode ? 'Seu Texto (Markdown) *' : 'Descrição e Contexto'}
                    </div>
                    <div className="flex items-center gap-4">
                        {watchedValues.description?.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-brand-blue dark:text-brand-yellow uppercase tracking-widest bg-brand-blue/5 dark:bg-brand-yellow/10 px-2 py-0.5 rounded-full border border-brand-blue/10 dark:border-brand-yellow/20 transition-all animate-in fade-in duration-300">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                {watchedValues.readingTime || 1} min de leitura
                            </span>
                        )}
                        <span className={`text-[10px] ${(watchedValues.description || '').length > 2000 ? 'text-red-500' : 'text-gray-400'}`}>
                            {(watchedValues.description || '').length}/2000
                        </span>
                    </div>

                </label>
                <div className="relative group">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-t-2xl border-2 border-b-0 border-gray-100 dark:border-gray-800">
                        <div className="flex gap-1">
                            {isTextMode && (
                                <>
                                    <button type="button" onClick={() => insertFormatting('**', '**')} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors" title="Negrito">
                                        <span className="material-symbols-outlined text-sm">format_bold</span>
                                    </button>
                                    <button type="button" onClick={() => insertFormatting('*', '*')} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors" title="Itálico">
                                        <span className="material-symbols-outlined text-sm">format_italic</span>
                                    </button>
                                    <button type="button" onClick={() => insertLinePrefix('> ')} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors" title="Citação">
                                        <span className="material-symbols-outlined text-sm">format_quote</span>
                                    </button>
                                    <button type="button" onClick={() => insertLinePrefix('- ')} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors" title="Lista">
                                        <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                                    </button>
                                </>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${showPreview ? 'bg-brand-blue text-white shadow-lg' : 'bg-white dark:bg-gray-700 text-gray-500 hover:text-brand-blue'}`}
                        >
                            <span className="material-symbols-outlined text-sm">{showPreview ? 'edit' : 'visibility'}</span>
                            {showPreview ? 'Editar' : 'Preview'}
                        </button>

                    </div>
                    {showPreview ? (
                        <div className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-b-2xl px-6 py-4 min-h-[300px] prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeSanitize, rehypeKatex]}>{watchedValues.description || '*Sua descrição aparecerá aqui...*'}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="relative">
                            <textarea
                                {...register('description')}
                                ref={(e) => {
                                    register('description').ref(e);
                                    // @ts-ignore
                                    descriptionRef.current = e;
                                }}
                                rows={isTextMode ? 12 : 6}
                                className={`w-full bg-white dark:bg-form-dark border-2 px-6 py-4 outline-none focus:ring-4 transition-all dark:text-white ${errors.description ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-yellow focus:ring-brand-yellow/10'} rounded-b-2xl ${isTextMode ? 'font-mono text-sm' : ''}`}
                                placeholder={isTextMode ? 'Utilize Markdown para formatar seu texto...' : 'Explique do que se trata esse material, curiosidades ou o contexto científico.'}
                            />
                            {isTextMode && !watchedValues.description && (
                                <div className="absolute bottom-4 right-6 text-[10px] text-gray-300 pointer-events-none flex items-center gap-1 font-mono">
                                    <span className="material-symbols-outlined text-sm">markdown</span>
                                    Suporta Markdown
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {errors.description && <p className="text-red-500 text-xs font-bold mt-1">{errors.description.message}</p>}
            </motion.div>



            {
                showVideoUrl && (
                    <motion.div variants={itemVariants} custom={5} className="space-y-3">
                        <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-brand-red">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">smart_display</span>
                                Link do YouTube *
                            </div>
                            <div className="relative group/tooltip">
                                <span className="material-symbols-outlined text-gray-300 text-[18px] cursor-help hover:text-brand-blue transition-colors">help</span>
                                <div className="absolute right-0 bottom-full mb-2 w-56 p-3 bg-gray-900 dark:bg-card-dark text-white text-[10px] rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 shadow-2xl font-medium leading-relaxed border border-white/10 normal-case tracking-normal">
                                    Cole o link do seu vídeo no YouTube (ou Vimeo se aplicável). Ex: https://youtu.be/abc123
                                </div>
                            </div>
                        </label>

                        <input
                            type="url" {...register('videoUrl')}
                            className={`w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4 focus:ring-4 outline-none transition-all dark:text-white ${errors.videoUrl ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-red focus:ring-brand-red/10'}`}
                            placeholder="https://youtu.be/..."
                        />
                        {errors.videoUrl && <p className="text-red-500 text-xs font-bold">{errors.videoUrl?.message}</p>}

                    </motion.div>
                )
            }


            {
                showFileUpload && (
                    <motion.div variants={itemVariants} custom={5} className="space-y-4">
                        <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-brand-blue">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">upload_file</span>
                                Arquivos (Máx: 10MB cada) *
                            </div>
                            <span className="text-[10px] text-gray-400">
                                {selectedFiles.length || 0}/10 arquivos
                            </span>
                        </label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative group border-4 border-dashed rounded-[32px] p-10 transition-all flex flex-col items-center justify-center gap-4 text-center cursor-pointer ${isDragging ? 'border-brand-blue bg-brand-blue/10 scale-[1.02]' : 'border-gray-100 dark:border-gray-800 hover:border-brand-blue/30 hover:bg-brand-blue/5'}`}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <input
                                id="file-upload"
                                type="file" multiple className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                                <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-white">cloud_upload</span>
                            </div>
                            <div>
                                <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Arraste seus arquivos ou clique</p>
                                <p className="text-sm text-gray-400">JPG, PNG, GIF, PDF ou MP4</p>
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-widest">
                                Limite: 10MB por arquivo
                            </div>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="relative group bg-white dark:bg-form-dark p-3 rounded-2xl border-2 border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
                                        <div className="aspect-square rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                            {file.type.startsWith('image/') ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    className="w-full h-full object-cover"
                                                    alt="Preview"
                                                    onLoad={(e) => URL.revokeObjectURL((e.target as any).src)}
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-3xl text-gray-300">
                                                    {file.type.includes('pdf') ? 'picture_as_pdf' : 'description'}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform hover:bg-red-600 focus:outline-none"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                        <p className="text-[10px] font-bold mt-2 truncate text-gray-500">{file.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedFiles.length > 0 && selectedFiles.some(f => f.type.includes('pdf')) && (
                            <button
                                type="button"
                                onClick={async () => {
                                    setIsLoadingOCR(true);
                                    await new Promise(r => setTimeout(r, 2000));
                                    setValue('description', 'Extração simulada de OCR: Este é um texto sugerido automaticamente pela leitura IA do PDF.', { shouldDirty: true });
                                    setIsLoadingOCR(false);
                                }}
                                disabled={isLoadingOCR}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-brand-yellow/80 to-brand-yellow hover:from-brand-yellow/90 hover:to-brand-yellow !text-gray-900 border border-brand-yellow/50 rounded-2xl font-black transition-all shadow-md text-sm mt-4 group"
                            >
                                {isLoadingOCR ? (
                                    <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></div>
                                ) : (
                                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">document_scanner</span>
                                )}
                                {isLoadingOCR ? 'Processando PDF...' : 'Autopreencher com IA (Simulado)'}
                            </button>
                        )}
                    </motion.div>
                )
            }


            {
                showAltText && (
                    <motion.div variants={itemVariants} custom={6} className="space-y-3">
                        <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-brand-blue">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">accessibility</span>
                                Texto Alternativo (Opcional)
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative group/tooltip">
                                    <span className="material-symbols-outlined text-gray-300 text-[18px] cursor-help hover:text-brand-blue transition-colors">help</span>
                                    <div className="absolute right-0 bottom-full mb-2 w-56 p-3 bg-gray-900 dark:bg-card-dark text-white text-[10px] rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 shadow-2xl font-medium leading-relaxed border border-white/10 normal-case tracking-normal">
                                        Descreva o que aparece na imagem ou vídeo para pessoas com deficiência visual. Uma boa descrição foca no que é essencial para entender a cena.
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold ${(watchedValues.altText || '').length > 300 ? 'text-brand-red' : 'text-gray-400'}`}>
                                    {(watchedValues.altText || '').length}/300
                                </span>
                            </div>
                        </label>

                        <textarea
                            rows={2} {...register('altText')}
                            className={`w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4 focus:ring-4 outline-none transition-all dark:text-white ${errors.altText ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-blue focus:ring-brand-blue/10'}`}
                            placeholder="Descreva visualmente o conteúdo para quem não pode ver."
                        />
                    </motion.div>
                )
            }


            <motion.div variants={itemVariants} custom={7} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">link</span>
                            Link Externo (Drive/Nuvem)
                        </div>
                        <div className="relative group/tooltip">
                            <span className="material-symbols-outlined text-gray-300 text-[18px] cursor-help hover:text-brand-blue transition-colors">help</span>
                            <div className="absolute right-0 bottom-full mb-2 w-56 p-3 bg-gray-900 dark:bg-card-dark text-white text-[10px] rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 shadow-2xl font-medium leading-relaxed border border-white/10 normal-case tracking-normal">
                                Use este campo para compartilhar portfólios, pastas no Google Drive ou qualquer link adicional relevante.
                            </div>
                        </div>
                    </label>

                    <input
                        type="url" {...register('externalLink')}
                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-gray-300 dark:focus:border-gray-600 dark:text-white"
                        placeholder="drive.google.com/..."
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-xl">build</span>
                        Detalhes Técnicos
                    </label>
                    <input
                        type="text" {...register('technicalDetails')}
                        className="w-full bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-4 outline-none focus:border-gray-300 dark:focus:border-gray-600 dark:text-white"
                        placeholder="Câmera, software, técnica..."
                    />
                </div>
            </motion.div>


            {/* Testimonial Section - Aesthetic matching Community Cards */}
            <motion.div variants={itemVariants} custom={7.5}
                className="bg-white dark:bg-card-dark rounded-[40px] p-8 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden"
            >
                {/* Decorative background icon */}
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[150px] rotate-12">format_quote</span>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-brand-yellow text-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-yellow/20">
                                    <span className="material-symbols-outlined text-2xl">star</span>
                                </div>
                                Seu Depoimento de Sucesso
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                Se você teve uma conquista acadêmica ou impacto positivo com seu trabalho, compartilhe conosco!
                                Queremos dar visibilidade às histórias por trás de cada projeto.
                            </p>
                        </div>
                    </div>

                    <textarea
                        rows={4} {...register('testimonial')}
                        className="w-full bg-gray-50 dark:bg-form-dark/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl px-6 py-4 outline-none focus:border-brand-yellow focus:ring-4 focus:ring-brand-yellow/10 transition-all dark:text-white italic"
                        placeholder="Ex: Este projeto me ajudou a conseguir um estágio no laboratório de..."
                    />

                </div>
            </motion.div>

            {/* Last Chance Guide Section */}
            <motion.div variants={itemVariants} custom={8} className="bg-brand-yellow/10 border-2 border-brand-yellow/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center text-gray-900 shadow-lg shadow-brand-yellow/20">
                        <span className="material-symbols-outlined font-bold">priority_high</span>
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">Última chance: Sua submissão está perfeita?</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Evite que seu material seja recusado conferindo os detalhes finais no guia.</p>
                    </div>
                </div>
                <a
                    href="/guia"
                    target="_blank"
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-md whitespace-nowrap"
                >
                    Revisar Guia de Qualidade
                </a>
            </motion.div>

            <motion.div variants={itemVariants} custom={9} className="space-y-5 pt-10 border-t-2 border-gray-100 dark:border-gray-800">
                <label className="flex items-start gap-4 cursor-pointer group">
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${watchedValues.readGuide ? 'bg-brand-blue border-brand-blue' : 'border-gray-300 group-hover:border-brand-blue'}`}>
                        {watchedValues.readGuide && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                        <input type="checkbox" className="hidden" {...register('readGuide')} />
                    </div>
                    <span className="text-xs text-white group-hover:text-white transition-colors font-black">
                        Confirmo que li o <Link href="/guia" target="_blank" className="text-brand-blue font-black underline decoration-4 decoration-brand-blue/30 hover:decoration-brand-blue transition-all">Guia de Boas Práticas</Link>. *
                    </span>
                    {errors.readGuide && <p className="text-red-500 text-[10px] font-bold">{errors.readGuide?.message}</p>}
                </label>
                <label className="flex items-start gap-4 cursor-pointer group">
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${watchedValues.acceptedCC ? 'bg-brand-red border-brand-red' : 'border-gray-300 group-hover:border-brand-red'}`}>
                        {watchedValues.acceptedCC && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                        <input type="checkbox" className="hidden" {...register('acceptedCC')} />
                    </div>
                    <span className="text-xs text-white group-hover:text-white transition-colors font-black">
                        Concordo em disponibilizar este material sob licença <span className="text-brand-red underline decoration-4 decoration-brand-red/30 hover:decoration-brand-red transition-all">Creative Commons</span>. *
                    </span>
                    {errors.acceptedCC && <p className="text-red-500 text-[10px] font-bold">{errors.acceptedCC?.message}</p>}
                </label>


            </motion.div>


            <motion.div variants={itemVariants} custom={10} className="flex justify-between items-center pt-10">
                <button
                    onClick={() => setStep('format')}
                    className="text-gray-500 font-black uppercase tracking-widest text-sm hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">west</span>
                    Voltar
                </button>
                <button
                    type="button"
                    onClick={handleSubmit(onFormSubmit as any)}
                    disabled={isLoading}
                    className={`group relative overflow-hidden px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 ${isLoading ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-brand-red/20 active:translate-y-0'}`}
                >

                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red opacity-100 transition-opacity"></div>
                    <span className="relative z-10 text-white flex items-center gap-3">
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                Concluir Envio
                                <span className="material-symbols-outlined group-hover:translate-x-1 decoration-3 transition-transform">rocket_launch</span>
                            </>
                        )}
                    </span>
                </button>
            </motion.div>

        </motion.div >
    );
}

