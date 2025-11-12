import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NonModalGenerate } from "../pages";
import { QueryHistory } from "../pages";
import { DatabaseDiagram } from "../pages";
import { Projects } from "../pages";
import { AuthProvider } from "@shared/hooks";
import { ProtectedRoute } from "@shared/components";

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<NonModalGenerate />} />
          <Route path="/history/:projectId" element={<QueryHistory />} />
          <Route path="/projects/:projectId" element={<DatabaseDiagram />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};
