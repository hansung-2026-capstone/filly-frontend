import { BrowserRouter, Routes, Route } from 'react-router';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Root } from './Root';
import { HomePage } from '../pages/HomePage';
import { StatsPage } from '../pages/StatsPage';
import { ArchivePage } from '../pages/ArchivePage';
import { RecommendPage } from '../pages/RecommendPage';
import { WritePage } from '../pages/WritePage';
import LoginPage from '../pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 누구나 접근 가능 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 토큰이 있어야만 접근 가능 */}
        <Route 
          element={
            <ProtectedRoute>
              <Root /> 
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/write" element={<WritePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;