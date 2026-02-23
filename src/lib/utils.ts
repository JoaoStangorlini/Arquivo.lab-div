import React, { ReactNode } from 'react';

/**
 * Utility to strip Markdown and LaTeX from a string.
 * Used for clean text previews in cards/meta tags.
 */
export function stripMarkdownAndLatex(text: string | null | undefined): string {
    if (!text) return '';

    let clean = text;

    // 1. Remove LaTeX Display Math: $$ ... $$ or \[ ... \]
    clean = clean.replace(/\$\$[\s\S]*?\$\$/g, '');
    clean = clean.replace(/\\\[[\s\S]*?\\\]/g, '');

    // 2. Remove LaTeX Inline Math: $ ... $ or \( ... \)
    clean = clean.replace(/\$.*?\$/g, '');
    clean = clean.replace(/\\\([\s\S]*?\\\)/g, '');

    // 3. Remove LaTeX Commands: \command{...}{...} or \command[...]{...} or \command
    clean = clean.replace(/\\[a-zA-Z*]+(?:\[.*?\])?(?:\{.*?\})*/g, '');

    // 4. Remove Markdown Links: [text](url) -> text
    clean = clean.replace(/\[(.*?)\]\(.*?\)/g, '$1');

    // 5. Remove Markdown Formatting: **, *, __, _, ~~
    clean = clean.replace(/(\*\*|__)(.*?)\1/g, '$2');
    clean = clean.replace(/(\*|_)(.*?)\1/g, '$2');
    clean = clean.replace(/~~(.*?)~~/g, '$1');

    // 6. Remove Markdown Headers: # Header
    clean = clean.replace(/^#+\s+/gm, '');

    // 7. Remove Markdown Images: ![alt](url)
    clean = clean.replace(/!\[.*?\]\(.*?\)/g, '');

    // 8. Remove Code blocks and inline code
    clean = clean.replace(/```[\s\S]*?```/g, '');
    clean = clean.replace(/`.*?`/g, '');

    // 9. Remove leftover LaTeX artifacts: { }, _, ^, \
    clean = clean.replace(/[{}_\^]/g, '');
    clean = clean.replace(/\\/g, '');

    // 10. Clean up extra whitespace/newlines
    clean = clean.replace(/\n\s*\n/g, '\n').trim();
    clean = clean.replace(/[ \t]+/g, ' ');

    return clean;
}

/**
 * Proxy external avatar URLs to our own API route for caching.
 */
export function getAvatarUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('/') || url.startsWith('data:')) return url;
    return `/api/avatar?url=${encodeURIComponent(url)}`;
}

/**
 * Formats a date string to pt-BR.
 */
export function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Highlight a query match in a string, escaping special characters for React.
 */
export function highlightMatch(text: string, query: string): string | ReactNode {
    if (!query || !query.trim() || query.length < 2) return text;
    const cleanQuery = query.startsWith('#') ? query.slice(1) : query;
    const regex = new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return React.createElement(
        React.Fragment,
        null,
        ...parts.map((part, i) =>
            part.toLowerCase() === cleanQuery.toLowerCase() ?
                React.createElement('mark', { key: i, className: "bg-brand-yellow/40 text-gray-900 dark:text-white rounded-sm px-0.5 font-black" }, part) :
                part
        )
    );
}
