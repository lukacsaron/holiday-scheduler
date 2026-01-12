import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreatePollPage from './pages/CreatePollPage';
import EditPollPage from './pages/EditPollPage';
import PollPage from './pages/PollPage';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreatePollPage />} />
        <Route path="/poll/:pollId" element={<PollPage />} />
        <Route path="/poll/:pollId/edit" element={<EditPollPage />} />
      </Routes>
    </div>
  );
}

export default App;
