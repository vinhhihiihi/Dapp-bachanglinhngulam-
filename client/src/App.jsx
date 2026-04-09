import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";
import { CreatorProfilePage } from "./pages/CreatorProfilePage";
import { LandingPage } from "./pages/LandingPage";
import { QuickDonatePage } from "./pages/QuickDonatePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/creator/:id" element={<CreatorProfilePage />} />
        <Route path="/quick-donate" element={<QuickDonatePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
