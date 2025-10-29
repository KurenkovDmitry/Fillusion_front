import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Generate } from "../pages";
import { QueryHistory } from "../pages/QueryHistory";
import { Auth } from "../pages/Auth";
import { AuthProvider } from "@shared/hooks";
import { ProtectedRoute } from "@shared/components";

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Generate />} />
          <Route path="/history" element={<QueryHistory />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};
