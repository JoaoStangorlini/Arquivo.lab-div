import { z } from 'zod';

export const submissionSchema = z.object({
    title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(60, 'Título muito longo (máx 60)'),
    authors: z.string().min(3, 'Informe os autores principais').max(60, 'Muito longo (máx 60)'),

    description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
    whatsapp: z.string(),
    videoUrl: z.string().url('Link inválido').or(z.literal('')),
    externalLink: z.string().url('Link inválido').or(z.literal('')),
    technicalDetails: z.string(),
    altText: z.string().max(300, 'Máximo 300 caracteres'),
    testimonial: z.string(),
    readGuide: z.boolean().refine(v => v === true, 'Você deve ler o guia'),
    acceptedCC: z.boolean().refine(v => v === true, 'Você deve aceitar a licença'),
    tags: z.array(z.string()),
    readingTime: z.number(),
    use_pseudonym: z.boolean(),
    coAuthors: z.array(z.object({
        id: z.string(),
        full_name: z.string(),
        email: z.string()
    }))
});




export type SubmissionFormData = z.infer<typeof submissionSchema>;
