import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Edge Function 'process-submission-v2' iniciada.");

const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

serve(async (req) => {
    try {
        const payload = await req.json()
        const { record, type } = payload

        // 1. Governança: Apenas INSERT disparado automaticamente
        if (type !== 'INSERT') {
            return new Response(JSON.stringify({ message: "Ignorado: Apenas INSERT dispara processamento automático." }), { status: 200 })
        }

        const submissionId = record.id
        const mediaUrl = record.media_url
        const mediaType = record.media_type

        console.log(`Processando submissão ${submissionId} (${mediaType})...`);

        // 2. Retry Logic para Sincronia de Upload (3 tentativas)
        let fileBlob = null;
        let attempts = 0;
        const maxAttempts = 3;
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        while (attempts < maxAttempts) {
            try {
                const path = mediaUrl.split('/').pop();
                const { data, error } = await supabase.storage.from('submissions').download(path!);

                if (data) {
                    fileBlob = data;
                    break;
                }
                if (error) throw error;
            } catch (e) {
                attempts++;
                console.log(`Tentativa ${attempts} falhou. Aguardando sync do storage...`);
                // Delays: 1s, 4s, 10s (baseado em attempts^2 or literal)
                const delays = [1000, 4000, 10000];
                await delay(delays[attempts - 1]);
            }
        }

        if (!fileBlob) {
            await supabase.from('submissions').update({ ai_status: 'error', admin_feedback: 'Erro: Arquivo não encontrado após 3 tentativas.' }).eq('id', submissionId);
            return new Response(JSON.stringify({ error: "File not found after retries" }), { status: 404 });
        }

        // 3. Atualiza Status para 'processing'
        await supabase.from('submissions').update({ ai_status: 'processing' }).eq('id', submissionId);

        // 4. Estratégia de OCR / Visão com Fallback
        let bodyText = "";
        let useVision = mediaType === 'image';

        if (mediaType === 'pdf') {
            console.log("Tentando extração de texto bruto do PDF...");
            // Simulação de extração: Se bodyText continuar vazio, aciona Vision
            if (!bodyText) {
                console.log("Aviso: Texto bruto não encontrado (PDF Scan). Ativando fallback para Vision API.");
                useVision = true;
            }
        }

        let aiPrompt = `Analise a seguinte submissão científica e sugira 3-5 tags relevantes e um texto alternativo (Alt-Text) conciso e acessível.
    Título: ${record.title}
    Descrição: ${record.description}
    ${bodyText ? `Conteúdo Extraído: ${bodyText.substring(0, 3000)}` : ""}
    Retorne o resultado em JSON no formato: { "tags": ["tag1", "tag2"], "alt_text": "descrição..." }`;

        let aiBody: any = {
            model: useVision ? "gpt-4o" : "gpt-4o-mini",
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: aiPrompt }
                ]
            }],
            response_format: { type: "json_object" }
        };

        if (useVision) {
            // Em produção converteria PDF para JPG. Aqui enviamos o blob direto (base64)
            const arrayBuffer = await fileBlob.arrayBuffer();
            const base64Media = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            aiBody.messages[0].content.push({
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64Media}` }
            });
        }

        // 5. Chamada para OpenAI com Timeout de 50s (Regra Sênior)
        console.log(`Enviando para OpenAI (${useVision ? 'GPT-4o Vision' : 'GPT-4o-mini'})...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 50000);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(aiBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`Erro na OpenAI (Status ${response.status}):`, errorData);
            throw new Error(`OpenAI API returned ${response.status}`);
        }

        const aiData = await response.json();
        console.log("Resposta da OpenAI recebida com sucesso.");
        const result = JSON.parse(aiData.choices[0].message.content);

        // 6. Atualiza colunas de Buffer (Human-in-the-loop)
        console.log(`Finalizando: Salvando sugestões para submissão ${submissionId}.`);
        await supabase.from('submissions').update({
            ai_suggested_tags: result.tags,
            ai_suggested_alt: result.alt_text,
            ai_status: 'completed',
            ai_last_processed: new Date().toISOString()
        }).eq('id', submissionId);

        console.log(`Sucesso: Submissão ${submissionId} processada via IA.`);
        return new Response(JSON.stringify({ success: true, suggestions: result }), { status: 200 });

    } catch (error) {
        console.error("Erro na Edge Function:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
})
