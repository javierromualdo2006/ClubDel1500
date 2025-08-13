-- Datos iniciales para el Sistema de Gestión Club del 1500

-- Insertar usuarios iniciales
INSERT INTO users (username, email, password_hash, role, is_active, email_notifications) VALUES
('admin', 'admin@clubdel1500.com', '$2b$10$example_hash_for_password_123', 'admin', true, true),
('usuario', 'usuario@clubdel1500.com', '$2b$10$example_hash_for_any_password', 'user', true, false),
('juan', 'juan@clubdel1500.com', '$2b$10$example_hash_for_any_password', 'user', true, true),
('maria', 'maria@clubdel1500.com', '$2b$10$example_hash_for_any_password', 'user', false, false),
('carlos', 'carlos@clubdel1500.com', '$2b$10$example_hash_for_any_password', 'user', true, true);

-- Insertar productos iniciales
INSERT INTO products (name, description, price, image_url, created_by) VALUES
('Producto 1', 'Descripción del producto 1', 99.00, '/placeholder.svg?height=150&width=150&text=Producto+1', 1),
('Producto 2', 'Descripción del producto 2', 149.00, '/placeholder.svg?height=150&width=150&text=Producto+2', 1),
('Producto 3', 'Descripción del producto 3', 199.00, '/placeholder.svg?height=150&width=150&text=Producto+3', 1),
('Producto 4', 'Descripción del producto 4', 79.00, '/placeholder.svg?height=150&width=150&text=Producto+4', 1),
('Producto 5', 'Descripción del producto 5', 129.00, '/placeholder.svg?height=150&width=150&text=Producto+5', 1),
('Producto 6', 'Descripción del producto 6', 89.00, '/placeholder.svg?height=150&width=150&text=Producto+6', 1),
('Producto 7', 'Descripción del producto 7', 159.00, '/placeholder.svg?height=150&width=150&text=Producto+7', 1),
('Producto 8', 'Descripción del producto 8', 109.00, '/placeholder.svg?height=150&width=150&text=Producto+8', 1);

-- Insertar manuales de autos iniciales
INSERT INTO car_manuals (title, brand, model, year, file_name, file_type, file_size, file_url, uploaded_by) VALUES
('Manual del Usuario', 'Toyota', 'Corolla', '2023', 'toyota_corolla_2023_manual_usuario.pdf', 'PDF', 2621440, '/manuals/toyota_corolla_2023_manual_usuario.pdf', 1),
('Manual de Mantenimiento', 'Honda', 'Civic', '2022', 'honda_civic_2022_mantenimiento.pdf', 'PDF', 3355443, '/manuals/honda_civic_2022_mantenimiento.pdf', 1),
('Manual del Propietario', 'Ford', 'Focus', '2024', 'ford_focus_2024_propietario.pdf', 'PDF', 1887437, '/manuals/ford_focus_2024_propietario.pdf', 1),
('Guía de Reparación', 'Chevrolet', 'Cruze', '2023', 'chevrolet_cruze_2023_reparacion.pdf', 'PDF', 4299161, '/manuals/chevrolet_cruze_2023_reparacion.pdf', 1);

