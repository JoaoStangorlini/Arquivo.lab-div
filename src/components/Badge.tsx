'use client';

import { motion } from 'framer-motion';
import { Award, ShieldCheck, Zap, BookOpen, Star } from 'lucide-react';

interface BadgeProps {
    name: string;
    description: string;
    icon?: string;
    type?: 'pioneiro' | 'curador' | 'elite' | 'colaborador' | 'mestre';
    awardedAt?: string;
    isLocked?: boolean;
}

const badgeStyles = {
    pioneiro: {
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        icon: <Zap size={24} />,
        gradient: 'from-blue-500/20 to-transparent'
    },
    curador: {
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        icon: <ShieldCheck size={24} />,
        gradient: 'from-purple-500/20 to-transparent'
    },
    elite: {
        color: 'text-[#0055ff]',
        bg: 'bg-[#0055ff]/10',
        border: 'border-[#0055ff]/20',
        icon: <Star size={24} />,
        gradient: 'from-[#0055ff]/20 to-transparent'
    },
    colaborador: {
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        icon: <BookOpen size={24} />,
        gradient: 'from-green-500/20 to-transparent'
    },
    mestre: {
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        icon: <Award size={24} />,
        gradient: 'from-yellow-500/20 to-transparent'
    }
};

export const Badge = ({ name, description, type = 'colaborador', isLocked = false }: BadgeProps) => {
    const style = badgeStyles[type] || badgeStyles.colaborador;

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={`relative p-4 rounded-2xl border ${style.border} ${style.bg} ${isLocked ? 'grayscale opacity-40' : ''} transition-all group overflow-hidden`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-50`} />

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`${style.color} mb-3 group-hover:scale-110 transition-transform`}>
                    {style.icon}
                </div>
                <h4 className="text-xs font-black dark:text-white mb-1 uppercase tracking-tighter">
                    {name}
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
                    {description}
                </p>
            </div>

            {!isLocked && (
                <div className="absolute top-1 right-1">
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`w-1 h-1 rounded-full ${style.color.replace('text-', 'bg-')}`}
                    />
                </div>
            )}
        </motion.div>
    );
};
