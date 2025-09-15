import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import FundSearch from "./pages/FundSearch";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/funds" element={<PrivateRoute><FundSearch /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

