import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/Home";
import LearningHub from "./pages/LearningHub";

function App() {
  const location = useLocation();
  const isHub = location.pathname === "/learning-hub";
  return (
    <>
      {!isHub && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/learning-hub" element={<LearningHub />} />
        <Route path="/dashboard" element={<Navigate to="/learning-hub" replace />} />
      </Routes>
      {!isHub && <Footer />}
    </>
  );
}

export default App;
