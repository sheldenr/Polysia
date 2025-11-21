import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/Home";
import LearningHub from "./pages/LearningHub";
import About from "./pages/About";
import Research from "./pages/Research";
import Contact from "./pages/Contact";

function App() {
  const location = useLocation();
  const isHub = location.pathname === "/learning-hub";
  return (
    <>
      {!isHub && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/research" element={<Research />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/learning-hub" element={<LearningHub />} />
          <Route path="/dashboard" element={<Navigate to="/learning-hub" replace />} />
        </Routes>
      </main>
      {!isHub && <Footer />}
    </>
  );
}

export default App;
