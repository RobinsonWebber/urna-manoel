import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./ImportarEleitores.css";

export default function ImportarEleitores() {
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  function importarCSV(e) {
    const arquivo = e.target.files[0];

    if (!arquivo) return;

    setMensagem("");
    setErro("");

    Papa.parse(arquivo, {
      header: true,
      skipEmptyLines: true,

      complete: async function (result) {
       const eleitores = result.data.map((linha) => ({
        codigo: String(linha.codigo || "").trim(),
        nome: String(linha.nome || linha["nome "] || "").trim(),
        turma: String(linha.turma || "").trim(),
        ja_votou: false,
        votou_em: null,
      }))
        .filter((e) => e.codigo && e.nome && e.turma);

        console.log(result.data[0]);

        const { error } = await supabase
          .from("eleitores")
          .insert(eleitores);

        if (error) {
          console.error(error);
          setErro("Erro ao importar eleitores.");
          return;
        }

        if (eleitores.length === 0) {
          setErro("Nenhum eleitor válido encontrado. Verifique se o CSV possui as colunas codigo, nome e turma.");
          return;
        }

        setMensagem(
          `${eleitores.length} eleitores importados com sucesso!`
        );
      },
    });
  }

  return (
    <div className="importar-page">

      <div className="importar-card">

        <div className="importar-header">
          <h1>🎓 Importar Eleitores</h1>
          <p>
            Faça upload de um arquivo CSV contendo os eleitores da escola.
          </p>
        </div>
        
        <button
            className="btn-voltar"
            onClick={() => navigate("/admin")}
            >
             Voltar ao Painel
        </button>
   
          <div className="modelo-card">
            <h3>📋 Preparação da Planilha</h3>

            <p>
              Crie uma planilha no Excel contendo as seguintes colunas:
            </p>

            <ul>
              <li><strong>codigo</strong> — Matrícula ou código do aluno</li>
              <li><strong>nome</strong> — Nome completo do aluno</li>
              <li><strong>turma</strong> — Turma do aluno</li>
            </ul>

            <p>
              Após preencher os dados, exporte a planilha no formato:
            </p>

            <p className="formato-csv">
              <strong>CSV UTF-8 (separado por vírgulas)</strong>
            </p>

            <p>
              Exemplo:
            </p>

            <pre>
          codigo,nome,turma
          1001,Ana Silva,5º Ano
          1002,Pedro Souza,5º Ano
          1003,Maria Oliveira,4º Ano
            </pre>
          </div>

        <div className="upload-area">
          <h3>📂 Selecione o arquivo CSV</h3>

          <input
            type="file"
            accept=".csv"
            onChange={importarCSV}
          />
        </div>

        {mensagem && (
          <div className="mensagem-sucesso">
            ✅ {mensagem}
          </div>
        )}

        {erro && (
          <div className="mensagem-erro">
            ❌ {erro}
          </div>
        )}

      </div>

    </div>
  );
}