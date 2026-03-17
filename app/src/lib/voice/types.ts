/**
 * Voice Provider Types — SalesSim TTS/STT Abstraction Layer
 * 
 * Supports: ElevenLabs, Fish Audio, OpenAI TTS
 * Provider selected via TTS_PROVIDER env var
 */

// ── TTS Provider Types ──

export type TTSProviderName = 'elevenlabs' | 'fish' | 'openai';
export type STTProviderName = 'webspeech' | 'deepgram';

export interface VoiceProfile {
    /** Display name for the voice */
    name: string;
    /** Provider-specific voice ID */
    elevenlabsVoiceId: string;
    /** Fish Audio reference model ID */
    fishModelId: string;
    /** OpenAI voice name */
    openaiVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    /** Voice characteristics */
    gender: 'male' | 'female';
    ageRange: 'young' | 'middle' | 'senior';
    /** Personality descriptors for voice tuning */
    style: string;
    /** ElevenLabs-specific voice settings */
    elevenlabsSettings: {
        stability: number;          // 0.0–1.0: lower = more expressive
        similarity_boost: number;   // 0.0–1.0: higher = closer to original
        style: number;              // 0.0–1.0: higher = more dramatic
        use_speaker_boost: boolean;
    };
    /** Fish Audio-specific settings */
    fishSettings: {
        temperature: number;    // 0.0–1.0: expressiveness
        top_p: number;          // 0.0–1.0: diversity
        speed: number;          // 0.5–2.0
    };
}

export interface TTSRequest {
    text: string;
    voiceProfile: VoiceProfile;
    /** Output format */
    format?: 'mp3' | 'wav' | 'opus';
}

export interface TTSResponse {
    /** Audio data as ArrayBuffer */
    audioBuffer: ArrayBuffer;
    /** MIME type */
    contentType: string;
    /** Provider that generated the audio */
    provider: TTSProviderName;
    /** Latency in ms */
    latencyMs: number;
}

export interface TTSProvider {
    name: TTSProviderName;
    /** Generate speech from text */
    synthesize(request: TTSRequest): Promise<TTSResponse>;
    /** Check if the provider is configured and available */
    isAvailable(): boolean;
}

// ── STT Provider Types ──

export interface STTRequest {
    /** Audio data as ArrayBuffer (WAV/WebM from MediaRecorder) */
    audioBuffer: ArrayBuffer;
    /** MIME type of the audio */
    contentType: string;
    /** Language code */
    language?: string;
}

export interface STTResponse {
    /** Transcribed text */
    transcript: string;
    /** Confidence score 0.0-1.0 */
    confidence: number;
    /** Provider that transcribed */
    provider: STTProviderName;
    /** Latency in ms */
    latencyMs: number;
    /** Whether this is a final result */
    isFinal: boolean;
}

export interface STTProvider {
    name: STTProviderName;
    /** Transcribe audio to text */
    transcribe(request: STTRequest): Promise<STTResponse>;
    /** Check if the provider is configured and available */
    isAvailable(): boolean;
}
