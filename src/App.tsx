import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Pets from "@/pages/Pets";
import PetsList from "@/pages/PetsList";
import PetsDetail from "@/pages/PetsDetail";
import PetsManager from "@/pages/PetsManager";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Pets />} />
        <Route path="/pets" element={<PetsList />} />
        <Route path="/pets/:id" element={<PetsDetail />} />
        <Route path="/pets-manager" element={<PetsManager />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
