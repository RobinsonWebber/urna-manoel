import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Eleitores.css";

export default function Eleitores() {
  const navigate = useNavigate();

  const [eleitores, setEleitores] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");

  const porPagina = 20;

  const carregarEleitores = useCallback(async () => {
    const inicio = (pagina - 1) * porPagina;
    const fim = inicio + porPagina - 1;

    let query = supabase
      .from("eleitores")
      .select("*", { count: "exact" })
      .order("turma", { ascending: true })
      .order("nome", { ascending: true })
      .range(inicio, fim);

    if (busca.trim() !== "") {
      query = query.or(
        `nome.ilike.%${busca}%,codigo.ilike.%${busca}%,turma.ilike.%${busca}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(error);
      alert("Erro ao carregar eleitores.");
      return;
    }

    setEleitores(data || []);
    setTotal(count || 0);
  }, [pagina, busca]);

  useEffect(() => {
    carregarEleitores();
  }, [carregarEleitores]);

  const totalPaginas = Math.ceil(total / porPagina);

  return (
    <div className="eleitores-page">

      <button
        className="btn-voltar"
        onClick={() => navigate("/admin")}
      >
        🏠 Voltar ao Painel
      </button>

      <div className="eleitores-header">
        <h1>📋 Lista de Eleitores</h1>
        <p>Confira os alunos cadastrados e a situação da votação.</p>
      </div>

      <div className="eleitores-filtros">
        <input
          type="text"
          placeholder="Buscar por nome, código ou turma..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1);
          }}
        />
      </div>

      <div className="eleitores-card">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Turma</th>
              <th>Status</th>
              <th>Votou em</th>
            </tr>
          </thead>

          <tbody>
            {eleitores.length > 0 ? (
              eleitores.map((eleitor) => (
                <tr key={eleitor.id}>
                  <td>{eleitor.codigo}</td>
                  <td>{eleitor.nome}</td>
                  <td>{eleitor.turma}</td>

                  <td>
                    {eleitor.ja_votou ? (
                      <span className="status-votou">
                        ✅ Já votou
                      </span>
                    ) : (
                      <span className="status-nao-votou">
                        ⏳ Não votou
                      </span>
                    )}
                  </td>

                  <td>
                    {eleitor.votou_em
                      ? new Date(
                          eleitor.votou_em
                        ).toLocaleString("pt-BR")
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Nenhum eleitor encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="paginacao">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina((p) => p - 1)}
        >
          ← Anterior
        </button>

        <span>
          Página {pagina} de {totalPaginas || 1} — {total} eleitores
        </span>

        <button
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina((p) => p + 1)}
        >
          Próxima →
        </button>
      </div>

    </div>
  );
}