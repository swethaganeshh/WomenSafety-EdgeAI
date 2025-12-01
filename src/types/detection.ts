export type DistressLevel = 'high' | 'medium' | 'low' | 'none';

export type AlertType = 'sos' | 'notify_contacts' | 'safety_check';

export type AlertStatus = 'pending' | 'sent' | 'acknowledged' | 'false_alarm';

export interface EdgeImpulseClassification {
  scream: number;
  noise: number;
  talking: number;
  silence: number;
}

export interface DetectionResult {
  detection: boolean;
  distress_level: DistressLevel;
  scream_confidence: number;
  noise_confidence: number;
  talking_confidence: number;
  silence_confidence: number;
  recommended_action: string;
  timestamp: string;
  message_for_user: string;
  message_for_emergency_contacts: string;
  accelerometer_spike?: boolean;
  device_movement?: boolean;
  keyword_detected?: string;
  latitude?: number;
  longitude?: number;
}

export interface DetectionEvent {
  id: string;
  user_id?: string;
  detection: boolean;
  distress_level: DistressLevel;
  scream_confidence: number;
  noise_confidence: number;
  talking_confidence: number;
  silence_confidence: number;
  accelerometer_spike: boolean;
  device_movement: boolean;
  keyword_detected?: string;
  recommended_action: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  metadata: Record<string, any>;
}

export interface SafetyAlert {
  id: string;
  detection_event_id: string;
  user_id?: string;
  alert_type: AlertType;
  status: AlertStatus;
  message_for_user: string;
  message_for_contacts?: string;
  contacts_notified: Array<{ name: string; method: string; sent_at: string }>;
  user_response?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  priority: number;
  active: boolean;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  sensitivity_threshold: number;
  auto_alert_enabled: boolean;
  location_sharing_enabled: boolean;
  keyword_detection_enabled: boolean;
  accelerometer_enabled: boolean;
  false_alarm_cooldown_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface AudioAnalysisInput {
  audioData?: Float32Array;
  audioFile?: File;
  classification: EdgeImpulseClassification;
  accelerometerData?: { x: number; y: number; z: number };
  location?: { latitude: number; longitude: number };
  keywords?: string[];
}
