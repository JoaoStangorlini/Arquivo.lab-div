'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Performance: lazy-load PwaManager on client only
const PwaManagerLazy = dynamic(
    () => import('@/components/pwa/PwaManager').then(mod => mod.PwaManager)
);

export function ClientPwaManager() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;
    return <PwaManagerLazy />;
}
