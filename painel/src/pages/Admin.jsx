import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Admin.css";

export default function Admin() {
  const navigate = useNavigate();

  async function resetarVotacao() {
  const senha = window.prompt(
    "Digite sua senha para confirmar o reset da votação:"
  );

  if (!senha) return;

  const { data: userData } = await supabase.auth.getUser();

  const email = userData?.user?.email;

  if (!email) {
    alert("Usuário não identificado.");
    return;
  }

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (loginError) {
    alert("Senha incorreta.");
    return;
  }

  const confirmar = window.confirm(
    "ATENÇÃO!\n\nTodos os votos serão apagados e todos os eleitores serão liberados para votar novamente.\n\nDeseja continuar?"
  );

  if (!confirmar) return;

  // Apagar votos
  const { error: erroVotos } = await supabase
    .from("votos")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (erroVotos) {
    console.error(erroVotos);
    alert("Erro ao apagar votos.");
    return;
  }

  // Liberar eleitores
  const { error: erroEleitores } = await supabase
    .from("eleitores")
    .update({
      ja_votou: false,
      votou_em: null,
    })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (erroEleitores) {
    console.error(erroEleitores);
    alert("Erro ao liberar eleitores.");
    return;
  }

  alert("✅ Votação resetada com sucesso!");
}

  async function sair() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  
  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-icon">🗳️</div>
          <h2>Urna Escolar</h2>
          <p>Painel Administrativo</p>
        </div>

        <nav className="admin-menu">
          <Link to="/admin">📊 Dashboard</Link>
          <Link to="/admin/candidatos">👥 Candidatos</Link>
          <Link to="/admin/importar-eleitores">🎓 Importar Eleitores</Link>
          <Link to="/admin/eleitores">📋 Lista de Eleitores</Link>
          <Link to="/admin/apuracao">🗳️ Apuração</Link>
        </nav>

        <button className="btn-sair" onClick={sair}>
          🚪 Sair
        </button>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1>Bem-vindo ao Painel da Urna</h1>
            <p>Gerencie candidatos, eleitores e configurações da votação.</p>
          </div>
        </header>

        <section className="dashboard-cards">
          <Link className="dashboard-card" to="/admin/candidatos">
            <span>👥</span>
            <h3>Candidatos</h3>
            <p>Cadastrar, listar, desativar e excluir candidatos.</p>
          </Link>

          <Link className="dashboard-card" to="/admin/importar-eleitores">
            <span>🎓</span>
            <h3>Eleitores</h3>
            <p>Importar alunos eleitores por arquivo CSV.</p>
          </Link>

          <Link className="dashboard-card" to="/admin/eleitores">
            <span>📋</span>
            <h3>Lista de Eleitores</h3>
            <p>Visualizar alunos cadastrados e situação do voto.</p>
          </Link>

          <Link className="dashboard-card" to="/admin/apuracao">
            <span>🗳️</span>
            <h3>Apuração</h3>
            <p>Visualizar resultados da eleição em tempo real.</p>
          </Link>

          <button
            type="button"
            className="dashboard-card danger-card"
            onClick={resetarVotacao}
          >
            <span>🔄</span>
            <h3>Resetar Votação</h3>
            <p>Apagar votos de teste e liberar eleitores.</p>
          </button>


        </section>

        <footer className="admin-footer">
          <p>Urna Eletrônica Escolar v1.0</p>
          <p>Desenvolvido por <b>Prof. Robinson Webber</b> © 2026</p>
        </footer>

      </main>
    </div>
  );
}