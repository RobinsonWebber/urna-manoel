import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 1) Cole aqui os dados do seu projeto Supabase
const SUPABASE_URL = "https://iqfwbkfhpjngokwwthfr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_TcB_isEy54BfKu6LQHKTEw_g4QmO_nu";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let eleitorAtual = null;
let candidatos = [];
let numeroDigitado = "";
let votoEmBranco = false;

const el = {
  telaLogin: document.getElementById("telaLogin"),
  telaUrna: document.getElementById("telaUrna"),
  telaFinal: document.getElementById("telaFinal"),
  codigoAluno: document.getElementById("codigoAluno"),
  mensagemLogin: document.getElementById("mensagemLogin"),
  mensagemUrna: document.getElementById("mensagemUrna"),
  cargoAtual: document.getElementById("cargoAtual"),
  numeroCandidato: document.getElementById("numeroCandidato"),
  nomeCandidato: document.getElementById("nomeCandidato"),
  partidoCandidato: document.getElementById("partidoCandidato"),
  fotoCandidato: document.getElementById("fotoCandidato"),
  digitos: document.querySelectorAll(".digito"),
};

document.getElementById("btnEntrar").addEventListener("click", entrarNaUrna);
document.getElementById("btnBranco").addEventListener("click", votarBranco);
document.getElementById("btnCorrige").addEventListener("click", corrigir);
document.getElementById("btnConfirma").addEventListener("click", confirmarVoto);

document.querySelectorAll(".tecla[data-numero]").forEach((botao) => {
  botao.addEventListener("click", () => digitar(botao.dataset.numero));
});

el.codigoAluno.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") entrarNaUrna();
});

async function entrarNaUrna() {
  const codigo = el.codigoAluno.value.trim();
  limparMensagemLogin();

  if (!codigo) {
    mostrarMensagemLogin("Digite o código do aluno.", true);
    return;
  }

  const { data: eleitor, error } = await supabase
    .from("eleitores")
    .select("id, codigo, nome, turma, ja_votou")
    .eq("codigo", codigo)
    .single();

  if (error || !eleitor) {
    mostrarMensagemLogin("Código não encontrado.", true);
    return;
  }

  if (eleitor.ja_votou) {
    mostrarMensagemLogin("Este eleitor já registrou seu voto.", true);
    return;
  }

  eleitorAtual = eleitor;
  await carregarCandidatos();

  if (!candidatos.length) {
    mostrarMensagemLogin("Nenhum candidato ativo encontrado.", true);
    return;
  }

  el.telaLogin.classList.add("oculto");
  el.telaUrna.classList.remove("oculto");
}

async function carregarCandidatos() {
  const { data, error } = await supabase
    .from("candidatos")
    .select("id, numero, nome, sigla_partido, foto_url, cargo, ativo")
    .eq("ativo", true)
    .order("numero", { ascending: true });

  if (error) {
    console.error(error);
    candidatos = [];
    return;
  }

  candidatos = data || [];
}

function digitar(numero) {
  if (numeroDigitado.length >= 2) return;

  votoEmBranco = false;
  numeroDigitado += numero;
  atualizarTela();
}

function corrigir() {
  numeroDigitado = "";
  votoEmBranco = false;
  atualizarTela();
  el.mensagemUrna.textContent = "";
}

function votarBranco() {
  numeroDigitado = "";
  votoEmBranco = true;
  atualizarTela();

  el.mensagemUrna.textContent = "VOTO EM BRANCO";
  el.nomeCandidato.textContent = "BRANCO";
  el.numeroCandidato.textContent = "--";
  el.partidoCandidato.textContent = "--";
  el.fotoCandidato.innerHTML = "Voto<br>em branco";
}

