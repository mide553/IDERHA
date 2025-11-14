-- API Keys table for hospital authentication
CREATE TABLE IF NOT EXISTS api_keys (
    id BIGSERIAL PRIMARY KEY,
    key_value VARCHAR(64) UNIQUE NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    hospital_id VARCHAR(100),
    assigned_database VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_by VARCHAR(255),
    description TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_keys_key_value ON api_keys(key_value);
CREATE INDEX IF NOT EXISTS idx_api_keys_hospital_id ON api_keys(hospital_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

COMMENT ON TABLE api_keys IS 'API keys for hospital data upload authentication';
COMMENT ON COLUMN api_keys.key_value IS 'The actual API key value (should be kept secure)';
COMMENT ON COLUMN api_keys.key_name IS 'Human-readable name for the API key';
COMMENT ON COLUMN api_keys.hospital_id IS 'Identifier for the hospital this key belongs to';
COMMENT ON COLUMN api_keys.assigned_database IS 'Database this key has access to (hospital1 or hospital2)';
COMMENT ON COLUMN api_keys.is_active IS 'Whether the API key is currently active';
COMMENT ON COLUMN api_keys.expires_at IS 'When the API key expires (NULL for no expiration)';
COMMENT ON COLUMN api_keys.last_used_at IS 'Last time this API key was used';
COMMENT ON COLUMN api_keys.created_by IS 'Email of the admin who created this key';
COMMENT ON COLUMN api_keys.description IS 'Optional description of the API key purpose';