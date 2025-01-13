import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import AdminPage from "./components/AdminPage";
import AdminLogin from "./components/AdminLogin";
import AdminSignup from "./components/AdminSignup";
import ProtectedRoute from "../ProtectedRoute";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<AdminSignup />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
