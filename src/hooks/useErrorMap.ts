import { toast } from 'react-hot-toast';

/**
 * 🛡️ Hub de Comunicação Científica - useErrorMap (Golden Master V3.6)
 * Mapeamento Centralizado de Erros para UX Premium e Segurança de Dados.
 */

const ERROR_MAP: Record<string, { message: string, icon?: string }> = {
    'ERR_PSEUDONYM_LIMIT': {
        message: 'Você atingiu o limite de 2 pseudônimos ativos. Por favor, use um nome já utilizado ou seu nome real.',
        icon: '🛡️'
    },
    'ERR_DATABASE_GENERAL': {
        message: 'Ocorreu um erro no servidor. Por favor, tente novamente em instantes.',
        icon: '❌'
    },
    'AUTH_REQUIRED': {
        message: 'Sessão expirada. Por favor, faça login novamente.',
        icon: '🔑'
    },
    'FORBIDDEN': {
        message: 'Você não tem permissão para realizar esta ação.',
        icon: '🚫'
    }
};

export function useErrorMap() {
    const notifyError = (code: string | string[]) => {
        const errorCode = Array.isArray(code) ? code[0] : code;
        const error = ERROR_MAP[errorCode] || ERROR_MAP['ERR_DATABASE_GENERAL'];

        toast.error(error.message, {
            icon: error.icon,
            id: errorCode // Evita toasts duplicados do mesmo erro
        });
    };

    return { notifyError };
}
