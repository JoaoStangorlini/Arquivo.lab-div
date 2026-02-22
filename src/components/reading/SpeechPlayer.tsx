'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useReadingExperience } from './ReadingExperienceProvider';

export function SpeechPlayer({ content }: { content: string }) {
    const { isAudioPlaying, setAudioPlaying } = useReadingExperience();
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (!synth) return;

        const loadVoices = () => {
            const availableVoices = synth.getVoices();
            setVoices(availableVoices.filter(v => v.lang.startsWith('pt')));
        };

        loadVoices();
        synth.onvoiceschanged = loadVoices;
    }, [synth]);

    useEffect(() => {
        if (!synth) return;

        if (isAudioPlaying) {
            // Clean content: remove LaTeX formulas and markdown symbols
            const cleanText = content
                .replace(/\$\$[\s\S]*?\$\$/g, '[fórmula matemática]') // Block LaTeX
                .replace(/\$.*?\$/g, '[fórmula]') // Inline LaTeX
                .replace(/#+ /g, '') // Headers
                .replace(/\*\*|\*/g, '') // Bold/Italic
                .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
                .replace(/!\[.*?\]\(.*?\)/g, '[imagem]'); // Images

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'pt-BR';

            // Try to find a good Portuguese voice
            const ptVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
            if (ptVoice) utterance.voice = ptVoice;

            utterance.onend = () => setAudioPlaying(false);
            utterance.onerror = () => setAudioPlaying(false);

            utteranceRef.current = utterance;
            synth.speak(utterance);
        } else {
            synth.cancel();
        }

        return () => {
            synth.cancel();
        };
    }, [isAudioPlaying, content, voices, synth]);

    return null; // Interface is in the Toolbar
}
