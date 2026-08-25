require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/gerar-codigo', async (req, res) => {
    const prompt = req.body?.prompt;
    console.log("Recebi um pedido para:", prompt);

    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: "Prompt inválido ou não fornecido." });
    }

    try {
        // Priority 1: Use Gemini if GEMINI_API_KEY is configured
        if (process.env.GEMINI_API_KEY) {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const geminiResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: "Você é um gerador de código. Responda APENAS com código HTML/CSS funcional puro. Sem markdown (não use ```html ou ```css), sem explicações extras."
                }
            });

            const generatedCode = geminiResponse.text || '';
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
        }

        // Priority 2: Use Groq if GROQ_API_KEY is configured
        if (process.env.GROQ_API_KEY) {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: "Você é um gerador de código. Responda APENAS com código HTML/CSS puro. Sem markdown, sem explicações."
                        },
                        { role: "user", content: prompt }
                    ]
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("Erro da Groq:", data.error);
                return res.status(400).json(data);
            }

            console.log("IA (Groq) respondeu com sucesso!");
            return res.json(data);
        }

        return res.status(500).json({
            error: "Nenhuma chave de API configurada. Por favor, configure GEMINI_API_KEY ou GROQ_API_KEY nas variáveis de ambiente."
        });
    } catch (error) {
        console.error("Erro no Servidor:", error);
        res.status(500).json({ error: error.message || "Falha na conexão com o serviço de IA." });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
