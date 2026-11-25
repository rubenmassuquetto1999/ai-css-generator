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

function generateSmartFallback(prompt) {
    const lower = prompt.toLowerCase();
    
    let primaryColor = '#3b82f6';
    let gradientColors = ['#3b82f6', '#1d4ed8'];
    if (lower.includes('vermelho') || lower.includes('red')) {
        primaryColor = '#ef4444';
        gradientColors = ['#ef4444', '#b91c1c'];
    } else if (lower.includes('verde') || lower.includes('green') || lower.includes('esmeralda')) {
        primaryColor = '#10b981';
        gradientColors = ['#10b981', '#059669'];
    } else if (lower.includes('amarelo') || lower.includes('yellow') || lower.includes('dourado')) {
        primaryColor = '#f59e0b';
        gradientColors = ['#f59e0b', '#d97706'];
    } else if (lower.includes('roxo') || lower.includes('purple') || lower.includes('violeta')) {
        primaryColor = '#8b5cf6';
        gradientColors = ['#8b5cf6', '#6d28d9'];
    } else if (lower.includes('rosa') || lower.includes('pink')) {
        primaryColor = '#ec4899';
        gradientColors = ['#ec4899', '#be185d'];
    } else if (lower.includes('laranja') || lower.includes('orange')) {
        primaryColor = '#f97316';
        gradientColors = ['#f97316', '#c2410c'];
    }

    if (lower.includes('bola') || lower.includes('circulo')) {
        const isAnimated = lower.includes('ping') || lower.includes('quic') || lower.includes('pul') || lower.includes('anim') || lower.includes('mov');
        
        if (isAnimated) {
            return `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<style>
    body {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: radial-gradient(circle at center, #1e1b4b, #0f172a);
        overflow: hidden;
    }
    .container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .ball {
        width: 70px;
        height: 70px;
        background: linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]});
        border-radius: 50%;
        box-shadow: 0 10px 25px ${gradientColors[0]}88, inset -5px -5px 15px rgba(0,0,0,0.3);
        animation: bounce 1.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite alternate;
    }
    @keyframes bounce {
        0% { transform: translateY(-120px) scaleY(0.9); }
        100% { transform: translateY(120px) scaleY(1); }
    }
    .shadow {
        position: absolute;
        bottom: calc(50% - 100px);
        width: 55px;
        height: 12px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 50%;
        animation: shadow 1.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite alternate;
        filter: blur(4px);
    }
    @keyframes shadow {
        0% { transform: scale(0.6); opacity: 0.2; }
        100% { transform: scale(1.2); opacity: 0.6; }
    }
</style>
</head>
<body>
    <div class="container">
        <div class="shadow"></div>
        <div class="ball"></div>
    </div>
</body>
</html>`;
        } else {
            return `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<style>
    body {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: radial-gradient(circle at center, #1e1b4b, #0f172a);
        overflow: hidden;
    }
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }
    .ball {
        width: 100px;
        height: 100px;
        background: linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]});
        border-radius: 50%;
        box-shadow: 0 15px 40px ${gradientColors[0]}88, inset -10px -10px 25px rgba(0,0,0,0.3);
    }
</style>
</head>
<body>
    <div class="container">
        <div class="ball"></div>
    </div>
</body>
</html>`;
        }
    }

    if (lower.includes('login') || lower.includes('entrar') || lower.includes('formulario') || lower.includes('form')) {
        return `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<style>
    body {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #0f172a, #1e293b);
        font-family: 'Inter', sans-serif;
    }
    .login-card {
        background: rgba(30, 41, 59, 0.85);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 40px;
        border-radius: 24px;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        width: 340px;
        text-align: center;
    }
    h2 {
        color: #f8fafc;
        margin-bottom: 24px;
        font-size: 24px;
        font-weight: 700;
    }
    .input-group {
        margin-bottom: 18px;
        text-align: left;
    }
    label {
        display: block;
        color: #cbd5e1;
        font-size: 13px;
        margin-bottom: 6px;
        font-weight: 500;
    }
    input {
        width: 100%;
        padding: 12px 16px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid #334155;
        border-radius: 12px;
        color: #fff;
        font-size: 14px;
        box-sizing: border-box;
        transition: all 0.3s ease;
    }
    input:focus {
        outline: none;
        border-color: ${primaryColor};
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    }
    button {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]});
        border: none;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        margin-top: 10px;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }
    button:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.4);
    }
</style>
</head>
<body>
    <div class="login-card">
        <h2>Entrar</h2>
        <div class="input-group">
            <label>E-mail</label>
            <input type="email" placeholder="seu@email.com">
        </div>
        <div class="input-group">
            <label>Senha</label>
            <input type="password" placeholder="••••••••">
        </div>
        <button onclick="alert('Login efetuado com sucesso!')">Acessar</button>
    </div>
</body>
</html>`;
    }

    if (lower.includes('botao') || lower.includes('botão') || lower.includes('button')) {
        return `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<style>
    body {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #0f172a;
        font-family: 'Inter', sans-serif;
    }
    .cta-btn {
        position: relative;
        padding: 18px 40px;
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
        background: linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]});
        border: none;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
    }
    .cta-btn:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 18px 40px rgba(0,0,0,0.5);
    }
    .cta-btn:active {
        transform: translateY(1px);
    }
</style>
</head>
<body>
    <button class="cta-btn" onclick="this.textContent = '✨ Clicado!'">Clique Aqui</button>
</body>
</html>`;
    }

    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<style>
    body {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #0f172a;
        font-family: 'Inter', sans-serif;
        color: #f8fafc;
    }
    .card {
        background: rgba(30, 41, 59, 0.8);
        backdrop-filter: blur(16px);
        padding: 40px;
        border-radius: 24px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        max-width: 380px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    h3 {
        margin-top: 0;
        color: #f8fafc;
        font-size: 22px;
        margin-bottom: 12px;
    }
    p {
        color: #94a3b8;
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 24px;
    }
    .action-btn {
        padding: 12px 28px;
        background: linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]});
        border: none;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .action-btn:hover {
        transform: translateY(-2px);
    }
</style>
</head>
<body>
    <div class="card">
        <h3>Componente</h3>
        <p>Elemento HTML e CSS estilizado com perfeição e design moderno.</p>
        <button class="action-btn" onclick="alert('Ação executada!')">Ação</button>
    </div>
</body>
</html>`;
}

app.post('/gerar-codigo', async (req, res) => {
    const prompt = req.body?.prompt;
    console.log("Recebi um pedido para:", prompt);

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: "Prompt inválido ou não fornecido." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY não configurada, usando gerador inteligente local.");
        const fallbackCode = generateSmartFallback(prompt);
        return res.json({
            choices: [
                {
                    message: {
                        content: fallbackCode
                    }
                }
            ]
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
        const errMsg = error.message || '';
        const isPrepayment = error.status === 402 || errMsg.includes('402') || errMsg.includes('prepayment') || errMsg.includes('RESOURCE_EXHAUSTED');
        if (!isPrepayment) {
            console.warn("Aviso: Falha ao gerar com Gemini API:", error.message || error);
        }
        const fallbackCode = generateSmartFallback(prompt);
        return res.json({
            choices: [
                {
                    message: {
                        content: fallbackCode
                    }
                }
            ]
        });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
