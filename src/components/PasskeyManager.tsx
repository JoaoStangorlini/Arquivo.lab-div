'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Passkey {
    id: string;
    credential_id: string;
    created_at: string;
    last_used_at?: string;
}

export function PasskeyManager() {
    const [passkeys, setPasskeys] = useState<Passkey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSupported, setIsSupported] = useState<boolean | null>(null);

    useEffect(() => {
        // Check for WebAuthn support
        const supported = !!(window.PublicKeyCredential &&
            window.isSecureContext);
        setIsSupported(supported);
        fetchPasskeys();
    }, []);

    const fetchPasskeys = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('webauthn_credentials')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching passkeys:', error);
        } else {
            setPasskeys(data || []);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover esta chave de acesso?')) return;

        const loadingToast = toast.loading('Removendo chave...');
        const { error } = await supabase
            .from('webauthn_credentials')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Erro ao remover: ' + error.message, { id: loadingToast });
        } else {
            toast.success('Chave removida', { id: loadingToast });
            setPasskeys(prev => prev.filter(pk => pk.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold dark:text-white">Chaves de Acesso (Passkeys)</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Use biometria ou reconhecimento facial para entrar com segurança.
                    </p>
                </div>
                {isSupported === true && (
                    <button
                        onClick={() => toast.success('Funcionalidade de registro será ativada em breve!')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                    >
                        <span className="material-symbols-outlined">add_moderator</span>
                        Configurar Nova Chave
                    </button>
                )}
            </div>

            {isSupported === false && (
                <div className="p-4 bg-brand-red/5 border border-brand-red/20 rounded-2xl flex gap-3 text-brand-red">
                    <span className="material-symbols-outlined shrink-0">unfold_less</span>
                    <p className="text-xs leading-relaxed">
                        Este navegador ou ambiente (sem HTTPS) não suporta autenticação via Passkeys. Tente usar um navegador moderno em uma conexão segura.
                    </p>
                </div>
            )}

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="p-8 text-center bg-white dark:bg-[#1e1e1e] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <span className="material-symbols-outlined animate-spin text-slate-400">progress_activity</span>
                        <p className="text-sm text-slate-500 mt-2">Buscando chaves cadastradas...</p>
                    </div>
                ) : passkeys.length === 0 ? (
                    <div className="p-10 text-center bg-white dark:bg-[#1e1e1e] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl text-slate-400">fingerprint</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Nenhuma chave configurada</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                            Passkeys são uma alternativa mais segura e rápida que senhas tradicionais.
                        </p>
                    </div>
                ) : (
                    passkeys.map(pk => (
                        <div
                            key={pk.id}
                            className="group flex items-center justify-between p-5 bg-white dark:bg-[#1e1e1e] rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-brand-blue/30 transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-2xl group-hover:bg-brand-blue group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-2xl">fingerprint</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                                        ID: {pk.credential_id.substring(0, 16)}...
                                    </p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                                        Criada em {new Date(pk.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(pk.id)}
                                className="p-2 text-slate-300 hover:text-brand-red transition-colors"
                                title="Remover chave"
                            >
                                <span className="material-symbols-outlined">delete_outline</span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-brand-blue/5 dark:bg-brand-blue/10 p-6 rounded-3xl border border-brand-blue/10">
                <div className="flex gap-4">
                    <span className="material-symbols-outlined text-brand-blue mt-0.5">info</span>
                    <div className="text-sm text-brand-blue/80 dark:text-brand-blue/90 leading-relaxed">
                        <p className="font-bold mb-1">Por que usar Passkeys?</p>
                        Passkeys utilizam criptografia de chave pública e não podem ser roubadas por phishing. Suas chaves ficam seguras no seu dispositivo (Keychain, Google Password Manager, etc).
                    </div>
                </div>
            </div>
        </div>
    );
}
