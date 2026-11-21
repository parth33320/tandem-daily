import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock AudioContext for sound effects
class MockAudioContext {
  state = 'running';
  sampleRate = 44100;
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
  }
  createBuffer() { return { getChannelData: () => new Float32Array(1) }; }
  createBufferSource() { return { buffer: null, connect: vi.fn(), start: vi.fn() }; }
  createBiquadFilter() { return { type: 'bandpass', Q: { value: 1 }, frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } }; }
  resume() { return Promise.resolve(); }
}

globalThis.AudioContext = MockAudioContext as any;
(globalThis as any).webkitAudioContext = MockAudioContext as any;