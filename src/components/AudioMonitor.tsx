import { useState, useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';
import { screamDetectionService } from '../services/screamDetectionService';
import { emergencyService } from '../services/emergencyService';
import { DetectionResult, EdgeImpulseClassification } from '../types/detection';

interface AudioMonitorProps {
  onDetection: (result: DetectionResult) => void;
  isMonitoring: boolean;
  userId?: string;
}

export function AudioMonitor({ onDetection, isMonitoring, userId }: AudioMonitorProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [lastClassification, setLastClassification] = useState<EdgeImpulseClassification | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [isMonitoring]);

  const startMonitoring = async () => {
    const success = await audioService.startRecording(handleAudioData);

    if (!success) {
      console.error('Failed to start audio recording');
      return;
    }

    processingIntervalRef.current = window.setInterval(async () => {
      if (!isProcessing) {
        await processCurrentAudio();
      }
    }, 2000);
  };

  const stopMonitoring = () => {
    audioService.stopRecording();

    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
  };

  const handleAudioData = (audioData: Float32Array) => {
    const level = audioService.getAudioLevel(audioData);
    setAudioLevel(level);
  };

  const processCurrentAudio = async () => {
    setIsProcessing(true);

    try {
      const mockClassification = audioService.mockEdgeImpulseClassification(
        audioLevel > 0.5 ? 'medium' : 'none'
      );

      setLastClassification(mockClassification);

      if (!screamDetectionService.validateClassification(mockClassification)) {
        console.warn('Invalid classification received');
        setIsProcessing(false);
        return;
      }

      const location = await emergencyService.getLocationCoordinates();
      const accelerometerData = emergencyService.generateMockAccelerometerData('normal');

      const result = screamDetectionService.analyzeAudio({
        classification: mockClassification,
        accelerometerData,
        location: location || undefined
      });

      onDetection(result);

      if (result.detection) {
        await emergencyService.handleEmergencyDetection(result, userId);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.visualizer}>
        <div style={styles.levelBarContainer}>
          <div
            style={{
              ...styles.levelBar,
              width: `${audioLevel * 100}%`,
              backgroundColor: audioLevel > 0.7 ? '#ef4444' : audioLevel > 0.4 ? '#f59e0b' : '#10b981'
            }}
          />
        </div>
        <p style={styles.levelText}>Audio Level: {(audioLevel * 100).toFixed(0)}%</p>
      </div>

      {lastClassification && (
        <div style={styles.classificationContainer}>
          <h3 style={styles.classificationTitle}>Current Classification</h3>
          <div style={styles.classificationGrid}>
            <ClassificationBar
              label="Scream"
              value={lastClassification.scream}
              color="#ef4444"
            />
            <ClassificationBar
              label="Noise"
              value={lastClassification.noise}
              color="#f59e0b"
            />
            <ClassificationBar
              label="Talking"
              value={lastClassification.talking}
              color="#3b82f6"
            />
            <ClassificationBar
              label="Silence"
              value={lastClassification.silence}
              color="#6b7280"
            />
          </div>
        </div>
      )}

      <div style={styles.status}>
        <div style={{
          ...styles.statusIndicator,
          backgroundColor: isMonitoring ? '#10b981' : '#6b7280'
        }} />
        <span style={styles.statusText}>
          {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
        </span>
      </div>
    </div>
  );
}

interface ClassificationBarProps {
  label: string;
  value: number;
  color: string;
}

function ClassificationBar({ label, value, color }: ClassificationBarProps) {
  return (
    <div style={styles.classificationItem}>
      <div style={styles.classificationLabel}>
        <span>{label}</span>
        <span style={styles.classificationValue}>{(value * 100).toFixed(0)}%</span>
      </div>
      <div style={styles.classificationBarContainer}>
        <div
          style={{
            ...styles.classificationBar,
            width: `${value * 100}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    color: '#f9fafb'
  },
  visualizer: {
    marginBottom: '24px'
  },
  levelBarContainer: {
    width: '100%',
    height: '48px',
    backgroundColor: '#374151',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative'
  },
  levelBar: {
    height: '100%',
    transition: 'width 0.1s ease-out, background-color 0.3s ease'
  },
  levelText: {
    marginTop: '12px',
    fontSize: '14px',
    color: '#d1d5db',
    textAlign: 'center'
  },
  classificationContainer: {
    marginBottom: '24px'
  },
  classificationTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#f9fafb'
  },
  classificationGrid: {
    display: 'grid',
    gap: '12px'
  },
  classificationItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  classificationLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#d1d5db'
  },
  classificationValue: {
    fontWeight: 600,
    color: '#f9fafb'
  },
  classificationBarContainer: {
    width: '100%',
    height: '24px',
    backgroundColor: '#374151',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  classificationBar: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #374151'
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  statusText: {
    fontSize: '14px',
    color: '#d1d5db',
    fontWeight: 500
  }
};
