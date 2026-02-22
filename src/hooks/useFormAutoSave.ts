import { useEffect, useRef } from 'react';
import { UseFormReturn, FieldValues, Path, PathValue } from 'react-hook-form';

interface AutoSaveOptions {
    key: string;
    debounceMs?: number;
}

export function useFormAutoSave<T extends FieldValues>(
    form: UseFormReturn<T>,
    options: AutoSaveOptions
) {
    const { watch, setValue, reset } = form;
    const { key, debounceMs = 1000 } = options;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // We use reset with the saved values to ensure the form is initialized correctly
                // including isDirty state if we want to preserve it, but usually reset(parsed) is best.
                reset(parsed);
            } catch (e) {
                console.error('Error loading auto-save data:', e);
            }
        }
    }, [key, reset]);

    // Save to localStorage when watched values change
    useEffect(() => {
        const subscription = watch((value) => {
            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                localStorage.setItem(key, JSON.stringify(value));
            }, debounceMs);
        });

        return () => {
            subscription.unsubscribe();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [watch, key, debounceMs]);

    const clearAutoSave = () => {
        localStorage.removeItem(key);
    };

    return { clearAutoSave };
}
