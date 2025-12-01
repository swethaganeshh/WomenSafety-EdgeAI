import { supabase } from '../lib/supabase';
import {
  DetectionResult,
  DetectionEvent,
  SafetyAlert,
  EmergencyContact,
  UserSettings
} from '../types/detection';

export class DatabaseService {
  async saveDetectionEvent(
    result: DetectionResult,
    userId?: string
  ): Promise<DetectionEvent | null> {
    const { data, error } = await supabase
      .from('detection_events')
      .insert({
        user_id: userId,
        detection: result.detection,
        distress_level: result.distress_level,
        scream_confidence: result.scream_confidence,
        noise_confidence: result.noise_confidence,
        talking_confidence: result.talking_confidence,
        silence_confidence: result.silence_confidence,
        accelerometer_spike: result.accelerometer_spike || false,
        device_movement: result.device_movement || false,
        keyword_detected: result.keyword_detected,
        recommended_action: result.recommended_action,
        latitude: result.latitude,
        longitude: result.longitude,
        metadata: {
          message_for_user: result.message_for_user,
          message_for_contacts: result.message_for_emergency_contacts
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving detection event:', error);
      return null;
    }

    return data;
  }

  async createSafetyAlert(
    detectionEventId: string,
    result: DetectionResult,
    userId?: string
  ): Promise<SafetyAlert | null> {
    const alertType = this.determineAlertType(result.distress_level);

    const { data, error } = await supabase
      .from('safety_alerts')
      .insert({
        detection_event_id: detectionEventId,
        user_id: userId,
        alert_type: alertType,
        status: 'pending',
        message_for_user: result.message_for_user,
        message_for_contacts: result.message_for_emergency_contacts,
        latitude: result.latitude,
        longitude: result.longitude
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating safety alert:', error);
      return null;
    }

    return data;
  }

  async updateAlertStatus(
    alertId: string,
    status: string,
    userResponse?: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('safety_alerts')
      .update({
        status,
        user_response: userResponse,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error('Error updating alert status:', error);
      return false;
    }

    return true;
  }

  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching emergency contacts:', error);
      return [];
    }

    return data || [];
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }

    if (!data) {
      return this.createDefaultSettings(userId);
    }

    return data;
  }

  async createDefaultSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        sensitivity_threshold: 0.75,
        auto_alert_enabled: true,
        location_sharing_enabled: true,
        keyword_detection_enabled: true,
        accelerometer_enabled: true,
        false_alarm_cooldown_minutes: 5
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating default settings:', error);
      return null;
    }

    return data;
  }

  async updateUserSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('user_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user settings:', error);
      return false;
    }

    return true;
  }

  async getRecentDetectionEvents(
    userId: string,
    limit: number = 10
  ): Promise<DetectionEvent[]> {
    const { data, error } = await supabase
      .from('detection_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching detection events:', error);
      return [];
    }

    return data || [];
  }

  async getActiveAlerts(userId: string): Promise<SafetyAlert[]> {
    const { data, error } = await supabase
      .from('safety_alerts')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'sent'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active alerts:', error);
      return [];
    }

    return data || [];
  }

  private determineAlertType(
    distressLevel: string
  ): 'sos' | 'notify_contacts' | 'safety_check' {
    if (distressLevel === 'high') {
      return 'sos';
    }
    if (distressLevel === 'medium') {
      return 'notify_contacts';
    }
    return 'safety_check';
  }
}

export const databaseService = new DatabaseService();
