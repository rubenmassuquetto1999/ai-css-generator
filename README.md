# ⚡ CSS Gerador

O **CSS Gerador** é uma aplicação web moderna que transforma descrições textuais em componentes de código HTML e CSS funcionais com renderização e pré-visualização em tempo real.

---

## ✨ Funcionalidades

- **Geração Instantânea:** Digite uma descrição (ex: *"Bola azul pingando"*, *"Botão de gradiente com efeito hover"*) e obtenha o código HTML e CSS estruturado.
- **Preview em Tempo Real:** Visualização imediata do componente renderizado em um container isolado.
- **Cópia Rápida com 1 Clique:** Botão dedicado para copiar o código gerado para a área de transferência com feedback visual.
- **Layout Responsivo:** Otimizado para desktop, tablets e smartphones.
- **Interface Dark Mode:** Visual moderno com paleta escura, tipografia refinada e transições suaves.
- **Backend Seguro:** Processamento de requisições centralizado via servidor Node.js/Express.

---

## 🚀 Tecnologias Utilizadas

- **Front-end:** HTML5, CSS3 moderno (Flexbox, CSS Grid, Media Queries, Dark Theme), JavaScript (Vanilla).
- **Back-end:** Node.js, Express.
- **Tipografia & Ícones:** Google Fonts (Inter, Fira Code) e SVG nativo.

---

## 🛠️ Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar o ambiente de desenvolvimento na sua máquina:

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (Versão 18 ou superior recomendada)
- Gerenciador de pacotes (`npm` ou `yarn`)

### 2. Clonar o repositório
```bash
git clone https://github.com/rubenmassuquetto1999/ai-css-generator.git
cd ai-css-generator
```

### 3. Instalar as dependências
```bash
npm install
```

### 4. Configurar as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as credenciais necessárias:
```env
GEMINI_API_KEY=sua_chave_aqui
```

### 5. Iniciar a aplicação
```bash
npm run dev
```

Acesse a aplicação em `http://localhost:3000` no seu navegador.

---

## 📁 Estrutura de Arquivos

```
├── public/
│   ├── index.html       # Estrutura principal da interface
│   ├── styles.css       # Estilos globais e regras responsivas
│   ├── scripts.js       # Lógica do cliente, preview e cópia
│   └── img/             # Ícones e recursos estáticos
├── server.js            # Servidor Express e rotas de processamento
├── package.json         # Dependências e scripts de inicialização
└── README.md            # Documentação do projeto
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para utilizar, modificar e distribuir.
