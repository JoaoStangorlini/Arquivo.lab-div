'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to handle the browser/hardware back button to close modals.
 * 
 * @param isOpen - Whether the modal/overlay is currently open
 * @param onClose - Function to call when closing the modal
 */
export function useHistoryBack(isOpen: boolean, onClose: () => void) {
    const isHandlingRef = useRef(false);

    useEffect(() => {
        if (!isOpen) return;

        // 1. Push a virtual state to history
        window.history.pushState({ modal: true }, '');

        // 2. Scroll Lock (CLS Zero)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // On Desktop, scrollbar-gutter: stable is defined in globals.css
        // We only need to hide overflow
        document.body.style.overflow = 'hidden';

        const handlePopState = (event: PopStateEvent) => {
            // If user clicks back button, close modal
            onClose();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);

            // Cleanup Scroll Lock
            document.body.style.overflow = '';

            // 3. History Cleanup (Agnostic)
            // If the modal is closing NOT via back button (e.g. click outside or X)
            // we must remove the virtual state manually
            if (window.history.state?.modal) {
                window.history.back();
            }
        };
    }, [isOpen, onClose]);
};
