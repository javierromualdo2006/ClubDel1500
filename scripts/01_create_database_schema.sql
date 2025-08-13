-- Base de datos para Sistema de Gestión Club del 1500
-- Esquema completo con todas las tablas necesarias

-- Tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image_url VARCHAR(500),
    image_filename VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de manuales de autos
CREATE TABLE car_manuals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL, -- en bytes
    file_url VARCHAR(500) NOT NULL,
    upload_date DATE DEFAULT CURRENT_DATE,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de eventos del calendario
CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    image_url VARCHAR(500),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reportes
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    report_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    report_type VARCHAR(100),
    data JSONB, -- Para almacenar datos flexibles del reporte
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de emails enviados
CREATE TABLE email_campaigns (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_type VARCHAR(50) CHECK (recipient_type IN ('all', 'admins', 'users', 'active', 'inactive')),
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
    sent_by INTEGER REFERENCES users(id),
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de destinatarios de emails (para tracking)
CREATE TABLE email_recipients (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    sent_at TIMESTAMP,
    error_message TEXT
);

-- Tabla de sesiones de usuario (para manejo de autenticación)
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logs de actividad del sistema
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'product', 'manual', 'event', 'user', etc.
    entity_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuraciones del sistema
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_manuals_brand_model ON car_manuals(brand, model);
CREATE INDEX idx_manuals_year ON car_manuals(year);
CREATE INDEX idx_events_date ON calendar_events(event_date);
CREATE INDEX idx_reports_date ON reports(report_date);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- Triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manuals_updated_at BEFORE UPDATE ON car_manuals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
