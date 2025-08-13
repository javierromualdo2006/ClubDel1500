-- Vistas y funciones útiles para el Sistema de Gestión Club del 1500

-- Vista para estadísticas de usuarios
CREATE VIEW user_statistics AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
    COUNT(CASE WHEN email_notifications = true THEN 1 END) as users_with_notifications
FROM users;

-- Vista para estadísticas de productos
CREATE VIEW product_statistics AS
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_products,
    AVG(price) as average_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM products;

-- Vista para estadísticas de manuales por marca
CREATE VIEW manual_statistics_by_brand AS
SELECT 
    brand,
    COUNT(*) as manual_count,
    AVG(file_size) as avg_file_size,
    SUM(file_size) as total_file_size
FROM car_manuals
GROUP BY brand
ORDER BY manual_count DESC;

-- Vista para eventos próximos
CREATE VIEW upcoming_events AS
SELECT 
    id,
    title,
    description,
    event_date,
    event_time,
    address,
    image_url,
    EXTRACT(DAYS FROM (event_date - CURRENT_DATE)) as days_until_event
FROM calendar_events
WHERE event_date >= CURRENT_DATE
ORDER BY event_date ASC;

-- Vista para actividad reciente
CREATE VIEW recent_activity AS
SELECT 
    al.id,
    u.username,
    al.action,
    al.entity_type,
    al.entity_id,
    al.details,
    al.created_at
FROM activity_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 50;

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'users', (SELECT row_to_json(user_statistics) FROM user_statistics),
        'products', (SELECT row_to_json(product_statistics) FROM product_statistics),
        'manuals', (SELECT COUNT(*) FROM car_manuals),
        'events', (SELECT COUNT(*) FROM calendar_events WHERE event_date >= CURRENT_DATE),
        'reports', (SELECT COUNT(*) FROM reports WHERE status = 'active')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar actividad del usuario
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id INTEGER,
    p_action VARCHAR(100),
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id INTEGER DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql;

-- Función para obtener manuales por filtros
CREATE OR REPLACE FUNCTION get_manuals_filtered(
    p_brand VARCHAR(100) DEFAULT NULL,
    p_model VARCHAR(100) DEFAULT NULL,
    p_year VARCHAR(10) DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR(255),
    brand VARCHAR(100),
    model VARCHAR(100),
    year VARCHAR(10),
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size BIGINT,
    upload_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.id,
        cm.title,
        cm.brand,
        cm.model,
        cm.year,
        cm.file_name,
        cm.file_type,
        cm.file_size,
        cm.upload_date
    FROM car_manuals cm
    WHERE 
        (p_brand IS NULL OR cm.brand ILIKE '%' || p_brand || '%')
        AND (p_model IS NULL OR cm.model ILIKE '%' || p_model || '%')
        AND (p_year IS NULL OR cm.year = p_year)
    ORDER BY cm.upload_date DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener eventos del mes
CREATE OR REPLACE FUNCTION get_events_by_month(
    p_year INTEGER,
    p_month INTEGER
)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR(255),
    description TEXT,
    event_date DATE,
    event_time VARCHAR(20),
    address TEXT,
    image_url VARCHAR(500)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.id,
        ce.title,
        ce.description,
        ce.event_date,
        ce.event_time,
        ce.address,
        ce.image_url
    FROM calendar_events ce
    WHERE 
        EXTRACT(YEAR FROM ce.event_date) = p_year
        AND EXTRACT(MONTH FROM ce.event_date) = p_month
    ORDER BY ce.event_date ASC, ce.event_time ASC;
END;
$$ LANGUAGE plpgsql;
