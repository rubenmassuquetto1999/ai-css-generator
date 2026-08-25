require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.7-flash'
];

async function generateWithFallback(ai, prompt) {
    let lastError = null;

    for (const model of candidateModels) {
        // Try up to 2 times for temporary 503 spikes
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model: model,
                    contents: prompt,
                    config: {
                        systemInstruction: "Você é um gerador de código HTML/CSS especialista e estritamente fiel ao pedido do usuário.\n" +
                            "Diretrizes obrigatórias:\n" +
                            "1. Gere um trecho de HTML completo, sem cortes, autossuficiente e com estilos embutidos dentro de uma tag <style>.\n" +
                            "2. Respeite EXATAMENTE o que foi pedido (ex: se pediu bola azul pingando/quicando, faça a animação @keyframes completa e fluida; se pediu estático, faça estático).\n" +
                            "3. Responda APENAS com o código HTML/CSS puro, sem formatação markdown (sem ```html ou ```css), sem comentários adicionais ou explicações antes ou depois.\n" +
                            "4. Certifique-se de que todo o código esteja 100% completo, sem partes cortadas, com todas as tags HTML e regras CSS perfeitamente fechadas.",
                        temperature: 0.2
                    }
                });

                if (response && response.text) {
                    return response.text;
                }
            } catch (err) {
                lastError = err;
                const errMsg = err.message || '';
                const isRateLimit = err.status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded');
                const isTempUnavailable = err.status === 503 || errMsg.includes('503') || errMsg.includes('UNAVAILABLE');

                // If 429 quota exhausted on this model, immediately switch to next model without retrying this one
                if (isRateLimit) {
                    break;
                }

                // If 503 temporary unavailable, wait briefly once before next attempt or next model
                if (attempt < 2 && isTempUnavailable) {
                    await new Promise(res => setTimeout(res, 800));
                } else {
                    break;
                }
            }
        }
    }

    if (lastError && (lastError.status === 429 || lastError.message?.includes('429') || lastError.message?.includes('Quota exceeded'))) {
        throw new Error("Limite de requisições temporariamente atingido. Por favor, aguarde alguns instantes e tente novamente.");
    }

    throw lastError || new Error("Não foi possível gerar o código após tentar os modelos disponíveis.");
}

app.post('/gerar-codigo', async (req, res) => {
    const prompt = req.body?.prompt;
    console.log("Recebi um pedido para:", prompt);

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: "Prompt inválido ou não fornecido." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({
            error: "A chave GEMINI_API_KEY não está configurada nas variáveis de ambiente."
        });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const rawText = await generateWithFallback(ai, prompt);

        let generatedCode = rawText || '';
        generatedCode = generatedCode.replace(/^```(html|css)?\s*/i, '').replace(/\s*```$/i, '').trim();

        console.log("IA (Gemini) respondeu com sucesso!");
        return res.json({
            choices: [
                {
                    message: {
                        content: generatedCode
                    }
                }
            ]
        });
    } catch (error) {
        console.error("Erro ao gerar com Gemini:", error);
        return res.status(500).json({
            error: error.message || "O serviço de IA está com alta demanda no momento. Por favor, tente novamente em alguns instantes."
        });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
