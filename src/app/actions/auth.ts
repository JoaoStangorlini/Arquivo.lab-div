'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const password = formData.get('password') as string;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (password === adminPassword) {
        // Simple session cookie for the demo
        (await cookies()).set('admin_session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });
        redirect('/admin');
    } else {
        return { error: 'Senha incorreta. Tente novamente.' };
    }
}

export async function signOut(redirectTo: string = '/') {
    (await cookies()).delete('admin_session');
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
    revalidatePath('/');
    redirect(redirectTo);
}

