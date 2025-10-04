import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Generate } from "../pages";

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Generate />} />
      </Routes>
    </Router>
  );
};
