 import { BrowserRouter, Routes, Route } from "react-router-dom";
//import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Candidatos from "./pages/Candidatos";
import ImportarEleitores from "./pages/ImportarEleitores";
import ProtectedRoute from "./components/ProtectedRoute";
import Apuracao from "./pages/Apuracao";
import Eleitores from "./pages/Eleitores";
import { Navigate } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/candidatos"
          element={
            <ProtectedRoute>
              <Candidatos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/importar-eleitores"
          element={
            <ProtectedRoute>
              <ImportarEleitores />
            </ProtectedRoute>
          }
        />
        
        <Route
        path="/admin/apuracao"
          element={
            <ProtectedRoute>
              <Apuracao />
            </ProtectedRoute>
          }
      />

      <Route
      path="/admin/eleitores"
      element={
        <ProtectedRoute>
          <Eleitores />
        </ProtectedRoute>
      }
    />

    <Route path="/" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}