import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

/**
 * Exporta um elemento HTML específico para um arquivo PDF com múltiplas páginas se necessário.
 * Ideal para manter formatação de Markdown e KaTeX com precisão.
 * @param elementId ID do contêiner a ser exportado
 * @param filename Nome do arquivo PDF gerado
 */
export async function exportElementToPDF(elementId: string, filename: string = 'material.pdf'): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error('Elemento não encontrado na página.');
    }

    // Criamos um clone ou alteramos estilos críticos antes do snapshot
    // para garantir legibilidade no PDF (forçando fundo branco e texto legível)
    const originalStyle = {
        background: element.style.background,
        color: element.style.color,
    };

    // Temporarily overriding styles for a clean "print" look
    // This expects the element to contain prose prose-invert etc, which might still be dark
    // For a robust solution, we use the user's current theme visually.

    try {
        const dataUrl = await toPng(element, {
            quality: 0.95,
            backgroundColor: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#0a0a0b' : '#ffffff',
            style: {
                transform: 'scale(1)', // Fix translation issues if any
            }
        });

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 15; // 15mm nas bordas

        const imgProps = pdf.getImageProperties(dataUrl);
        const imgRatio = imgProps.width / imgProps.height;

        const targetWidth = pdfWidth - (margin * 2);
        const targetHeight = targetWidth / imgRatio;

        let heightLeft = targetHeight;
        let position = margin; // Top margin

        // Adiciona primeira página
        pdf.addImage(dataUrl, 'PNG', margin, position, targetWidth, targetHeight);
        heightLeft -= (pdfHeight - (margin * 2));

        // Adiciona páginas subsequentes
        while (heightLeft >= 0) {
            position = heightLeft - targetHeight + margin; // Desloca para cima
            pdf.addPage();
            pdf.addImage(dataUrl, 'PNG', margin, position, targetWidth, targetHeight);
            heightLeft -= (pdfHeight - (margin * 2));
        }

        // Salva arquivo
        pdf.save(filename);
    } catch (error) {
        console.error('Falha ao gerar snapshot PDF:', error);
        throw new Error('Falha ao processar exportação PDF.');
    } finally {
        // Redefine estilos caso tenham sido modificados
        element.style.background = originalStyle.background;
        element.style.color = originalStyle.color;
    }
}
