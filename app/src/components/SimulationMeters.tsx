'use client';

interface SimulationMetersProps {
    distance: number; // 1-10
    temperature: number; // 1-10 (subject agitation)
    officerTone: number; // 1-10 (trainee's approach)
    onMoveCloser: () => void;
    onStepBack: () => void;
}

export default function SimulationMeters({
    distance,
    temperature,
    officerTone,
    onMoveCloser,
    onStepBack,
}: SimulationMetersProps) {
    const getTemperatureColor = (temp: number) => {
        if (temp >= 8) return 'var(--accent-primary)';
        if (temp >= 6) return 'var(--accent-primary)';
        if (temp >= 4) return '#f59e0b';
        return '#ef4444';
    };

    const getTemperatureLabel = (temp: number) => {
        if (temp >= 8) return 'EXCITED';
        if (temp >= 6) return 'INTERESTED';
        if (temp >= 4) return 'SKEPTICAL';
        if (temp >= 2) return 'GUARDED';
        return 'CLOSED';
    };

    const getDistanceLabel = (dist: number) => {
        if (dist >= 8) return 'TRUSTED';
        if (dist >= 5) return 'WARMING';
        if (dist >= 3) return 'NEUTRAL';
        return 'COLD';
    };

    const getOfficerToneColor = (tone: number) => {
        if (tone >= 8) return '#ef4444'; // Pushy
        if (tone >= 6) return '#f59e0b'; // Assertive
        if (tone >= 4) return '#fbbf24'; // Consultative
        return 'var(--accent-primary)'; // Empathetic
    };

    const getOfficerToneLabel = (tone: number) => {
        if (tone >= 8) return 'PUSHY';
        if (tone >= 6) return 'ASSERTIVE';
        if (tone >= 4) return 'CONSULTATIVE';
        if (tone >= 2) return 'EMPATHETIC';
        return 'LISTENING';
    };

    const MeterBar = ({ value, color, label, labelColor }: { value: number; color: string; label: string; labelColor?: string }) => (
        <div className="flex items-center gap-2">
            <div className="w-20 h-2" style={{ background: 'var(--bg-input)' }}>
                <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${value * 10}%`, background: color }}
                />
            </div>
            <span className="text-xs font-mono w-16" style={{ color: labelColor || color }}>
                {label}
            </span>
        </div>
    );

    return (
        <div
            className="flex items-center gap-5 px-4 py-2.5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
            {/* Rapport Controls */}
            <div className="flex items-center gap-2">
                <div>
                    <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                        RAPPORT
                    </div>
                    <MeterBar
                        value={distance}
                        color={distance <= 2 ? '#ef4444' : 'var(--accent-primary)'}
                        label={getDistanceLabel(distance)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <button
                        onClick={onMoveCloser}
                        disabled={distance <= 1}
                        className="px-2 py-0.5 text-xs disabled:opacity-30"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                        ←
                    </button>
                    <button
                        onClick={onStepBack}
                        disabled={distance >= 10}
                        className="px-2 py-0.5 text-xs disabled:opacity-30"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="w-px h-10" style={{ background: 'var(--border-color)' }} />

            {/* Prospect Engagement */}
            <div>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    ENGAGEMENT
                </div>
                <MeterBar
                    value={temperature}
                    color={getTemperatureColor(temperature)}
                    label={getTemperatureLabel(temperature)}
                />
            </div>

            {/* Divider */}
            <div className="w-px h-10" style={{ background: 'var(--border-color)' }} />

            {/* Rep Approach */}
            <div>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    REP APPROACH
                </div>
                <MeterBar
                    value={officerTone}
                    color={getOfficerToneColor(officerTone)}
                    label={getOfficerToneLabel(officerTone)}
                />
            </div>
        </div>
    );
}
