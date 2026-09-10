import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import SavePage from "./pages/SavePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}></Route>
      <Route path="/saves/:saveId" element={<SavePage />}></Route>
    </Routes>
  );
}

export default App;
