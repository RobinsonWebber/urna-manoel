import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Candidatos.css";

export default function Candidatos() {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [siglaPartido, setSiglaPartido] = useState("VILA NOVA");
  const [cargo, setCargo] = useState("VEREADOR MIRIM");
  const [ativo, setAtivo] = useState(true);
  const [foto, setFoto] = useState(null);
  const [candidatos, setCandidatos] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    carregarCandidatos();
  }, []);

  async function carregarCandidatos() {
    const { data, error } = await supabase
      .from("candidatos")
      .select("*")
      .order("numero");

    if (!error) {
      setCandidatos(data || []);
    }
  }

  async function excluirCandidato(id) {
  const confirmar = window.confirm(
    "Deseja realmente excluir este candidato?"
  );

  if (!confirmar) return;

  const { error } = await supabase
    .from("candidatos")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erro ao excluir candidato.");
    console.error(error);
    return;
  }

  carregarCandidatos();
 }

  async function salvarCandidato(e) {
    e.preventDefault();
    setMensagem("");

    let foto_url = "";
    
    if (foto) {
      const extensao = foto.name.split(".").pop();
      const nomeArquivo = `${Date.now()}-${numero}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from("candidate-photos")
        .upload(nomeArquivo, foto);

      if (uploadError) {
        console.error(uploadError);
        setMensagem("Erro ao enviar foto.");
        return;
      }

      const { data } = supabase.storage
        .from("candidate-photos")
        .getPublicUrl(nomeArquivo);

      foto_url = data.publicUrl;
    }

    const { error } = await supabase.from("candidatos").insert({
      numero,
      nome,
      sigla_partido: siglaPartido.toUpperCase(),
      foto_url,
      cargo,
      ativo,
    });

    if (error) {
      console.error(error);
      setMensagem("Erro ao salvar candidato.");
      return;
    }

    setMensagem("✅ Candidato salvo com sucesso!");

    setNumero("");
    setNome("");
    setSiglaPartido("");
    setCargo("Representante de turma");
    setAtivo(true);
    setFoto(null);

    carregarCandidatos();
  }

  return (
    <div className="pagina-candidatos">

      <h1>🗳️ Administração de Candidatos</h1>

      <button
            className="btn-voltar"
            onClick={() => navigate("/admin")}
            >
             Voltar ao Painel
      </button>

      <div className="card-form">

        <form onSubmit={salvarCandidato}>

          <div className="form-grid">

            <input
              type="text"
              placeholder="Número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />

            <input
              type="text"
              placeholder="Nome do candidato"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              type="text"
              placeholder="Sigla do partido"
              value={siglaPartido}
              onChange={(e) => setSiglaPartido(e.target.value)}
            />

            <input
              type="text"
              placeholder="Cargo"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
            />

          </div>

          <div className="linha-opcoes">

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
              />
              Ativo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files[0])}
            />

          </div>

          <button className="btn-salvar" type="submit">
            💾 Salvar candidato
          </button>

        </form>

        {mensagem && (
          <div className="mensagem">
            {mensagem}
          </div>
        )}

      </div>

      <h2>👥 Candidatos cadastrados</h2>

      <div className="lista-candidatos">

        {candidatos.map((candidato) => (

          <div className="card-candidato" key={candidato.id}>

            <img
              src={
                candidato.foto_url ||
                "https://via.placeholder.com/120x120?text=Foto"
              }
              alt={candidato.nome}
            />

            <div className="numero">
              {candidato.numero}
            </div>

            <div className="nome">
              {candidato.nome}
            </div>

            <div className="partido">
              {candidato.sigla_partido}
            </div>

            <div className="cargo">
              {candidato.cargo}
            </div>

            <div className={candidato.ativo ? "status ativo" : "status inativo"}>
              {candidato.ativo ? "ATIVO" : "INATIVO"}
            </div>

              <button
              className="btn-excluir"
              onClick={() => excluirCandidato(candidato.id)}
               >
              🗑️ Excluir
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}