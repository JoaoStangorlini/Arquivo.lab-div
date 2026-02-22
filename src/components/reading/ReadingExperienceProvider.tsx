'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ReadingExperienceContextType {
    isFocusMode: boolean;
    setFocusMode: (val: boolean) => void;
    isPresentationMode: boolean;
    setPresentationMode: (val: boolean) => void;
    isAudioPlaying: boolean;
    setAudioPlaying: (val: boolean) => void;
}

const ReadingExperienceContext = createContext<ReadingExperienceContextType | undefined>(undefined);

export function ReadingExperienceProvider({ children }: { children: React.ReactNode }) {
    const [isFocusMode, setFocusMode] = useState(false);
    const [isPresentationMode, setPresentationMode] = useState(false);
    const [isAudioPlaying, setAudioPlaying] = useState(false);

    // Sync focus mode with body classes to hide global Header/Footer
    useEffect(() => {
        if (isFocusMode) {
            document.body.classList.add('reading-focus-mode');
        } else {
            document.body.classList.remove('reading-focus-mode');
        }
    }, [isFocusMode]);

    // Handle Escape key to exit modes
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isPresentationMode) setPresentationMode(false);
                else if (isFocusMode) setFocusMode(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFocusMode, isPresentationMode]);

    return (
        <ReadingExperienceContext.Provider
            value={{
                isFocusMode, setFocusMode,
                isPresentationMode, setPresentationMode,
                isAudioPlaying, setAudioPlaying
            }}
        >
            {children}
        </ReadingExperienceContext.Provider>
    );
}

export function useReadingExperience() {
    const context = useContext(ReadingExperienceContext);
    if (!context) {
        throw new Error('useReadingExperience must be used within a ReadingExperienceProvider');
    }
    return context;
}
