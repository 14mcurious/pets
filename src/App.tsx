import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Pets from "@/pages/Pets";
import PetsManager from "@/pages/PetsManager";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Pets />} />
        <Route path="/pets" element={<PetsManager />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
