# ⚡ AI CSS Generator

O **AI CSS Generator** é uma ferramenta inteligente que transforma descrições em linguagem natural (ex: "um botão neon que pulsa") em código HTML e CSS funcional. O projeto utiliza a API do **Google Gemini** com o modelo **Gemini 3.7 Flash** (versão gratuita) para processar os pedidos e gerar os componentes instantaneamente.

---

## ✨ Funcionalidades

- **Geração por IA:** Descreva o que você imagina e o Gemini gera o código HTML/CSS pronto.
- **Preview em Tempo Real:** Veja o componente renderizado imediatamente em um Iframe.
- **Visualizador de Código:** Código limpo e formatado em um bloco com estilo de editor.
- **Interface Dark Mode:** Design moderno e responsivo focado em produtividade.
- **Back-end Seguro:** Chave de API protegida por variáveis de ambiente no servidor.

---

## 🚀 Tecnologias Utilizadas

- **Front-end:** HTML5, CSS3 (Glassmorphism), JavaScript (Vanilla).
- **Back-end:** Node.js, Express.
- **IA:** Google Gen AI SDK (`@google/genai`, Modelo: `gemini-3.7-flash`).
- **Segurança:** Dotenv e CORS.

---

## 🛠️ Como rodar o projeto localmente

Siga os passos abaixo para configurar o ambiente de desenvolvimento na sua máquina:

### 1. Pré-requisitos
Certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (Versão 16 ou superior)
- Gerenciador de pacotes (NPM ou Yarn)

### 2. Clonar o repositório
```bash
git clone [https://github.com/rubenmassuquetto1999/ai-css-generator.git](https://github.com/rubenmassuquetto1999/ai-css-generator.git)
cd ai-css-generator