-- Insertar eventos del calendario
INSERT INTO calendar_events (title, description, event_date, event_time, address, image_url, created_by) VALUES
('Reunión de equipo', 'Reunión mensual del equipo para revisar objetivos y planificar las actividades del próximo mes. Se discutirán los proyectos en curso y se asignarán nuevas tareas.', CURRENT_DATE + INTERVAL '15 days', '10:00 AM', 'Sala de Conferencias A, Edificio Principal, Piso 3', '/team-meeting-office.png', 1),
('Presentación cliente', 'Presentación del proyecto final al cliente ABC Corp. Incluye demostración del producto, entrega de documentación y firma de acuerdos.', CURRENT_DATE + INTERVAL '22 days', '2:00 PM', 'Oficinas ABC Corp, Av. Principal 123, Torre Empresarial, Piso 15', '/business-presentation-client-meeting.png', 1),
('Revisión mensual', 'Revisión de métricas y KPIs del mes. Análisis de rendimiento, identificación de áreas de mejora y establecimiento de metas para el siguiente período.', CURRENT_DATE + INTERVAL '28 days', '9:00 AM', 'Auditorio Principal, Centro de Convenciones', '/monthly-review-charts-graphs.png', 1),
('Llamada con proveedor', 'Llamada de seguimiento con el proveedor principal para discutir términos de contrato, precios y cronograma de entregas para el próximo trimestre.', CURRENT_DATE + INTERVAL '10 days', '3:00 PM', 'Videoconferencia - Sala Virtual', NULL, 1),
('Capacitación personal', 'Sesión de capacitación sobre nuevas tecnologías y herramientas de trabajo. Incluye certificación y evaluación de competencias del equipo.', CURRENT_DATE + INTERVAL '25 days', '11:00 AM', 'Centro de Capacitación TechHub, Calle Innovación 456', '/technology-training-workshop.png', 1);

-- Insertar reportes iniciales
INSERT INTO reports (name, report_date, status, report_type, data, created_by) VALUES
('Reporte Mensual Enero', '2024-01-31', 'active', 'monthly', '{"ventas": 15000, "productos_vendidos": 45, "usuarios_activos": 120}', 1),
('Análisis de Productos', '2024-01-15', 'active', 'products', '{"productos_mas_vendidos": ["Producto 1", "Producto 3"], "inventario_bajo": ["Producto 6"]}', 1),
('Reporte de Usuarios', '2024-01-20', 'active', 'users', '{"usuarios_nuevos": 8, "usuarios_activos": 95, "usuarios_inactivos": 5}', 1),
('Estadísticas de Manuales', '2024-01-25', 'active', 'manuals', '{"descargas_totales": 234, "manual_mas_descargado": "Manual Toyota Corolla"}', 1),
('Eventos del Mes', '2024-01-30', 'active', 'events', '{"eventos_realizados": 12, "asistencia_promedio": 85, "eventos_cancelados": 1}', 1),
('Reporte de Sistema', '2024-01-28', 'pending', 'system', '{"uptime": "99.8%", "errores": 3, "usuarios_concurrentes_max": 45}', 1);

-- Insertar configuraciones del sistema
INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES
('site_name', 'Club del 1500', 'Nombre del sitio web', 1),
('max_file_size', '10485760', 'Tamaño máximo de archivo en bytes (10MB)', 1),
('allowed_file_types', 'pdf,doc,docx,txt', 'Tipos de archivo permitidos para manuales', 1),
('email_notifications_enabled', 'true', 'Habilitar notificaciones por email', 1),
('maintenance_mode', 'false', 'Modo de mantenimiento del sistema', 1),
('max_products_per_page', '24', 'Número máximo de productos por página', 1),
('calendar_view_default', 'month', 'Vista por defecto del calendario', 1),
('user_registration_enabled', 'true', 'Permitir registro de nuevos usuarios', 1);

-- Insertar logs de actividad iniciales
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'LOGIN', 'user', 1, '{"success": true, "method": "username_password"}'),
(1, 'CREATE', 'product', 1, '{"product_name": "Producto 1", "price": 99.00}'),
(1, 'CREATE', 'manual', 1, '{"title": "Manual del Usuario", "brand": "Toyota", "model": "Corolla"}'),
(1, 'CREATE', 'event', 1, '{"title": "Reunión de equipo", "date": "2024-02-15"}'),
(2, 'LOGIN', 'user', 2, '{"success": true, "method": "username_password"}'),
(2, 'VIEW', 'product', 1, '{"action": "view_product_details"}'),
(3, 'LOGIN', 'user', 3, '{"success": true, "method": "username_password"}'),
(3, 'DOWNLOAD', 'manual', 1, '{"manual_title": "Manual del Usuario", "file_size": 2621440}');
