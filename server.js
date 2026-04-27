require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/gerar-codigo', async (req, res) => {
    console.log("Recebi um pedido para:", req.body.prompt); // Log no terminal

    try {
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
                    { role: "user", content: req.body.prompt }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Erro da Groq:", data.error);
            return res.status(400).json(data);
        }

        console.log("IA respondeu com sucesso!");
        res.json(data);
    } catch (error) {
        console.error("Erro no Servidor:", error);
        res.status(500).json({ error: "Falha na conexão" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));