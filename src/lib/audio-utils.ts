/**
 * Convert Float32 audio data to 16-bit PCM (S16LE)
 */
export function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output.buffer;
}

/**
 * Resample audio from current sample rate to 16000Hz
 */
export function resample(input: Float32Array, fromSampleRate: number, toSampleRate: number): Float32Array {
  if (fromSampleRate === toSampleRate) return input;
  const ratio = fromSampleRate / toSampleRate;
  const length = Math.floor(input.length / ratio);
  const result = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = input[Math.floor(i * ratio)];
  }
  return result;
}

