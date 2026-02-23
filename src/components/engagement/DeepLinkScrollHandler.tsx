'use client';

import { useEffect } from 'react';
import { handleDeepLinkScroll } from '@/lib/deep-link';

export const DeepLinkScrollHandler = () => {
    useEffect(() => {
        handleDeepLinkScroll();
    }, []);
    return null;
};
