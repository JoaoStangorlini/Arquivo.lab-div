'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AutocompleteSuggestion {
    suggestion: string;
    type: 'tag' | 'title';
}

const suggestionCache = new Map<string, { data: AutocompleteSuggestion[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useSearchAutocomplete(query: string) {
    const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            // Check cache
            const cached = suggestionCache.get(query);
            if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
                setSuggestions(cached.data);
                return;
            }

            setIsLoading(true);
            try {
                const { data, error } = await supabase.rpc('search_autocomplete', {
                    search_term: query
                });

                if (error) throw error;
                const results = data || [];

                // Set cache
                suggestionCache.set(query, { data: results, timestamp: Date.now() });
                setSuggestions(results);
            } catch (err) {
                console.error('Error fetching autocomplete suggestions:', err);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [query]);

    return { suggestions, isLoading };
}
