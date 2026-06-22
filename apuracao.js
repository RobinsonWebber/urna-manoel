import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://iqfwbkfhpjngokwwthfr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_TcB_isEy54BfKu6LQHKTEw_g4QmO_nu";

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const tabelaResultados = document.getElementById("tabelaResultados");

async function carregarApuracao() {
  tabelaResultados.innerHTML = "";

  const { data: votos, error: erroVotos } = await supabaseClient
    .from("votos")
    .select("*");

  if (erroVotos) {
    alert("Erro ao buscar votos: " + erroVotos.message);
    return;
  }

  const { data: candidatos, error: erroCandidatos } = await supabaseClient
    .from("candidatos")
    .select("*");

  if (erroCandidatos) {
    alert("Erro ao buscar candidatos: " + erroCandidatos.message);
    return;
  }

  const totalVotos = votos.length;

  const votosBrancos = votos.filter(v => v.tipo_voto === "BRANCO").length;
  const votosNulos = votos.filter(v => v.tipo_voto === "NULO").length;
  const votosValidos = votos.filter(v => v.tipo_voto === "VALIDO").length;

  document.getElementById("totalVotos").textContent = totalVotos;
  document.getElementById("votosBrancos").textContent = votosBrancos;
  document.getElementById("votosNulos").textContent = votosNulos;
  document.getElementById("votosValidos").textContent = votosValidos;

  const ranking = candidatos.map(candidato => {
    const total = votos.filter(
      v => v.numero_candidato === candidato.numero
    ).length;

    return {
      ...candidato,
      votos: total
    };
  });

  ranking.sort((a, b) => b.votos - a.votos);

  ranking.forEach(candidato => {
    const percentual =
      totalVotos > 0
        ? ((candidato.votos / totalVotos) * 100).toFixed(1)
        : "0.0";

    tabelaResultados.innerHTML += `
      <tr>
        <td>${candidato.numero}</td>
        <td>${candidato.nome}</td>
        <td>${candidato.sigla_partido || "-"}</td>
        <td>${candidato.votos}</td>
        <td>${percentual}%</td>
      </tr>
    `;
  });

  const percentualBrancos =
    totalVotos > 0
      ? ((votosBrancos / totalVotos) * 100).toFixed(1)
      : "0.0";

  tabelaResultados.innerHTML += `
    <tr>
      <td>--</td>
      <td><strong>VOTOS BRANCOS</strong></td>
      <td>-</td>
      <td>${votosBrancos}</td>
      <td>${percentualBrancos}%</td>
    </tr>
  `;

  const percentualNulos =
    totalVotos > 0
      ? ((votosNulos / totalVotos) * 100).toFixed(1)
      : "0.0";

  tabelaResultados.innerHTML += `
    <tr>
      <td>--</td>
      <td><strong>VOTOS NULOS</strong></td>
      <td>-</td>
      <td>${votosNulos}</td>
      <td>${percentualNulos}%</td>
    </tr>
  `;
}

document
  .getElementById("btnAtualizar")
  .addEventListener("click", carregarApuracao);

carregarApuracao();