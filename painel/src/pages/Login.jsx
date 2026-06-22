import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  async function entrar(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    navigate("/admin");
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">
          <div className="urna-icon">🗳️</div>
          <h1>Urna Eletrônica Escolar</h1>
          <p>Painel Administrativo</p>
        </div>

        <form onSubmit={entrar}>

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button type="submit">
            Entrar
          </button>

        </form>

        {erro && (
          <div className="erro-login">
            {erro}
          </div>
        )}

        <div className="footer-login">
       © 2026 <b>Prof. Robinson Webber</b> - Sistema de Urna Eletrônica Escolar
       </div>

      </div>
        
   </div>
   
  );
}