'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicEngagementHistoryHub = dynamic(() => import('./EngagementHistoryHub'), { ssr: false });
const DynamicEngagementBar = dynamic(() => import('./EngagementBar').then(m => m.EngagementBar), {
    ssr: false,
    loading: () => <div className="h-20 animate-pulse bg-gray-50 dark:bg-gray-900/50 rounded-2xl w-full border border-gray-100 dark:border-gray-800"></div>
});

interface ArquivoItemClientHydrationProps {
    submissionId: string;
    userId: string | undefined;
    receiverId: string;
    reactionsSummary: any;
    kudosTotal: number;
    type: 'hub' | 'bar';
}

export function ArquivoItemClientHydration({
    submissionId,
    userId,
    receiverId,
    reactionsSummary,
    kudosTotal,
    type
}: ArquivoItemClientHydrationProps) {
    if (type === 'hub') {
        return <DynamicEngagementHistoryHub submissionId={submissionId} userId={userId} />;
    }

    return (
        <DynamicEngagementBar
            submissionId={submissionId}
            userId={userId}
            receiverId={receiverId}
            reactionsSummary={reactionsSummary}
            kudosTotal={kudosTotal}
        />
    );
}
