'use client';

import React from 'react';
import { ViewTracker } from '@/components/ViewTracker';
import { ReadingHistoryTracker } from '@/components/history/ReadingHistoryTracker';

interface EngagementHistoryHubProps {
    submissionId: string;
    userId: string | undefined;
}

/**
 * Hub para trackers do lado do cliente.
 * Deve ser importado via 'dynamic' com { ssr: false } para garantir
 * que o tracking ocorra apenas no ambiente do browser.
 */
const EngagementHistoryHub = ({ submissionId, userId }: EngagementHistoryHubProps) => {
    return (
        <>
            <ViewTracker submissionId={submissionId} />
            {userId && <ReadingHistoryTracker submissionId={submissionId} userId={userId} />}
        </>
    );
};

export default EngagementHistoryHub;
