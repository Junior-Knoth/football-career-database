import { Route, Routes } from "react-router-dom";
import SaveLayout from "./layouts/SaveLayout/SaveLayout";
import GameSelectionPage from "./pages/GameSelectionPage/GameSelectionPage";
import SaveSelectionPage from "./pages/SaveSelectionPage/SaveSelectionPage";
import SaveOverviewPage from "./pages/SaveOverviewPage/SaveOverviewPage";
import SeasonsPage from "./pages/SeasonsPage/SeasonsPage";
import PlayersPage from "./pages/PlayersPage/PlayersPage";
import TransfersPage from "./pages/TransfersPage/TransfersPage";
import CreateSavePage from "./pages/CreateSavePage/CreateSavePage";
import ClubsPage from "./pages/ClubsPage/ClubsPage";
import NationalTeamPage from "./pages/NationalTeamPage/NationalTeamPage";
import StatisticsPage from "./pages/StatisticsPage/StatisticsPage";
import ManagerPage from "./pages/ManagerPage/ManagerPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<GameSelectionPage />}></Route>
      <Route path="/games/:gameId" element={<SaveSelectionPage />}></Route>
      <Route path="/games/:gameId/create-save" element={<CreateSavePage />} />
      <Route path="/saves/:saveId" element={<SaveLayout />}>
        <Route index element={<SaveOverviewPage />} />
        <Route path="seasons" element={<SeasonsPage />} />

        <Route path="players" element={<PlayersPage />} />
        <Route path="club" element={<ClubsPage />} />
        <Route path="national-team" element={<NationalTeamPage />} />
        <Route path="transfers" element={<TransfersPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="manager" element={<ManagerPage />} />
      </Route>
    </Routes>
  );
}

export default App;
