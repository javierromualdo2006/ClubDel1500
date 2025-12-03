"use client";

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { UsersAPI, type RegisterData, type User } from "@/lib/api/users";
import { ensureConnection } from "@/lib/pocketbase";

export interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  isAdmin: () => boolean;
  loading: boolean;
  connectionStatus: 'connecting' | 'connected' | 'error';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const isMountedRef = useRef(true);
  const initializationRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    const initialize = async () => {
      if (initializationRef.current) {
        return initializationRef.current;
      }
      
      initializationRef.current = (async () => {
        try {
          console.log("🔗 Inicializando AuthContext...");
          setConnectionStatus('connecting');

          const connected = await ensureConnection("http://127.0.0.1:8090");
          
          if (!connected) {
            // En entorno de tests podemos seguir usando sesiones mockeadas desde localStorage
            console.error("❌ No se pudo conectar a PocketBase (continuando con posible sesión local)");
            setConnectionStatus('error');
          } else {
            setConnectionStatus('connected');
            console.log("✅ Conectado a PocketBase");
          }

          const user = await UsersAPI.getCurrentUser();
          if (isMountedRef.current && user) {
            setCurrentUser(user);
            console.log("👤 Usuario actual:", user.email);
            
            try {
              const allUsers = await UsersAPI.getAll();
              if (isMountedRef.current) {
                setUsers(allUsers);
                console.log(`📊 ${allUsers.length} usuarios cargados`);
              }
            } catch (error) {
              console.log("⚠ No se pudieron cargar usuarios (posiblemente no autorizado)");
            }
          } else {
            console.log("🔍 No hay sesión activa");
          }
          
        } catch (error: any) {
          if (error?.isAbort || error?.message?.includes('autocancelled')) {
            console.log("ℹ️ Solicitud cancelada automáticamente (esto es normal)");
            return;
          }
          
          console.error("⚠ Error inicializando AuthContext:", error);
          setConnectionStatus('error');
        } finally {
          if (isMountedRef.current) {
            setLoading(false);
            console.log("✅ AuthContext inicializado");
          }
          initializationRef.current = null;
        }
      })();
      
      return initializationRef.current;
    };
    
    initialize();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshUsers = async () => {
    try {
      if (currentUser) {
        const allUsers = await UsersAPI.getAll();
        setUsers(allUsers);
      }
    } catch (error: any) {
      if (error?.isAbort || error?.message?.includes('autocancelled')) {
        return;
      }
      console.error("⚠ Error refrescando usuarios:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Intentando login con:", email);
      const result = await UsersAPI.login({ email, password });
      
      if (result.success && result.user) {
        console.log("✅ Login exitoso para:", result.user.email);
        setCurrentUser(result.user);
        await refreshUsers();
        return true;
      }
      
      console.log("❌ Login falló:", result.error || "Credenciales incorrectas");
      return false;
      
    } catch (error: any) {
      if (error?.isAbort || error?.message?.includes('autocancelled')) {
        return false;
      }
      console.error("❌ Error en login:", error);
      return false;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      console.log("📝 Registrando usuario:", userData.email);
      console.log("📦 Datos enviados:", userData);
      
      // Asegurarse de que los nombres de campos coincidan con lo que espera PocketBase
      const registrationData = {
        email: userData.email,
        password: userData.password,
        passwordConfirm: userData.passwordConfirm,
        name: userData.name,
        // Agregar otros campos requeridos por tu colección de usuarios
      };
      
      const result = await UsersAPI.register(registrationData);
      if (result.success && result.user) {
        console.log("✅ Registro exitoso");
        setCurrentUser(result.user);
        
        try {
          await refreshUsers();
        } catch (error) {
          console.log("⚠ No se pudieron cargar usuarios después del registro");
        }
        
        return true;
      }
      
      console.log("❌ Registro falló:", result.error);
      return false;
      
    } catch (error: any) {
      if (error?.isAbort || error?.message?.includes('autocancelled')) {
        return false;
      }
      
      // Mostrar errores de validación de forma más clara
      if (error?.status === 400 && error?.data?.data) {
        const validationErrors = error.data.data;
        console.error("❌ Errores de validación del servidor:", validationErrors);
        
        Object.entries(validationErrors).forEach(([field, errorDetail]: [string, any]) => {
          console.error(`❌ ${field}: ${errorDetail.message}`);
        });
      } else {
        console.error("❌ Error completo en registro:", error);
      }
      
      return false;
    }
  };

  const logout = async () => {
    try {
      await UsersAPI.logout();
      setCurrentUser(null);
      setUsers([]);
      console.log("👋 Sesión cerrada exitosamente");
    } catch (error: any) {
      if (error?.isAbort || error?.message?.includes('autocancelled')) {
        return;
      }
      console.error("⚠ Error en logout:", error);
    }
  };

  const isAdmin = () => currentUser?.role === "admin";

  // Función de validación de datos de registro
  const validateRegistrationData = (userData: RegisterData): string[] => {
    const errors: string[] = [];
    
    // Validar email
    if (!userData.email) {
      errors.push("El email es requerido");
    } else if (!isValidEmail(userData.email)) {
      errors.push("El email debe ser una dirección válida");
    }
    
    // Validar contraseña
    if (!userData.password) {
      errors.push("La contraseña es requerida");
    } else if (userData.password.length < 6) {
      errors.push("La contraseña debe tener al menos 6 caracteres");
    }
    
    // Validar confirmación de contraseña
    if (!userData.passwordConfirm) {
      errors.push("La confirmación de contraseña es requerida");
    } else if (userData.passwordConfirm !== userData.password) {
      errors.push("Las contraseñas no coinciden");
    }
    
    // Validar campos requeridos
    if (!userData.name) {
      errors.push("El nombre es requerido");
    }
    
    return errors;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        register,
        isAdmin,
        loading,
        connectionStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

// Componente de formulario de registro mejorado
export function RegistrationForm() {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Limpiar errores del servidor al cambiar cualquier campo
    if (serverErrors.length > 0) {
      setServerErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Debe ser un email válido';
    }
    
    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    
    // Validar confirmación
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Confirma tu contraseña';
    } else if (formData.passwordConfirm !== formData.password) {
      newErrors.passwordConfirm = 'Las contraseñas no coinciden';
    }
    
    // Validar nombre
    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors([]);
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const success = await register(formData);
      if (success) {
        alert('¡Registro exitoso!');
        setFormData({ email: '', password: '', passwordConfirm: '', name: '' });
      } else {
        setServerErrors(['Error en el registro. Revisa los datos.']);
      }
    } catch (error: any) {
      if (error?.status === 400 && error?.data?.data) {
        // Mostrar errores del servidor
        const serverErrorMessages = Object.values(error.data.data).map(
          (err: any) => err.message
        );
        setServerErrors(serverErrorMessages);
      } else {
        setServerErrors(['Error inesperado en el registro']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>
      
      {/* Mostrar errores del servidor */}
      {serverErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold mb-2">Errores:</h3>
          <ul className="list-disc list-inside">
            {serverErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre completo *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tu nombre completo"
            required
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="tu@email.com"
            required
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contraseña *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirmar contraseña *</label>
          <input
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Repite tu contraseña"
            required
          />
          {errors.passwordConfirm && (
            <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
}