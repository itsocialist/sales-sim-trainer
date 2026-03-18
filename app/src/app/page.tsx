'use client';

import { useState } from 'react';
import PackSelector, { type SimulationConfig } from '@/components/PackSelector';
import SimulationChat from '@/components/SimulationChat';
import DebriefScreen from '@/components/DebriefScreen';
import PackLibrary from '@/components/PackLibrary';
import { DEMO_PRESETS, resolveDemoPreset } from '@/lib/packs/demoPresets';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type AppState = 'select' | 'library' | 'chat' | 'debrief';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('select');
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [scenarioContext, setScenarioContext] = useState('');
  const [intoxicationLevel, setIntoxicationLevel] = useState('moderate');
  const [autoVoice, setAutoVoice] = useState(false);

  const handleStartSimulation = (config: SimulationConfig) => {
    setSimulationConfig(config);
    setSessionMessages([]);
    setScenarioContext(config.scenarioPack.context);
    setIntoxicationLevel(config.subjectPack.conditionLevel);
    setAutoVoice(false);
    setAppState('chat');
  };

  const handleDemoLaunch = (presetId: string) => {
    const preset = DEMO_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const resolved = resolveDemoPreset(preset);
    if (!resolved) return;

    const config: SimulationConfig = {
      productPack: resolved.productPack,
      icpPack: resolved.icpPack,
      trainingPack: resolved.trainingPack,
      subjectPack: resolved.subjectPack,
      scenarioPack: resolved.scenarioPack,
      subject: resolved.subject,
    };

    setSimulationConfig(config);
    setSessionMessages([]);
    setScenarioContext(resolved.scenarioPack.context);
    setIntoxicationLevel(resolved.subjectPack.conditionLevel);
    setAutoVoice(resolved.voiceMode);
    setAppState('chat');
  };

  const handleEndSession = (messages: Message[], context?: string, level?: string) => {
    setSessionMessages(messages);
    if (context) setScenarioContext(context);
    if (level) setIntoxicationLevel(level);
    setAppState('debrief');
  };

  const handleRestart = () => {
    setSessionMessages([]);
    setAppState('chat');
  };

  const handleNewScenario = () => {
    setSimulationConfig(null);
    setSessionMessages([]);
    setAppState('select');
  };

  // Pack Library
  if (appState === 'library') {
    return <PackLibrary onClose={() => setAppState('select')} />;
  }

  // Pack Selection — includes demo presets
  if (appState === 'select') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        {/* Demo Quick Launch Bar */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
          }}
          className="px-6 py-5"
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  ⚡ Quick Demo
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  One-click launch into voice mode
                </p>
              </div>
              <span className="text-[10px] px-2 py-1" style={{
                background: 'rgba(63, 212, 151, 0.1)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(63, 212, 151, 0.2)',
              }}>
                DEMO MODE
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {DEMO_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleDemoLaunch(preset.id)}
                  className="text-left p-4 transition-all duration-200"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = preset.accentColor;
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                  }}
                  id={`demo-${preset.id}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{preset.icon}</span>
                    <span className="font-semibold text-sm" style={{ color: preset.accentColor }}>
                      {preset.name}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {preset.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5" style={{
                      background: `${preset.accentColor}15`,
                      color: preset.accentColor,
                      border: `1px solid ${preset.accentColor}30`,
                    }}>
                      🎙 VOICE
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Click to start →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Full Configuration */}
        <PackSelector
          onStart={handleStartSimulation}
          onOpenLibrary={() => setAppState('library')}
        />
      </div>
    );
  }

  // Simulation Chat
  if (appState === 'chat' && simulationConfig) {
    return (
      <SimulationChat
        config={simulationConfig}
        onEndSession={handleEndSession}
        autoVoice={autoVoice}
      />
    );
  }

  // Debrief
  if (appState === 'debrief' && simulationConfig) {
    return (
      <DebriefScreen
        messages={sessionMessages}
        scenarioContext={scenarioContext}
        intoxicationLevel={intoxicationLevel}
        traineeRole={simulationConfig.trainingPack.targetRole}
        subjectCondition={simulationConfig.subjectPack.name}
        scenarioName={simulationConfig.scenarioPack.name}
        onRestart={handleRestart}
        onNewScenario={handleNewScenario}
      />
    );
  }

  return null;
}
