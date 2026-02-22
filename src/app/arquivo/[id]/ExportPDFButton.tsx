'use client';

import React from 'react';

export function ExportPDFButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-[#0055ff]/10 hover:text-[#0055ff] text-gray-600 dark:text-gray-300 font-bold rounded-xl text-sm transition-all border border-gray-200 dark:border-gray-700"
            title="Exportar como PDF (usa window.print com KaTeX renderizado)"
        >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Exportar PDF
        </button>
    );
}
