-- Configuración de seguridad y permisos para el Sistema de Gestión Club del 1500

-- Crear roles de base de datos
CREATE ROLE app_admin;
CREATE ROLE app_user;
CREATE ROLE app_readonly;

-- Permisos para el rol admin (acceso completo)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_admin;

-- Permisos para el rol user (acceso limitado)
GRANT SELECT, INSERT, UPDATE ON users TO app_user;
GRANT SELECT ON products TO app_user;
GRANT SELECT, INSERT ON car_manuals TO app_user;
GRANT SELECT, INSERT ON calendar_events TO app_user;
GRANT SELECT ON reports TO app_user;
GRANT SELECT, INSERT ON activity_logs TO app_user;
GRANT SELECT ON system_settings TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Permisos para el rol readonly (solo lectura)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;

-- Políticas de seguridad a nivel de fila (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: pueden ver y editar su propia información
CREATE POLICY user_own_data ON users
    FOR ALL
    USING (id = current_setting('app.current_user_id')::INTEGER);

-- Política para administradores: pueden ver todos los usuarios
CREATE POLICY admin_all_users ON users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('app.current_user_id')::INTEGER 
            AND role = 'admin'
        )
    );

-- Política para productos: todos pueden ver, solo admins pueden modificar
CREATE POLICY products_read_all ON products
    FOR SELECT
    USING (true);

CREATE POLICY products_admin_modify ON products
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('app.current_user_id')::INTEGER 
            AND role = 'admin'
        )
    );

-- Política para manuales: todos pueden ver, usuarios pueden subir, admins pueden eliminar
CREATE POLICY manuals_read_all ON car_manuals
    FOR SELECT
    USING (true);

CREATE POLICY manuals_user_insert ON car_manuals
    FOR INSERT
    WITH CHECK (uploaded_by = current_setting('app.current_user_id')::INTEGER);

CREATE POLICY manuals_admin_all ON car_manuals
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('app.current_user_id')::INTEGER 
            AND role = 'admin'
        )
    );

-- Función para establecer el usuario actual en la sesión
CREATE OR REPLACE FUNCTION set_current_user(user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::TEXT, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para validar contraseñas (ejemplo básico)
CREATE OR REPLACE FUNCTION validate_password(password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Validar que la contraseña tenga al menos 6 caracteres
    IF LENGTH(password) < 6 THEN
        RETURN FALSE;
    END IF;
    
    -- Aquí se pueden agregar más validaciones
    -- Por ejemplo: mayúsculas, minúsculas, números, caracteres especiales
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para hash de contraseñas (placeholder - usar bcrypt en la aplicación)
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    -- En producción, usar una librería de hash segura como bcrypt
    -- Este es solo un placeholder
    RETURN '$2b$10$' || encode(digest(password || 'salt', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger para hash automático de contraseñas
CREATE OR REPLACE FUNCTION hash_password_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password_hash != OLD.password_hash) THEN
        -- Solo hacer hash si la contraseña no está ya hasheada
        IF NOT (NEW.password_hash LIKE '$2b$%') THEN
            NEW.password_hash = hash_password(NEW.password_hash);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hash_user_password
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION hash_password_trigger();

-- Índices para mejorar seguridad y rendimiento
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_activity_logs_ip ON activity_logs(ip_address);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla de usuarios del sistema con roles y permisos';
COMMENT ON TABLE products IS 'Catálogo de productos con información y precios';
COMMENT ON TABLE car_manuals IS 'Manuales de automóviles con archivos adjuntos';
COMMENT ON TABLE calendar_events IS 'Eventos del calendario con fechas y ubicaciones';
COMMENT ON TABLE reports IS 'Reportes del sistema con datos y estadísticas';
COMMENT ON TABLE email_campaigns IS 'Campañas de email enviadas a usuarios';
COMMENT ON TABLE activity_logs IS 'Registro de actividades del sistema para auditoría';
COMMENT ON TABLE system_settings IS 'Configuraciones globales del sistema';
