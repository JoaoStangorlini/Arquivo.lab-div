'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { getAvatarUrl } from '@/lib/utils';

interface AvatarProps {
    src?: string | null;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
    className?: string;
    customSize?: string;
}

const sizeClasses = {
    xs: 'size-6',
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
    xl: 'size-20',
    custom: '',
};

export const Avatar = ({ src, name = 'Usuário', size = 'md', className = '', customSize }: AvatarProps) => {
    const [error, setError] = useState(false);

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 3;
    const placeholderColors = [
        'bg-brand-blue/10 text-brand-blue',
        'bg-brand-yellow/10 text-brand-yellow',
        'bg-brand-red/10 text-brand-red',
    ];

    const sizeClass = size === 'custom' ? customSize : sizeClasses[size];

    if (src && !error) {
        return (
            <div className={`rounded-full overflow-hidden border border-gray-200 dark:border-gray-800 shrink-0 ${sizeClass} ${className}`}>
                <img
                    src={getAvatarUrl(src)}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            </div>
        );
    }

    return (
        <div className={`rounded-full flex items-center justify-center shrink-0 font-black uppercase tracking-tighter ${placeholderColors[colorIndex]} ${sizeClass} ${className}`}>
            {initials || <User className="w-1/2 h-1/2 opacity-50" />}
        </div>
    );
};
