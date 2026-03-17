/**
 * Voice Module — SalesSim
 * 
 * Barrel export for the voice provider abstraction layer.
 */

export type { TTSProviderName, STTProviderName, VoiceProfile, TTSRequest, TTSResponse, TTSProvider, STTRequest, STTResponse, STTProvider } from './types';
export { synthesizeSpeech, getProviderStatus } from './ttsProvider';
export { transcribeAudio, getSTTStatus } from './sttProvider';
export { STAKEHOLDER_VOICES, resolveVoiceProfile, resolveVoiceFromNameAge } from './voiceProfiles';
export { ElevenLabsProvider } from './elevenlabs';
export { FishAudioProvider } from './fishAudio';
export { OpenAITTSProvider } from './openaiTTS';
export { DeepgramSTTProvider } from './deepgram';
