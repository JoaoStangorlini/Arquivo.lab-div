'use client';

import React from 'react';
import { ReactionSystem } from './ReactionSystem';
import { KudosButton } from './KudosButton';

interface EngagementBarProps {
    submissionId: string;
    userId: string | undefined;
    receiverId: string;
    reactionsSummary: any;
    kudosTotal: number;
}

/**
 * Agrupa o sistema de reações e o botão de Kudos.
 * Isolado como Client Component para reduzir a carga de hidratação na página principal.
 */
export const EngagementBar = ({
    submissionId,
    userId,
    receiverId,
    reactionsSummary,
    kudosTotal
}: EngagementBarProps) => {
    return (
        <div className="flex flex-wrap items-center gap-4 py-6 border-t border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reagente:</span>
                <ReactionSystem
                    submissionId={submissionId}
                    userId={userId}
                    initialSummary={reactionsSummary}
                />
            </div>

            <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reconhecimento:</span>
                <KudosButton
                    submissionId={submissionId}
                    senderId={userId}
                    receiverId={receiverId}
                    initialKudos={kudosTotal}
                />
            </div>
        </div>
    );
};