function atualizarTela() {
  el.digitos.forEach((campo, index) => {
    campo.textContent = numeroDigitado[index] || "";
  });

  const candidato = candidatos.find((c) => c.numero === numeroDigitado);
  el.numeroCandidato.textContent = numeroDigitado || "--";

  if (candidato) {
    el.nomeCandidato.textContent = candidato.nome;
    el.partidoCandidato.textContent = candidato.sigla_partido || "---";
    el.cargoAtual.textContent = candidato.cargo || "Representante de turma";
    el.mensagemUrna.textContent = "Confira os dados antes de confirmar.";

    if (candidato.foto_url) {
      el.fotoCandidato.innerHTML = `<img src="${candidato.foto_url}" alt="Foto de ${candidato.nome}">`;
    } else {
      el.fotoCandidato.textContent = "Sem foto";
    }
    return;
  }

  el.nomeCandidato.textContent = numeroDigitado.length === 2 ? "VOTO NULO" : "---";
  el.partidoCandidato.textContent = "---";
  el.fotoCandidato.textContent = "Foto do candidato";
  el.mensagemUrna.textContent = numeroDigitado.length === 2
    ? "Número não encontrado. O voto será nulo."
    : "";
}

async function confirmarVoto() {
  if (!eleitorAtual) {
    el.mensagemUrna.textContent = "Eleitor não identificado.";
    return;
  }

  if (!votoEmBranco && numeroDigitado.length < 2) {
    el.mensagemUrna.textContent = "Digite o número do candidato ou escolha BRANCO.";
    return;
  }

  const candidato = candidatos.find((c) => c.numero === numeroDigitado);

  let tipoVoto = "VALIDO";
  let candidatoId = null;
  let numeroVotado = numeroDigitado;

  if (votoEmBranco) {
    tipoVoto = "BRANCO";
    numeroVotado = "BRANCO";
  } else if (!candidato) {
    tipoVoto = "NULO";
    candidatoId = null;
  } else {
    candidatoId = candidato.id;
  }

  const { error: erroVoto } = await supabase
    .from("votos")
    .insert({
      candidato_id: candidatoId,
      numero_candidato: numeroVotado,
      cargo: candidato?.cargo || "Representante de turma",
      tipo_voto: tipoVoto,
    });

  if (erroVoto) {
    console.error(erroVoto);
    el.mensagemUrna.textContent = "Erro ao registrar voto.";
    return;
  }

  const { error: erroEleitor } = await supabase
    .from("eleitores")
    .update({ ja_votou: true, votou_em: new Date().toISOString() })
    .eq("id", eleitorAtual.id)
    .eq("ja_votou", false);

  if (erroEleitor) {
    console.error(erroEleitor);
    el.mensagemUrna.textContent = "Voto salvo, mas houve erro ao marcar eleitor.";
    return;
  }

tocarSomConfirmacao();

document.getElementById("telaUrna").classList.add("oculto");
document.getElementById("telaLogin").classList.add("oculto");
document.getElementById("telaFinal").classList.remove("oculto");

setTimeout(() => {
  window.location.href = window.location.pathname + "?limpo=" + Date.now();
}, 10000);
//setTimeout(voltarParaLogin, 10000);

}
function mostrarMensagemLogin(texto, erro = false) {
  el.mensagemLogin.textContent = texto;
  el.mensagemLogin.classList.toggle("erro", erro);
  el.mensagemLogin.classList.toggle("sucesso", !erro);
}

function limparMensagemLogin() {
  el.mensagemLogin.textContent = "";
  el.mensagemLogin.classList.remove("erro", "sucesso");
}

function tocarSomConfirmacao() {
  const audio = new Audio("som-confirma.mp3");
  audio.play().catch(() => {
    console.log("Som bloqueado pelo navegador.");
  });
}

function voltarParaLogin() {
  codigoEleitorAtual = "";
  numeroDigitado = "";
  votoEmBranco = false;

  document.getElementById("codigoAluno").value = "";
  document.getElementById("mensagemLogin").textContent = "";
  document.getElementById("mensagemUrna").textContent = "";

  document.getElementById("telaFinal").classList.add("oculto");
  document.getElementById("telaUrna").classList.add("oculto");
  document.getElementById("telaLogin").classList.remove("oculto");

  atualizarTela();

  setTimeout(() => {
    document.getElementById("codigoAluno").focus();
  }, 100);
}
window.addEventListener("DOMContentLoaded", () => {
  const campoCodigo = document.getElementById("codigoAluno");

  campoCodigo.value = "";
  campoCodigo.setAttribute("autocomplete", "off");

  setTimeout(() => {
    campoCodigo.focus();
  }, 100);
});