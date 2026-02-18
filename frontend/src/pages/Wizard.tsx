import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import Phase1Discovery from '../components/wizard/Phase1Discovery';
import Phase2SiteScan from '../components/wizard/Phase2SiteScan';
import Phase3Template from '../components/wizard/Phase3Template';
import Phase4Deploy from '../components/wizard/Phase4Deploy';

const phases = [
  { num: 1, label: 'Discovery' },
  { num: 2, label: 'Site Scan' },
  { num: 3, label: 'Template' },
  { num: 4, label: 'Deploy' },
];

export default function Wizard() {
  const { projectId: paramProjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, clients, createProject } = useStore();

  const [projectId, setProjectId] = useState<string | null>(paramProjectId ?? null);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [showClientPicker, setShowClientPicker] = useState(!paramProjectId);

  const project = projects.find((p) => p.id === projectId);
  const locationState = location.state as { templateId?: string; templateName?: string } | null;

  useEffect(() => {
    if (project) {
      setCurrentPhase(project.currentPhase);
      setShowClientPicker(false);
    }
  }, [project]);

  useEffect(() => {
    if (paramProjectId) {
      setProjectId(paramProjectId);
      setShowClientPicker(false);
    }
  }, [paramProjectId]);

  const handleSelectClient = (clientId: string, clientName: string) => {
    const newProject = createProject(clientId, clientName);
    setProjectId(newProject.id);
    setCurrentPhase(1);
    setShowClientPicker(false);
    navigate(`/wizard/${newProject.id}`, { replace: true });
  };

  const handleCreateNewClient = () => {
    navigate('/clients');
  };

  const goToPhase = (phase: number) => {
    if (project && phase <= project.currentPhase) {
      setCurrentPhase(phase);
    }
  };

  if (showClientPicker || !projectId) {
    return (
      <div style={{ padding: '2rem', maxWidth: '640px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#E8ECF2', margin: 0, marginBottom: '0.375rem' }}>
            New Project
          </h1>
          <p style={{ color: '#7A8599', fontSize: '0.9rem', margin: 0 }}>
            Select a client to start a new tracking project.
          </p>
        </div>

        {clients.length === 0 ? (
          <div style={{ backgroundColor: '#0D1117', border: '1px solid #1A1E28', borderRadius: '8px', padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#7A8599', marginBottom: '1rem' }}>No clients yet. Add your first client to get started.</p>
            <button
              onClick={handleCreateNewClient}
              style={{ background: 'linear-gradient(135deg, #0BBFAA, #099d8b)', color: '#080B12', fontWeight: 600, fontSize: '0.875rem', padding: '0.625rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              Add Client
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelectClient(client.id, client.name)}
                style={{ backgroundColor: '#0D1117', border: '1px solid #1A1E28', borderRadius: '8px', padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', transition: 'border-color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0BBFAA')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1A1E28')}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#E8ECF2', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{client.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#7A8599' }}>
                    {client.website} · {client.industry} · {client.projectCount} project{client.projectCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#0BBFAA', fontWeight: 500 }}>Start Project →</span>
              </button>
            ))}
            <button
              onClick={handleCreateNewClient}
              style={{ backgroundColor: 'transparent', border: '1px dashed #1A1E28', borderRadius: '8px', padding: '1rem 1.25rem', cursor: 'pointer', color: '#7A8599', fontSize: '0.875rem', transition: 'all 0.15s', textAlign: 'center' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0BBFAA'; e.currentTarget.style.color = '#0BBFAA'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1A1E28'; e.currentTarget.style.color = '#7A8599'; }}
            >
              + Add New Client
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '2rem', color: '#7A8599' }}>
        <p>Project not found.</p>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'linear-gradient(135deg, #0BBFAA, #099d8b)', color: '#080B12', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#7A8599', cursor: 'pointer', fontSize: '0.8125rem', padding: 0 }}>
            Dashboard
          </button>
          <span style={{ color: '#7A8599' }}>/</span>
          <span style={{ color: '#E8ECF2', fontSize: '0.8125rem' }}>{project.clientName}</span>
        </div>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: '1.5rem', color: '#E8ECF2', margin: 0 }}>
          {project.clientName} — Tracking Setup
        </h1>
      </div>

      {/* Phase Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem', backgroundColor: '#0D1117', border: '1px solid #1A1E28', borderRadius: '10px', padding: '0.875rem 1.25rem' }}>
        {phases.map((phase, index) => {
          const isCompleted = project.currentPhase > phase.num;
          const isCurrent = currentPhase === phase.num;
          const isAccessible = phase.num <= project.currentPhase;
          return (
            <div key={phase.num} style={{ display: 'flex', alignItems: 'center', flex: index < phases.length - 1 ? 1 : 'initial' }}>
              <button
                onClick={() => goToPhase(phase.num)}
                disabled={!isAccessible}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: isAccessible ? 'pointer' : 'default', padding: '0.25rem 0.375rem', borderRadius: '6px', backgroundColor: isCurrent ? 'rgba(11,191,170,0.1)' : 'transparent' }}
              >
                {isCompleted ? (
                  <CheckCircle size={18} color="#0BBFAA" />
                ) : (
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${isCurrent ? '#0BBFAA' : '#1A1E28'}`, backgroundColor: isCurrent ? '#0BBFAA' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isCurrent && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#080B12' }} />}
                  </div>
                )}
                <span style={{ fontSize: '0.8125rem', fontWeight: isCurrent ? 600 : 400, color: isCurrent ? '#E8ECF2' : isCompleted ? '#0BBFAA' : '#7A8599', whiteSpace: 'nowrap' }}>
                  {phase.label}
                </span>
              </button>
              {index < phases.length - 1 && (
                <div style={{ flex: 1, height: '1px', backgroundColor: isCompleted ? '#0BBFAA' : '#1A1E28', margin: '0 0.5rem', minWidth: '20px' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Phase Content */}
      <div style={{ backgroundColor: '#0D1117', border: '1px solid #1A1E28', borderRadius: '10px', padding: '2rem' }}>
        {currentPhase === 1 && (
          <Phase1Discovery
            projectId={project.id}
            onNext={() => setCurrentPhase(2)}
            initialData={project.discovery}
          />
        )}
        {currentPhase === 2 && (
          <Phase2SiteScan
            projectId={project.id}
            onNext={() => setCurrentPhase(3)}
            onBack={() => setCurrentPhase(1)}
            website={project.discovery?.website || ''}
          />
        )}
        {currentPhase === 3 && (
          <Phase3Template
            projectId={project.id}
            onNext={() => setCurrentPhase(4)}
            onBack={() => setCurrentPhase(2)}
            preselectedTemplateId={locationState?.templateId}
          />
        )}
        {currentPhase === 4 && (
          <Phase4Deploy
            projectId={project.id}
            onBack={() => setCurrentPhase(3)}
            project={project}
          />
        )}
      </div>
    </div>
  );
}
