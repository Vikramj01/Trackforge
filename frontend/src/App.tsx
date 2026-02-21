import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Phase1Discovery } from './components/wizard/Phase1Discovery';
import { Phase2JourneyDesigner } from './components/wizard/Phase2JourneyDesigner';
import { Phase3ConversionOrchestration } from './components/wizard/Phase3ConversionOrchestration';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/discovery" element={<Phase1Discovery />} />
          <Route path="/journey" element={<Phase2JourneyDesigner />} />
          <Route path="/orchestration" element={<Phase3ConversionOrchestration />} />
          <Route path="/clients" element={<PlaceholderPage title="Clients" />} />
          <Route path="/templates" element={<PlaceholderPage title="Templates" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="/help" element={<PlaceholderPage title="Help" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="p-8">
      <h1
        style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 700,
          fontSize: '28px',
          color: '#E8ECF2',
          margin: 0,
        }}
      >
        {title}
      </h1>
      <p className="text-text-muted text-sm mt-2">{subtitle || 'Coming in a future phase.'}</p>
    </div>
  );
}

export default App;
