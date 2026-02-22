'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useReadingExperience } from './ReadingExperienceProvider';
import { PresentationMode } from './PresentationMode';
import { ReadingToolbar } from './ReadingToolbar';
import { SpeechPlayer } from './SpeechPlayer';
import { PresenceIndicator } from './PresenceIndicator';
import { TextSelectionHandler } from './TextSelectionHandler';
import { PrivateNoteModal } from './PrivateNoteModal';
import { CorrectionModal } from './CorrectionModal';
import { generateSelectionHash, getSelectionContext } from '@/lib/selection-utils';

interface ReadingViewManagerProps {
    submission: any;
    children: React.ReactNode;
}

export function ReadingViewManager({ submission, children }: ReadingViewManagerProps) {
    const { isPresentationMode, setPresentationMode } = useReadingExperience();

    // Modal & Selection States
    const [activeModal, setActiveModal] = useState<'note' | 'correction' | null>(null);
    const [selectionData, setSelectionData] = useState<{ text: string, hash: string, submissionId: string } | null>(null);

    const handleComment = (text: string, range: Range) => {
        // Find the closest paragraph or block element to get an ID
        let container = range.commonAncestorContainer.parentElement;
        while (container && container.tagName !== 'P' && container.tagName !== 'BLOCKQUOTE' && container.tagName !== 'H1' && container.tagName !== 'H2' && container.tagName !== 'H3') {
            container = container.parentElement;
        }

        const blockId = container?.getAttribute('data-block-id') || 'general';

        // Scroll to comments and focus or open a small inline input
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
            // toast might need to be imported or available globally. It's usually imported from react-hot-toast.
        }
    };

    const handleNote = (text: string, range: Range) => {
        const { prefix, suffix } = getSelectionContext(range);
        const hash = generateSelectionHash(text, prefix, suffix);
        setSelectionData({ text, hash, submissionId: submission.id });
        setActiveModal('note');
    };

    const handleCorrection = (text: string, range: Range) => {
        setSelectionData({ text, hash: '', submissionId: submission.id });
        setActiveModal('correction');
    };

    return (
        <>
            {/* Real-time and TTS background logic */}
            <PresenceIndicator submissionId={submission.id} />
            <SpeechPlayer content={submission.description} />

            {/* Contextual Interactions */}
            {!isPresentationMode && (
                <TextSelectionHandler
                    onComment={handleComment}
                    onNote={handleNote}
                    onCorrection={handleCorrection}
                />
            )}

            {/* Modals */}
            <AnimatePresence>
                {activeModal === 'note' && selectionData && (
                    <PrivateNoteModal
                        selection={selectionData}
                        onClose={() => setActiveModal(null)}
                        onSave={() => setActiveModal(null)}
                    />
                )}
                {activeModal === 'correction' && selectionData && (
                    <CorrectionModal
                        selection={selectionData}
                        onClose={() => setActiveModal(null)}
                        onSave={() => setActiveModal(null)}
                    />
                )}
            </AnimatePresence>

            {/* Toolbar always visible unless in presentation mode */}
            {!isPresentationMode && (
                <ReadingToolbar submissionTitle={submission.title} />
            )}

            {/* View Switcher */}
            {isPresentationMode ? (
                <PresentationMode
                    content={submission.description}
                    onClose={() => setPresentationMode(false)}
                />
            ) : (
                children
            )}
        </>
    );
}
