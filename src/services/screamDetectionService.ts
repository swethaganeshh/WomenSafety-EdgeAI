import {
  EdgeImpulseClassification,
  DetectionResult,
  DistressLevel,
  AudioAnalysisInput
} from '../types/detection';

export class ScreamDetectionService {
  private readonly HIGH_DISTRESS_THRESHOLD = 0.75;
  private readonly MEDIUM_DISTRESS_THRESHOLD = 0.50;
  private readonly UNUSUAL_NOISE_THRESHOLD = 0.60;

  analyzeAudio(input: AudioAnalysisInput): DetectionResult {
    const { classification, accelerometerData, location, keywords } = input;

    const screamConfidence = classification.scream;
    const noiseConfidence = classification.noise;
    const talkingConfidence = classification.talking;
    const silenceConfidence = classification.silence;

    const distressLevel = this.calculateDistressLevel(
      screamConfidence,
      noiseConfidence,
      accelerometerData
    );

    const detection = distressLevel !== 'none';

    const accelerometerSpike = this.detectAccelerometerSpike(accelerometerData);
    const deviceMovement = this.detectDeviceMovement(accelerometerData);
    const keywordDetected = this.detectDistressKeywords(keywords);

    const recommendedAction = this.determineRecommendedAction(
      distressLevel,
      screamConfidence,
      accelerometerSpike,
      keywordDetected
    );

    const { messageForUser, messageForContacts } = this.generateMessages(
      distressLevel,
      screamConfidence,
      keywordDetected
    );

    const result: DetectionResult = {
      detection,
      distress_level: distressLevel,
      scream_confidence: screamConfidence,
      noise_confidence: noiseConfidence,
      talking_confidence: talkingConfidence,
      silence_confidence: silenceConfidence,
      recommended_action: recommendedAction,
      timestamp: new Date().toISOString(),
      message_for_user: messageForUser,
      message_for_emergency_contacts: messageForContacts,
      accelerometer_spike: accelerometerSpike,
      device_movement: deviceMovement,
      keyword_detected: keywordDetected,
      ...(location && { latitude: location.latitude, longitude: location.longitude })
    };

    return result;
  }

  private calculateDistressLevel(
    screamConfidence: number,
    noiseConfidence: number,
    accelerometerData?: { x: number; y: number; z: number }
  ): DistressLevel {
    const hasAccelerometerSpike = this.detectAccelerometerSpike(accelerometerData);

    if (screamConfidence >= this.HIGH_DISTRESS_THRESHOLD) {
      return 'high';
    }

    if (screamConfidence >= this.MEDIUM_DISTRESS_THRESHOLD) {
      return 'medium';
    }

    if (
      screamConfidence > 0.30 &&
      noiseConfidence >= this.UNUSUAL_NOISE_THRESHOLD &&
      hasAccelerometerSpike
    ) {
      return 'low';
    }

    if (noiseConfidence >= this.UNUSUAL_NOISE_THRESHOLD && hasAccelerometerSpike) {
      return 'low';
    }

    return 'none';
  }

  private detectAccelerometerSpike(data?: { x: number; y: number; z: number }): boolean {
    if (!data) return false;

    const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    const SPIKE_THRESHOLD = 15;

    return magnitude > SPIKE_THRESHOLD;
  }

  private detectDeviceMovement(data?: { x: number; y: number; z: number }): boolean {
    if (!data) return false;

    const totalMovement = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);
    const MOVEMENT_THRESHOLD = 8;

    return totalMovement > MOVEMENT_THRESHOLD;
  }

  private detectDistressKeywords(keywords?: string[]): string | undefined {
    if (!keywords || keywords.length === 0) return undefined;

    const distressKeywords = ['help', 'stop', 'leave me', 'no', 'please', 'someone'];

    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (distressKeywords.some(dk => lowerKeyword.includes(dk))) {
        return keyword;
      }
    }

    return undefined;
  }

  private determineRecommendedAction(
    distressLevel: DistressLevel,
    _screamConfidence: number,
    accelerometerSpike: boolean,
    keywordDetected?: string
  ): string {
    if (distressLevel === 'high') {
      return 'Auto-trigger SOS and send location to emergency contacts immediately';
    }

    if (distressLevel === 'medium') {
      if (keywordDetected || accelerometerSpike) {
        return 'Auto-trigger SOS and send location to emergency contacts';
      }
      return 'Notify trusted contacts and ask user to confirm safety';
    }

    if (distressLevel === 'low') {
      return 'Ask user "Are you safe?" and monitor for response';
    }

    return 'Continue monitoring - no action required';
  }

  private generateMessages(
    distressLevel: DistressLevel,
    screamConfidence: number,
    keywordDetected?: string
  ): { messageForUser: string; messageForContacts: string } {
    const confidencePercent = (screamConfidence * 100).toFixed(0);
    let messageForUser: string;
    let messageForContacts: string;

    switch (distressLevel) {
      case 'high':
        messageForUser = `EMERGENCY DETECTED: High distress signal (${confidencePercent}% confidence). Emergency contacts are being notified immediately. Help is on the way.`;
        messageForContacts = `🚨 EMERGENCY ALERT: Possible distress detected with high confidence (${confidencePercent}%). Please check on this person immediately and consider contacting emergency services.`;
        break;

      case 'medium':
        messageForUser = keywordDetected
          ? `Distress signal detected including keyword "${keywordDetected}". Emergency contacts will be notified. Tap here if this is a false alarm.`
          : `Possible distress detected (${confidencePercent}% confidence). Emergency contacts will be notified shortly. Tap here if you're safe.`;
        messageForContacts = `⚠️ SAFETY ALERT: Potential distress detected (${confidencePercent}% confidence). Please reach out to check if they need assistance.`;
        break;

      case 'low':
        messageForUser = `Unusual activity detected. Are you safe? Please respond within 30 seconds.`;
        messageForContacts = `ℹ️ Safety check: Unusual activity detected. Monitoring the situation.`;
        break;

      default:
        messageForUser = 'All clear - no distress detected.';
        messageForContacts = 'No emergency detected.';
    }

    return { messageForUser, messageForContacts };
  }

  getUIExplanation(result: DetectionResult): string {
    if (result.distress_level === 'high') {
      return 'Emergency detected - Help has been dispatched';
    }

    if (result.distress_level === 'medium') {
      return 'Possible distress - Emergency contacts notified';
    }

    if (result.distress_level === 'low') {
      return 'Unusual activity detected - Please confirm you are safe';
    }

    return 'All clear - Monitoring continues';
  }

  validateClassification(classification: EdgeImpulseClassification): boolean {
    const sum = classification.scream + classification.noise +
                classification.talking + classification.silence;

    if (Math.abs(sum - 1.0) > 0.1) {
      console.warn('Classification scores do not sum to ~1.0:', sum);
    }

    return classification.scream >= 0 && classification.scream <= 1 &&
           classification.noise >= 0 && classification.noise <= 1 &&
           classification.talking >= 0 && classification.talking <= 1 &&
           classification.silence >= 0 && classification.silence <= 1;
  }
}

export const screamDetectionService = new ScreamDetectionService();
