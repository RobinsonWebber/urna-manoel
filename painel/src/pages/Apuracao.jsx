import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Apuracao.css";


export default function Apuracao() {
  const [resultados, setResultados] = useState([]);
  const [totalVotos, setTotalVotos] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    carregarResultados();
  }, []);

  async function carregarResultados() {
    const { data, error } = await supabase
      .from("votos")
      .select(`
        candidato_id,
        candidatos (
          nome,
          numero,
          sigla_partido,
          foto_url
        )
      `);

    if (error) {
      console.error(error);
      return;
    }

    const contagem = {};

   data.forEach((voto) => {
  const id = voto.candidato_id || voto.tipo_voto || "especial";

  const candidato = voto.candidatos;

  if (!contagem[id]) {
    contagem[id] = {
      numero: candidato?.numero || "",
      nome: candidato?.nome || voto.tipo_voto?.toUpperCase() || "BRANCO/NULO",
      sigla_partido: candidato?.sigla_partido || "Votos brancos e nulos",
      foto_url: candidato?.foto_url || null,
      votos: 0,
      especial: !candidato,
    };
  }

  contagem[id].votos++;
});

    const lista = Object.values(contagem).sort((a, b) => b.votos - a.votos);

    setResultados(lista);
    setTotalVotos(data.length);
  }

  return (
    <div className="apuracao-page">
      <div className="apuracao-header">
        <h1>🗳️ Apuração da Eleição</h1>
        <p>Resultado parcial ou final da votação escolar.</p>

        <button onClick={carregarResultados} className="btn-atualizar">
          🔄 Atualizar apuração
        </button>
        
        <button
            className="btn-voltar"
            onClick={() => navigate("/admin")}
            >
            Voltar ao Painel
        </button>

      </div>

      <div className="total-card">
        <span>📊 Total de votos</span>
        <strong>{totalVotos}</strong>
      </div>

      <div className="resultado-lista">
        {resultados.map((item, index) => {
          const percentual =
            totalVotos > 0 ? ((item.votos / totalVotos) * 100).toFixed(1) : 0;

          return (
            <div className="resultado-card" key={index}>
              <div className="posicao">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}º`}
              </div>

              <img
                src={item.foto_url || "https://via.placeholder.com/100"}
                alt={item.nome}
              />

              <div className="resultado-info">
                <h2>{item.numero} - {item.nome}</h2>
                <p>{item.sigla_partido}</p>

                <div className="barra">
                  <div
                    className="barra-preenchida"
                    style={{ width: `${percentual}%` }}
                  ></div>
                </div>
              </div>

              <div className="votos-box">
                <strong>{item.votos}</strong>
                <span>votos</span>
                <small>{percentual}%</small>
              </div>
            </div>
          );
        })}
      </div>
    
    </div>
  );
}