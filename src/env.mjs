import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🏗️ Hub de Comunicação Científica - V3.0 Release Candidate
 * Validação Atômica de Variáveis de Ambiente
 */

const clientSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().min(1),
    NEXT_PUBLIC_BUILD_ID: z.string().optional(),
});

const serverSchema = z.object({
    ADMIN_PASSWORD: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    ADMIN_EMAIL: z.string().email(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// 1. Validate Client Variables
const _clientEnv = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    NEXT_PUBLIC_BUILD_ID: process.env.NEXT_PUBLIC_BUILD_ID,
});

// 2. Validate Server Variables
const _serverEnv = serverSchema.safeParse({
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    NODE_ENV: process.env.NODE_ENV,
});

if (!_clientEnv.success || !_serverEnv.success) {
    console.error('❌ [V3.0 RC] ERRO CRÍTICO: Falha na validação das variáveis de ambiente.');
    if (!_clientEnv.success) console.error('Client:', _clientEnv.error.flatten().fieldErrors);
    if (!_serverEnv.success) console.error('Server:', _serverEnv.error.flatten().fieldErrors);
    process.exit(1);
}

// 🛡️ Safe-Access: No Proxy, avoid breaking telemetry/minification
export const env = _clientEnv.data;
export const serverEnv = typeof window === 'undefined' ? _serverEnv.data : undefined;

if (process.env.NODE_ENV !== 'production') {
    if (typeof window === 'undefined') {
        const isFirebase = process.env.FIREBASE_CONFIG || process.env.GOOGLE_CLOUD_PROJECT;
        const envLabel = isFirebase ? '🚀 PRODUCTION (FIREBASE)' : '💻 LOCAL DEVELOPMENT';
        const buildInfo = _clientEnv.data?.NEXT_PUBLIC_BUILD_ID ? ` | Build: ${_clientEnv.data.NEXT_PUBLIC_BUILD_ID}` : '';
        // Zero-Log Audit: Removido log de infraestrutura para produção
    }
}
