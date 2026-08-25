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
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.7-flash'
];

async function generateWithFallback(ai, prompt) {
    let lastError = null;

    for (const model of candidateModels) {
        try {
            console.log(`Tentando gerar com o modelo ${model}...`);
            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    systemInstruction: "Você é um gerador de código HTML/CSS especialista. Responda APENAS com o código HTML e CSS completo e funcional (incluindo tags <style> se necessário). Não inclua formatação markdown com crases (sem ```html ou ```css), sem introduções, sem notas ou explicações.",
                    temperature: 0.3,
                    maxOutputTokens: 2048
                }
            });

            if (response && response.text) {
                console.log(`Sucesso com o modelo: ${model}`);
                return response.text;
            }
        } catch (err) {
            lastError = err;
            console.warn(`Erro no modelo ${model}:`, err.message || err);
            // Continues to the next candidate model automatically
        }
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
