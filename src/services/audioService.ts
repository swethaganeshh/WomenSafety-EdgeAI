import { EdgeImpulseClassification } from '../types/detection';

export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isRecording = false;

  async startRecording(
    onAudioData: (audioData: Float32Array) => void
  ): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.audioContext = new AudioContext({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;

      source.connect(this.analyser);

      this.isRecording = true;

      this.processAudioData(onAudioData);

      return true;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      return false;
    }
  }

  private processAudioData(callback: (audioData: Float32Array) => void): void {
    if (!this.analyser || !this.isRecording) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const process = () => {
      if (!this.isRecording || !this.analyser) return;

      this.analyser.getFloatTimeDomainData(dataArray);
      callback(dataArray);

      requestAnimationFrame(process);
    };

    process();
  }

  stopRecording(): void {
    this.isRecording = false;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
  }

  async processAudioFile(file: File): Promise<Float32Array | null> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      audioContext.close();

      return channelData;
    } catch (error) {
      console.error('Error processing audio file:', error);
      return null;
    }
  }

  async callEdgeImpulseAPI(
    audioData: Float32Array
  ): Promise<EdgeImpulseClassification | null> {
    try {
      const response = await fetch(
        'https://studio.edgeimpulse.com/v1/api/830709/classify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: Array.from(audioData.slice(0, 16000))
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Edge Impulse API error: ${response.statusText}`);
      }

      const result = await response.json();

      return this.parseEdgeImpulseResponse(result);
    } catch (error) {
      console.error('Error calling Edge Impulse API:', error);
      return null;
    }
  }

  private parseEdgeImpulseResponse(response: any): EdgeImpulseClassification {
    const classifications = response.results?.[0]?.classification || response.classification || {};

    return {
      scream: classifications.scream || classifications.Scream || 0,
      noise: classifications.noise || classifications.Noise || 0,
      talking: classifications.talking || classifications.Talking || 0,
      silence: classifications.silence || classifications.Silence || 0
    };
  }

  mockEdgeImpulseClassification(scenario: 'high' | 'medium' | 'low' | 'none'): EdgeImpulseClassification {
    switch (scenario) {
      case 'high':
        return { scream: 0.85, noise: 0.10, talking: 0.03, silence: 0.02 };
      case 'medium':
        return { scream: 0.62, noise: 0.25, talking: 0.08, silence: 0.05 };
      case 'low':
        return { scream: 0.35, noise: 0.45, talking: 0.15, silence: 0.05 };
      case 'none':
        return { scream: 0.05, noise: 0.15, talking: 0.40, silence: 0.40 };
    }
  }

  getAudioLevel(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);
    return Math.min(1, rms * 10);
  }
}

export const audioService = new AudioService();
