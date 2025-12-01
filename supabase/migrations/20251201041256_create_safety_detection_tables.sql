/*
  # Scream Detection Safety System Database Schema

  ## Overview
  This migration creates the database structure for a real-time scream detection
  and safety alert system powered by Edge Impulse audio classification.

  ## New Tables

  ### 1. `detection_events`
  Records every audio classification event from the Edge Impulse model
  - `id` (uuid, primary key) - Unique identifier for each detection event
  - `user_id` (uuid, nullable) - Reference to authenticated user if applicable
  - `detection` (boolean) - Whether a scream was detected
  - `distress_level` (text) - Classification: 'high', 'medium', 'low', or 'none'
  - `scream_confidence` (numeric) - Confidence score from Edge Impulse (0.0 to 1.0)
  - `noise_confidence` (numeric) - Confidence score for noise classification
  - `talking_confidence` (numeric) - Confidence score for talking classification
  - `silence_confidence` (numeric) - Confidence score for silence classification
  - `accelerometer_spike` (boolean) - Whether unusual movement was detected
  - `device_movement` (boolean) - Whether sudden device movement occurred
  - `keyword_detected` (text, nullable) - Any detected distress keywords
  - `recommended_action` (text) - System recommendation based on analysis
  - `latitude` (numeric, nullable) - Location latitude if available
  - `longitude` (numeric, nullable) - Location longitude if available
  - `created_at` (timestamptz) - When the event was recorded
  - `metadata` (jsonb) - Additional contextual data

  ### 2. `safety_alerts`
  Tracks emergency alerts triggered by the system
  - `id` (uuid, primary key) - Unique identifier for each alert
  - `detection_event_id` (uuid) - Reference to the detection event that triggered the alert
  - `user_id` (uuid, nullable) - User associated with the alert
  - `alert_type` (text) - Type: 'sos', 'notify_contacts', 'safety_check'
  - `status` (text) - Current status: 'pending', 'sent', 'acknowledged', 'false_alarm'
  - `message_for_user` (text) - Message displayed to the user
  - `message_for_contacts` (text) - Message sent to emergency contacts
  - `contacts_notified` (jsonb) - List of contacts that were notified
  - `user_response` (text, nullable) - User's response to the safety check
  - `latitude` (numeric, nullable) - Alert location latitude
  - `longitude` (numeric, nullable) - Alert location longitude
  - `created_at` (timestamptz) - When the alert was created
  - `updated_at` (timestamptz) - When the alert was last updated

  ### 3. `emergency_contacts`
  Stores trusted contacts for emergency notifications
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - User who owns this contact
  - `name` (text) - Contact's name
  - `phone` (text, nullable) - Contact's phone number
  - `email` (text, nullable) - Contact's email address
  - `priority` (integer) - Notification priority (1 is highest)
  - `active` (boolean) - Whether this contact should be notified
  - `created_at` (timestamptz) - When the contact was added

  ### 4. `user_settings`
  User preferences for the safety system
  - `user_id` (uuid, primary key) - User identifier
  - `sensitivity_threshold` (numeric) - Scream confidence threshold (default: 0.75)
  - `auto_alert_enabled` (boolean) - Whether to auto-trigger alerts (default: true)
  - `location_sharing_enabled` (boolean) - Whether to share location (default: true)
  - `keyword_detection_enabled` (boolean) - Whether to detect distress keywords
  - `accelerometer_enabled` (boolean) - Whether to monitor device movement
  - `false_alarm_cooldown_minutes` (integer) - Minutes before retriggering after false alarm
  - `created_at` (timestamptz) - When settings were created
  - `updated_at` (timestamptz) - When settings were last updated

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled for data protection
  - Users can only access their own data
  - Emergency contacts can only be managed by their owner
  - Detection events and alerts are user-scoped

  ### Policies
  - Authenticated users can insert their own detection events
  - Users can view and manage their own alerts
  - Users can manage their emergency contacts
  - Users can update their own settings
*/

-- Create detection_events table
CREATE TABLE IF NOT EXISTS detection_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  detection boolean NOT NULL DEFAULT false,
  distress_level text NOT NULL CHECK (distress_level IN ('high', 'medium', 'low', 'none')),
  scream_confidence numeric NOT NULL CHECK (scream_confidence >= 0 AND scream_confidence <= 1),
  noise_confidence numeric DEFAULT 0 CHECK (noise_confidence >= 0 AND noise_confidence <= 1),
  talking_confidence numeric DEFAULT 0 CHECK (talking_confidence >= 0 AND talking_confidence <= 1),
  silence_confidence numeric DEFAULT 0 CHECK (silence_confidence >= 0 AND silence_confidence <= 1),
  accelerometer_spike boolean DEFAULT false,
  device_movement boolean DEFAULT false,
  keyword_detected text,
  recommended_action text NOT NULL,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_detection_events_user_id ON detection_events(user_id);
CREATE INDEX IF NOT EXISTS idx_detection_events_created_at ON detection_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_detection_events_distress_level ON detection_events(distress_level);

-- Create safety_alerts table
CREATE TABLE IF NOT EXISTS safety_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_event_id uuid REFERENCES detection_events(id) ON DELETE CASCADE,
  user_id uuid,
  alert_type text NOT NULL CHECK (alert_type IN ('sos', 'notify_contacts', 'safety_check')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'false_alarm')),
  message_for_user text NOT NULL,
  message_for_contacts text,
  contacts_notified jsonb DEFAULT '[]'::jsonb,
  user_response text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_safety_alerts_user_id ON safety_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_status ON safety_alerts(status);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_created_at ON safety_alerts(created_at DESC);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  priority integer NOT NULL DEFAULT 1 CHECK (priority > 0),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT contact_method_required CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_priority ON emergency_contacts(user_id, priority);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY,
  sensitivity_threshold numeric DEFAULT 0.75 CHECK (sensitivity_threshold >= 0 AND sensitivity_threshold <= 1),
  auto_alert_enabled boolean DEFAULT true,
  location_sharing_enabled boolean DEFAULT true,
  keyword_detection_enabled boolean DEFAULT true,
  accelerometer_enabled boolean DEFAULT true,
  false_alarm_cooldown_minutes integer DEFAULT 5 CHECK (false_alarm_cooldown_minutes >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE detection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for detection_events
CREATE POLICY "Users can insert their own detection events"
  ON detection_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own detection events"
  ON detection_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow anonymous detection events"
  ON detection_events FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- RLS Policies for safety_alerts
CREATE POLICY "Users can view their own alerts"
  ON safety_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own alerts"
  ON safety_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own alerts"
  ON safety_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow anonymous alerts"
  ON safety_alerts FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view their own emergency contacts"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emergency contacts"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts"
  ON emergency_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts"
  ON emergency_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
