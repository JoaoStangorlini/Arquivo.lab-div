'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectionToolbarProps {
    onComment: (text: string, range: Range) => void;
    onNote: (text: string, range: Range) => void;
    onCorrection: (text: string, range: Range) => void;
}

export function TextSelectionHandler({ onComment, onNote, onCorrection }: SelectionToolbarProps) {
    const [position, setPosition] = useState({ x: 0, y: 0, show: false });
    const [selectedText, setSelectedText] = useState('');
    const [currentRange, setCurrentRange] = useState<Range | null>(null);

    useEffect(() => {
        const handleMouseUp = () => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Only show if the selection is within the main article content
                // We'll rely on the parent to ensure this component is only active where appropriate

                setSelectedText(selection.toString().trim());
                setCurrentRange(range);
                setPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top + window.scrollY - 10,
                    show: true
                });
            } else {
                setPosition(prev => ({ ...prev, show: false }));
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            // Don't hide if clicking the toolbar itself
            if ((e.target as HTMLElement).closest('.selection-toolbar')) return;
            setPosition(prev => ({ ...prev, show: false }));
        };

        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    const handleAction = (type: 'comment' | 'note' | 'correction') => {
        if (!currentRange) return;

        if (type === 'comment') onComment(selectedText, currentRange);
        if (type === 'note') onNote(selectedText, currentRange);
        if (type === 'correction') onCorrection(selectedText, currentRange);

        setPosition(prev => ({ ...prev, show: false }));
        window.getSelection()?.removeAllRanges();
    };

    return (
        <AnimatePresence>
            {position.show && (
                <motion.div
                    initial={{ opacity: 0, y: 10, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 10, x: '-50%' }}
                    className="selection-toolbar fixed z-[120] bg-gray-900 text-white rounded-lg shadow-2xl flex items-center overflow-hidden border border-white/10"
                    style={{
                        left: position.x,
                        top: position.y - 45 // Offset above selection
                    }}
                >
                    <ActionButton
                        icon="add_comment"
                        label="Comentar"
                        onClick={() => handleAction('comment')}
                    />
                    <div className="w-px h-8 bg-white/10" />
                    <ActionButton
                        icon="edit_note"
                        label="Nota"
                        onClick={() => handleAction('note')}
                    />
                    <div className="w-px h-8 bg-white/10" />
                    <ActionButton
                        icon="spellcheck"
                        label="Corrigir"
                        onClick={() => handleAction('correction')}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ActionButton({ icon, label, onClick }: { icon: string, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
        >
            <span className="material-symbols-outlined text-lg">{icon}</span>
            {label}
        </button>
    );
}
