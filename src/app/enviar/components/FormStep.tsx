'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSubmissionStore } from '@/store/useSubmissionStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useFormAutoSave } from '@/hooks/useFormAutoSave';

import { submissionSchema, type SubmissionFormData } from '../schema';
import { BasicDetailsStep } from './BasicDetailsStep';
import { OptionalDetailsStep } from './OptionalDetailsStep';
import { createSubmission, getUserPseudonyms } from '@/app/actions/submissions';

export function FormStep() {
    const router = useRouter();
    const { currentStep, category, mediaType, reset: resetStore, selectedFiles } = useSubmissionStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const methods = useForm<SubmissionFormData>({
        resolver: zodResolver(submissionSchema) as any,
        shouldUnregister: false,
        defaultValues: {
            title: '',
            authors: '',
            description: '',
            whatsapp: '',
            video_url: '',
            external_link: '',
            technical_details: '',
            alt_text: '',
            testimonial: '',
            read_guide: false,
            accepted_cc: false,
            tags: [],
            reading_time: 0,
            co_authors: [],
            use_pseudonym: false,
            event_year: new Date().getFullYear().toString(),
            pseudonym_id: undefined,
            new_pseudonym: ''
        }
    });

    const { clearAutoSave } = useFormAutoSave(methods as any, {
        key: 'submission-form-draft',
        debounceMs: 1500
    });

    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ifusp_uploads');
        formData.append('folder', 'submissions');

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const resourceType = (mediaType === 'image' || mediaType === 'pdf') ? 'image' : 'video';

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const errData = await res.json();
            console.error("Cloudinary upload error:", errData);
            throw new Error("Falha no upload (Erro Cloudinary)");
        }

        const data = await res.json();
        return data.secure_url;
    };

    const parseYoutubeUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const onFormSubmit = async (data: SubmissionFormData) => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error("Você precisa estar logado.");

            let finalMediaUrl: string[] = [];
            const showFileUpload = ['image', 'pdf', 'zip', 'sdocx'].includes(mediaType);
            const showVideoUrl = mediaType === 'video';

            if (showFileUpload) {
                if (selectedFiles.length === 0) throw new Error("Selecione os arquivos.");
                finalMediaUrl = await Promise.all(selectedFiles.map(f => uploadToCloudinary(f)));
            } else if (showVideoUrl) {
                const vidId = parseYoutubeUrl(data.video_url || '');
                if (!vidId) throw new Error("Link YouTube inválido.");
                finalMediaUrl = [`https://www.youtube.com/embed/${vidId}`];
            }

            const MEDIA_TYPE_MAP: Record<string, string> = {
                'image': 'image',
                'video': 'video',
                'pdf': 'pdf',
                'zip': 'zip',
                'sdocx': 'sdocx',
                'text': 'text',
                'link': 'link'
            };

            const payloadFields = {
                ...data,
                category: category || 'Outros',
                media_type: (MEDIA_TYPE_MAP[mediaType] || mediaType) as any,
                media_url: mediaType === 'video' ? (data.video_url || '') : JSON.stringify(finalMediaUrl),
            };

            console.log("Calling createSubmission with payload:", JSON.stringify({
                ...payloadFields,
                media_url: mediaType === 'video' ? payloadFields.media_url : 'FILE_DATA_JSON',
            }, null, 2));

            const result = await createSubmission(payloadFields as any);

            console.log("createSubmission server response:", JSON.stringify(result, null, 2));

            if (result.error) {
                const err = result.error as any;
                let message = err.message || "Erro ao enviar. Verifique os dados.";

                if (err.database && err.database.length > 0) {
                    const dbError = err.database[0];
                    if (dbError.includes('LIMITE_PSEUDONIMO_ATINGIDO')) {
                        message = "Você atingiu o limite de publicações ativas com o mesmo apelido (máximo 2). Desative o apelido ou exclua uma submissão antiga.";
                    } else {
                        message = dbError; // Exibe o erro real do DB (ex: column not found)
                    }
                }

                const validationFields = err.validation ? Object.keys(err.validation).join(', ') : '';

                toast.error(`${message} ${validationFields ? `(Campos inválidos: ${validationFields})` : ''}`);
                console.error("Submission Error Details:", result.error);
            } else {
                clearAutoSave();
                setIsSubmitted(true);
                toast.success("Enviado com sucesso!");
                setTimeout(() => {
                    methods.reset();
                    resetStore();
                    router.push('/');
                }, 5000);
            }
        } catch (err: any) {
            toast.error(err.message || "Erro inesperado.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
                <div className="w-32 h-32 bg-brand-yellow rounded-full flex items-center justify-center text-white shadow-2xl mx-auto">
                    <span className="material-symbols-outlined text-6xl">rocket_launch</span>
                </div>
                <h2 className="text-4xl font-black italic">Voou!</h2>
                <p className="text-gray-400">Sua contribuição foi recebida e será analisada.</p>
                <div className="flex items-center justify-center gap-2 text-brand-blue font-bold uppercase tracking-widest text-xs pt-10">
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Voltando para a home...
                </div>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            {currentStep === 'basic' && <BasicDetailsStep />}
            {currentStep === 'optional' && <OptionalDetailsStep onSubmit={onFormSubmit} isLoading={isLoading} />}
        </FormProvider>
    );
}
