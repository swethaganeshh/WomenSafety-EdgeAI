import { DetectionResult } from '../types/detection';
import { screamDetectionService } from '../services/screamDetectionService';

interface DetectionDisplayProps {
  result: DetectionResult | null;
}

export function DetectionDisplay({ result }: DetectionDisplayProps) {
  if (!result) {
    return (
      <div style={styles.container}>
        <div style={styles.noDataContainer}>
          <svg
            style={styles.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <p style={styles.noDataText}>No detection data yet</p>
          <p style={styles.noDataSubtext}>Start monitoring to analyze audio</p>
        </div>
      </div>
    );
  }

  const explanation = screamDetectionService.getUIExplanation(result);

  const getDistressColor = (level: string): string => {
    switch (level) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#10b981';
    }
  };

  const getDistressIcon = (level: string) => {
    if (level === 'high' || level === 'medium') {
      return (
        <svg style={styles.alertIcon} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg style={styles.alertIcon} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.statusCard,
          borderColor: getDistressColor(result.distress_level)
        }}
      >
        <div style={styles.statusHeader}>
          <div style={{ color: getDistressColor(result.distress_level) }}>
            {getDistressIcon(result.distress_level)}
          </div>
          <div>
            <h2 style={styles.statusTitle}>
              {result.distress_level.toUpperCase()} DISTRESS
            </h2>
            <p style={styles.statusSubtitle}>{explanation}</p>
          </div>
        </div>

        <div style={styles.confidenceDisplay}>
          <div style={styles.confidenceLabel}>Scream Confidence</div>
          <div style={styles.confidenceValue}>
            {(result.scream_confidence * 100).toFixed(1)}%
          </div>
        </div>

        <div style={styles.messageCard}>
          <div style={styles.messageHeader}>
            <svg style={styles.messageIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span style={styles.messageTitle}>User Message</span>
          </div>
          <p style={styles.messageText}>{result.message_for_user}</p>
        </div>

        {result.detection && (
          <div style={styles.actionCard}>
            <div style={styles.actionHeader}>
              <svg style={styles.actionIcon} fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              <span style={styles.actionTitle}>Recommended Action</span>
            </div>
            <p style={styles.actionText}>{result.recommended_action}</p>
          </div>
        )}

        <div style={styles.metadataGrid}>
          {result.accelerometer_spike && (
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Accelerometer Spike</span>
              <span style={styles.metadataBadge}>Detected</span>
            </div>
          )}
          {result.device_movement && (
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Device Movement</span>
              <span style={styles.metadataBadge}>Detected</span>
            </div>
          )}
          {result.keyword_detected && (
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Keyword</span>
              <span style={styles.metadataBadge}>"{result.keyword_detected}"</span>
            </div>
          )}
        </div>

        <div style={styles.timestamp}>
          Detected at: {new Date(result.timestamp).toLocaleString()}
        </div>
      </div>

      <div style={styles.jsonCard}>
        <h3 style={styles.jsonTitle}>JSON Output</h3>
        <pre style={styles.jsonContent}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  noDataContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    color: '#9ca3af'
  },
  icon: {
    width: '64px',
    height: '64px',
    marginBottom: '16px',
    opacity: 0.5
  },
  noDataText: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#d1d5db',
    marginBottom: '8px'
  },
  noDataSubtext: {
    fontSize: '14px',
    color: '#9ca3af'
  },
  statusCard: {
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    padding: '24px',
    borderLeft: '4px solid',
    color: '#f9fafb'
  },
  statusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  },
  alertIcon: {
    width: '48px',
    height: '48px'
  },
  statusTitle: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '4px',
    color: '#f9fafb'
  },
  statusSubtitle: {
    fontSize: '16px',
    color: '#d1d5db'
  },
  confidenceDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#374151',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  confidenceLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#d1d5db',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  confidenceValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#f9fafb'
  },
  messageCard: {
    backgroundColor: '#374151',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px'
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  messageIcon: {
    width: '20px',
    height: '20px',
    color: '#9ca3af'
  },
  messageTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#d1d5db',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  messageText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#f9fafb'
  },
  actionCard: {
    backgroundColor: '#374151',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px'
  },
  actionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  actionIcon: {
    width: '20px',
    height: '20px',
    color: '#fbbf24'
  },
  actionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#d1d5db',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  actionText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#f9fafb'
  },
  metadataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  metadataItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metadataLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  metadataBadge: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fbbf24',
    backgroundColor: '#374151',
    padding: '4px 8px',
    borderRadius: '4px',
    width: 'fit-content'
  },
  timestamp: {
    fontSize: '12px',
    color: '#6b7280',
    paddingTop: '12px',
    borderTop: '1px solid #374151'
  },
  jsonCard: {
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    padding: '24px',
    overflow: 'hidden'
  },
  jsonTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#d1d5db',
    marginBottom: '12px'
  },
  jsonContent: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#10b981',
    backgroundColor: '#111827',
    padding: '16px',
    borderRadius: '8px',
    overflow: 'auto',
    maxHeight: '400px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
};
