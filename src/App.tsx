import { Route, Routes } from "react-router-dom";
import "./styles/globals.scss";
// import HomePage from "./pages/HomePage";
import SavePage from "./pages/SavePage";
import GameSelectionPage from "./pages/GameSelectionPage";
import SaveSelectionPage from "./pages/SaveSelectionPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<GameSelectionPage />}></Route>
      <Route path="/games/:gameId" element={<SaveSelectionPage />}></Route>
      <Route path="/saves/:saveId" element={<SavePage />}></Route>
    </Routes>
  );
}

export default App;
