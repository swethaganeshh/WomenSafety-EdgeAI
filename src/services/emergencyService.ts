import { DetectionResult, SafetyAlert, EmergencyContact } from '../types/detection';
import { databaseService } from './databaseService';

export class EmergencyService {
  async handleEmergencyDetection(
    result: DetectionResult,
    userId?: string
  ): Promise<SafetyAlert | null> {
    const detectionEvent = await databaseService.saveDetectionEvent(result, userId);

    if (!detectionEvent) {
      console.error('Failed to save detection event');
      return null;
    }

    if (result.distress_level === 'none') {
      return null;
    }

    const alert = await databaseService.createSafetyAlert(
      detectionEvent.id,
      result,
      userId
    );

    if (!alert) {
      console.error('Failed to create safety alert');
      return null;
    }

    if (userId) {
      const settings = await databaseService.getUserSettings(userId);

      if (settings?.auto_alert_enabled) {
        await this.notifyEmergencyContacts(alert, userId);
      }
    }

    return alert;
  }

  async notifyEmergencyContacts(
    alert: SafetyAlert,
    userId: string
  ): Promise<boolean> {
    const contacts = await databaseService.getEmergencyContacts(userId);

    if (contacts.length === 0) {
      console.warn('No emergency contacts found for user');
      return false;
    }

    const notificationResults: Array<{ name: string; method: string; sent_at: string }> = [];

    for (const contact of contacts) {
      const notified = await this.sendNotificationToContact(contact, alert);

      if (notified) {
        notificationResults.push({
          name: contact.name,
          method: contact.phone ? 'SMS' : 'Email',
          sent_at: new Date().toISOString()
        });
      }
    }

    await databaseService.updateAlertStatus(alert.id, 'sent');

    console.log(`Notified ${notificationResults.length} emergency contacts`);
    return notificationResults.length > 0;
  }

  private async sendNotificationToContact(
    contact: EmergencyContact,
    alert: SafetyAlert
  ): Promise<boolean> {
    const locationText = alert.latitude && alert.longitude
      ? `Location: https://maps.google.com/?q=${alert.latitude},${alert.longitude}`
      : 'Location not available';

    const message = `${alert.message_for_contacts}\n\n${locationText}\n\nTime: ${new Date(alert.created_at).toLocaleString()}`;

    console.log(`[SIMULATION] Sending notification to ${contact.name}:`);
    console.log(`  Method: ${contact.phone ? 'SMS to ' + contact.phone : 'Email to ' + contact.email}`);
    console.log(`  Message: ${message}`);

    return true;
  }

  async respondToSafetyCheck(
    alertId: string,
    isSafe: boolean,
    additionalMessage?: string
  ): Promise<boolean> {
    const status = isSafe ? 'false_alarm' : 'acknowledged';
    const response = isSafe
      ? `User confirmed safe${additionalMessage ? ': ' + additionalMessage : ''}`
      : `User confirmed distress${additionalMessage ? ': ' + additionalMessage : ''}`;

    return await databaseService.updateAlertStatus(alertId, status, response);
  }

  async getLocationCoordinates(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        },
        { timeout: 5000, maximumAge: 0 }
      );
    });
  }

  async simulateAccelerometerData(): Promise<{ x: number; y: number; z: number } | null> {
    if ('Accelerometer' in window) {
      try {
        const accelerometer = new (window as any).Accelerometer({ frequency: 10 });

        return new Promise((resolve) => {
          accelerometer.addEventListener('reading', () => {
            resolve({
              x: accelerometer.x,
              y: accelerometer.y,
              z: accelerometer.z
            });
            accelerometer.stop();
          });

          accelerometer.start();

          setTimeout(() => {
            accelerometer.stop();
            resolve(null);
          }, 1000);
        });
      } catch (error) {
        console.warn('Accelerometer not available:', error);
      }
    }

    return null;
  }

  generateMockAccelerometerData(scenario: 'normal' | 'spike' | 'movement'): { x: number; y: number; z: number } {
    switch (scenario) {
      case 'spike':
        return { x: 18, y: -12, z: 15 };
      case 'movement':
        return { x: 5, y: 4, z: -6 };
      case 'normal':
      default:
        return { x: 0.5, y: -0.3, z: 9.8 };
    }
  }
}

export const emergencyService = new EmergencyService();
