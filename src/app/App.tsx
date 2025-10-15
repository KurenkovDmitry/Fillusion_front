import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Generate } from "../pages";
import { QueryHistory } from "../pages/QueryHistory";

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Generate />} />
        <Route path="/history" element={<QueryHistory />} />
      </Routes>
    </Router>
  );
};
