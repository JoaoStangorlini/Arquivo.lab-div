/**
 * Generates a simple hash for a text selection context to help relocate it.
 * In a real-world scenario, this would be more complex (XPath/Offset).
 * For now, we'll use a combination of text content and context.
 */
export function generateSelectionHash(text: string, contextPrefix: string, contextSuffix: string): string {
    const raw = `${contextPrefix}|${text}|${contextSuffix}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
}

/**
 * Gets context around a range for better hashing
 */
export function getSelectionContext(range: Range) {
    const text = range.toString();
    const container = range.commonAncestorContainer.parentElement;
    if (!container) return { text, prefix: '', suffix: '' };

    const fullText = container.textContent || '';
    const startOffset = fullText.indexOf(text);

    const prefix = fullText.substring(Math.max(0, startOffset - 20), startOffset);
    const suffix = fullText.substring(startOffset + text.length, startOffset + text.length + 20);

    return { text, prefix, suffix };
}
