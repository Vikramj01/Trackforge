import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Billing } from './pages/Billing';
import { Clients } from './pages/Clients';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { Phase1Discovery } from './components/wizard/Phase1Discovery';
import { Phase2JourneyDesigner } from './components/wizard/Phase2JourneyDesigner';
import { Phase3ConversionOrchestration } from './components/wizard/Phase3ConversionOrchestration';
import { Phase4Export } from './components/wizard/Phase4Export';
import { Phase0Validator } from './components/wizard/Phase0Validator';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes — no sidebar */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/validator" element={<Phase0Validator />} />
              <Route path="/discovery" element={<Phase1Discovery />} />
              <Route path="/journey" element={<Phase2JourneyDesigner />} />
              <Route path="/orchestration" element={<Phase3ConversionOrchestration />} />
              <Route path="/export" element={<Phase4Export />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
