let botao = document.querySelector(".botao-gerar")
let mensagemErro = document.querySelector(".mensagem-erro")
let caixaTexto = document.querySelector(".caixa-texto")

async function gerarCodigo() {
    let textoUsuario = caixaTexto.value.trim()
    let blocoCodigo = document.querySelector(".bloco-codigo")
    let resultadoCodigo = document.querySelector(".resultado-codigo")
    let divResultado = document.querySelector(".resultado")

    if (textoUsuario === "") {
        mensagemErro.classList.add("ativo")
        return
    }

    mensagemErro.classList.remove("ativo")
    divResultado.classList.add("ativo")
    botao.textContent = "Gerando... ⏳"

    try {
        let resposta = await fetch("/gerar-codigo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: textoUsuario })
        })

        let dados = await resposta.json()

        if (!resposta.ok || dados.error || !dados.choices?.[0]?.message?.content) {
            let erroMsg = dados.error?.message || dados.error || "Erro ao gerar código. Verifique se a chave de API está configurada.";
            blocoCodigo.textContent = `/* Erro: ${erroMsg} */`;
            resultadoCodigo.srcdoc = `<style>body{font-family:sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;margin:0;color:#ef4444;background:#18181b;text-align:center;padding:20px;}</style><div><h3>⚠️ Não foi possível gerar</h3><p style="margin-top:8px;color:#a1a1aa;font-size:14px;">${erroMsg}</p></div>`;
            return;
        }

        let resultado = dados.choices[0].message.content

        resultado = resultado.replace(/```html|```css|```/g, "").trim()

        blocoCodigo.textContent = resultado

        let estiloCentralizado = "<style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#fff;}</style>"
        resultadoCodigo.srcdoc = estiloCentralizado + resultado

    } catch (erro) {
        console.error(erro)
        blocoCodigo.textContent = `/* Falha na conexão com o servidor: ${erro.message || erro} */`;
        resultadoCodigo.srcdoc = `<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;color:#ef4444;background:#18181b;}</style><p>Falha na conexão com o servidor.</p>`;
    } finally {
        botao.textContent = "Gerar Código ⚡️"
    }
}

botao.addEventListener("click", gerarCodigo)

caixaTexto.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        gerarCodigo()
    }
})