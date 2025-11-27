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

          <Route
            path="/history/:projectId"
            element={
              <ProtectedRoute>
                <QueryHistory />{" "}
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <DatabaseDiagram />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};
