// lib/api/users.ts
import { getPB, ensureConnection } from '@/lib/pocketbase';

export interface User {
  isActive: boolean | undefined;
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
  role: string; // ← Hacer más flexible
  verified: boolean;
  created: string;
  updated: string;
  emailVisibility?: boolean;
  feature?: any;
  archive?: boolean;
  emailNotifications?: boolean;
  tokenRecy?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  passwordConfirm: string;
  username?: string;
  name?: string;
  role?: string;
  tokenizer?: string;
  emailVisibility?: boolean;
  tokenRecy?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class UsersAPI {
  private static async ensureConnection(): Promise<void> {
    try {
      await ensureConnection("http://127.0.0.1:8090");
    } catch (error) {
      console.error('Error conectando a PocketBase:', error);
      throw new Error('No se pudo conectar a la base de datos');
    }
  }

  private static mapUser(record: any): User {
    return {
      id: record.id,
      email: record.email,
      username: record.username,
      name: record.name,
      avatar: record.avatar,
      role: record.role || 'user',
      verified: record.verified || false,
      created: record.created,
      updated: record.updated,
      emailVisibility: record.emailVisibility,
      feature: record.feature,
      archive: record.archive,
      emailNotifications: record.emailNotifications,
      tokenRecy: record.tokenRecy
    };
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      // 1) Primero intentamos leer del almacenamiento local (útil para tests con auth mockeada)
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem('pb_auth');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.model) {
              return this.mapUser(parsed.model);
            }
          }
        } catch (e) {
          console.warn('⚠ No se pudo leer pb_auth desde localStorage:', e);
        }
      }

      // 2) Fallback al flujo normal con PocketBase
      await this.ensureConnection();
      const pb = getPB();
      
      if (!pb.authStore.isValid || !pb.authStore.model) {
        return null;
      }
      
      const user = pb.authStore.model;
      return this.mapUser(user);
      
    } catch (error: any) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  static async login(credentials: LoginData): Promise<LoginResult> {
    try {
      console.log('🔐 Intentando autenticar:', credentials.email);
      await this.ensureConnection();
      const pb = getPB();
      
      const authData = await pb.collection('users').authWithPassword(
        credentials.email,
        credentials.password
      );
      
      console.log('✅ Autenticación exitosa');
      
      return {
        success: true,
        user: this.mapUser(authData.record)
      };
      
    } catch (error: any) {
      console.error('❌ Error en autenticación:', error);
      
      return {
        success: false,
        error: error.data?.message || 'Error de autenticación'
      };
    }
  }

  static async getAll(options?: { signal?: AbortSignal }): Promise<User[]> {
    try {
      await this.ensureConnection();
      const pb = getPB();
      
      if (!pb.authStore.isValid) {
        console.log('⚠ No autenticado, no se pueden obtener usuarios');
        return [];
      }
      
      const users = await pb.collection('users').getFullList({
        signal: options?.signal,
        requestKey: 'get_all_users'
      });
      return users.map(user => this.mapUser(user));
    } catch (error: any) {
      if (error.status === 401) {
        console.log('⚠ No autorizado para obtener usuarios');
        return [];
      }
      console.error("Error obteniendo usuarios:", error);
      return [];
    }
  }

  static async register(userData: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      await this.ensureConnection();
      const pb = getPB();
      
      console.log("🔧 Iniciando proceso de registro...");
  
      // Asegurarnos de que ambos campos tengan valores
      const passwordConfirm = userData.passwordConfirm || userData.password;
  
      // DEBUG: Verificar qué valores estamos recibiendo
      console.log("🐛 DEBUG - Datos recibidos:", {
        email: userData.email,
        hasName: !!userData.name,
        hasUsername: !!userData.username,
        hasRole: !!userData.role,
        roleValue: userData.role
      });
  
      // PRUEBA: Diferentes enfoques para el campo role
      let roleValue = "user";
      
      // Si viene un role específico, usarlo
      if (userData.role && userData.role.trim() !== "") {
        roleValue = userData.role;
      }
      
      // Si el role está vacío pero tenemos username, usar eso
      if (!roleValue || roleValue.trim() === "") {
        roleValue = userData.username || "user";
      }

      // Asegurar que name no esté vacío
      let nameValue = userData.name || userData.username || `User_${Date.now()}`;
      if (nameValue.trim() === "") {
        nameValue = `User_${Date.now()}`;
      }

      // Datos mínimos y esenciales
      const dataToSend: any = {
        email: userData.email,
        password: userData.password,
        passwordConfirm: passwordConfirm,
        emailVisibility: true,
        verified: false,
        name: nameValue,
        role: roleValue
      };
  
      // Solo añadir campos adicionales si tienen valor
      if (userData.username && userData.username.trim() !== "") {
        dataToSend.username = userData.username;
      }
  
      console.log("📤 Enviando datos a PocketBase:", { 
        ...dataToSend, 
        password: '***', 
        passwordConfirm: '***'
      });

      // DEBUG EXTRA: Verificar la estructura final
      console.log("🐛 DEBUG - Estructura final:", JSON.stringify(dataToSend, null, 2));
  
      try {
        const createdUser = await pb.collection('users').create(dataToSend);
        console.log("✅ Registro exitoso");
        return { 
          success: true, 
          user: this.mapUser(createdUser) 
        };
        
      } catch (error: any) {
        // LOGGING MEJORADO - Buscar errores en cualquier propiedad
        console.error("🔍 BUSCANDO ERRORES EN TODAS LAS PROPIEDADES:");
        
        // Recorrer todas las propiedades del error
        for (const key in error) {
          if (error.hasOwnProperty(key)) {
            console.error(`   ${key}:`, error[key]);
            
            // Si es un objeto, mostrar sus propiedades también
            if (typeof error[key] === 'object' && error[key] !== null) {
              for (const subKey in error[key]) {
                if (error[key].hasOwnProperty(subKey)) {
                  console.error(`     ${subKey}:`, error[key][subKey]);
                }
              }
            }
          }
        }
        
        if (error.data?.data) {
          const errors: string[] = [];
          Object.entries(error.data.data).forEach(([field, errorDetail]: [string, any]) => {
            const errorMsg = `${field}: ${errorDetail.message} (código: ${errorDetail.code})`;
            console.error("   ", errorMsg);
            errors.push(errorMsg);
          });
          
          return {
            success: false,
            error: "Errores de validación:\n" + errors.join("\n")
          };
        }
        
        return {
          success: false,
          error: error.data?.message || error.message || "Error desconocido en el registro"
        };
      }
      
    } catch (error: any) {
      console.error("💥 Error inesperado en registro:", error);
      return {
        success: false,
        error: "Error de conexión: " + error.message
      };
    }
  }

  // NUEVO MÉTODO: Probar diferentes valores para role
  static async testRoleValues(): Promise<void> {
    try {
      await this.ensureConnection();
      const pb = getPB();
      
      const testValues = [
        "user",
        "admin", 
        "member",
        "client",
        "customer",
        "basic",
        "standard",
        "default"
      ];
      
      console.log("🧪 Probando diferentes valores para role:");
      
      for (const roleValue of testValues) {
        const testData = {
          email: `test_${Date.now()}_${roleValue}@example.com`,
          password: 'testpassword123',
          passwordConfirm: 'testpassword123',
          emailVisibility: true,
          name: `Test ${roleValue}`,
          role: roleValue
        };
        
        console.log(`   Probando role: "${roleValue}"`);
        
        try {
          const result = await pb.collection('users').create(testData);
          console.log(`   ✅ ÉXITO con role: "${roleValue}"`);
          // Eliminar el usuario de prueba
          await pb.collection('users').delete(result.id);
          break;
        } catch (error: any) {
          console.log(`   ❌ FALLÓ con role: "${roleValue}" - ${error.data?.data?.role?.message || error.message}`);
        }
      }
      
    } catch (error) {
      console.error("❌ Error en testRoleValues:", error);
    }
  }

  // NUEVO MÉTODO: Verificar usuarios existentes para ver qué roles tienen
  static async checkExistingUsers(): Promise<void> {
    try {
      await this.ensureConnection();
      const pb = getPB();
      
      // Obtener algunos usuarios existentes (si los hay)
      const users = await pb.collection('users').getList(1, 5);
      
      console.log("🔍 Usuarios existentes y sus roles:");
      users.items.forEach(user => {
        console.log(`   - ${user.email}: role="${user.role}", name="${user.name}"`);
      });
      
    } catch (error) {
      console.error("❌ No se pudieron obtener usuarios existentes:", error);
    }
  }

  static async debugRegistration(userData: RegisterData) {
    try {
      await this.ensureConnection();
      const pb = getPB();
      
      console.log("🐛 DEBUG: Probando registro paso a paso");
      
      // Asegurar ambos campos
      const passwordConfirm = userData.passwordConfirm || userData.password;

      // Prueba con diferentes enfoques
      const testData = {
        email: userData.email,
        password: userData.password,
        passwordConfirm: passwordConfirm,
        emailVisibility: true,
        name: userData.name || userData.username || "Test User",
        role: "user" // ← Valor fijo para probar
      };
      
      console.log("🐛 DEBUG: Probando con datos:", testData);
      try {
        const result = await pb.collection('users').create(testData);
        console.log("✅ DEBUG: Registro exitoso");
        return result;
      } catch (error: any) {
        console.error("❌ DEBUG: Error completo:", error);
        throw error;
      }
      
    } catch (error: any) {
      console.error("🐛 DEBUG: Error completo en debug", error);
      throw error;
    }
  }

  static async logout(): Promise<{ success: boolean }> {
    try {
      await this.ensureConnection();
      const pb = getPB();
      pb.authStore.clear();
      return { success: true };
    } catch (error) {
      console.error("Error en logout:", error);
      return { success: false };
    }
  }

  static async checkConnection(): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      // Prueba de conexión simple que no requiere autenticación
      const pb = getPB();
      await pb.health.check();
      
      return true;
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      return false;
    }
  }

  static async testSimpleRegistration(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.ensureConnection();
      const pb = getPB();
      
      const testData = {
        email: `test_${Date.now()}@example.com`,
        password: 'testpassword123',
        passwordConfirm: 'testpassword123',
        emailVisibility: true,
        name: 'Test User',
        role: 'user'
      };
      
      console.log("🧪 Probando registro simple:", { 
        ...testData, 
        password: '***', 
        passwordConfirm: '***'
      });
      
      try {
        const result = await pb.collection('users').create(testData);
        console.log("✅ Prueba de registro exitosa");
        
        // Limpiar el usuario de prueba
        await pb.collection('users').delete(result.id);
        
        return { success: true };
      } catch (error: any) {
        console.error("❌ Error en prueba de registro:", error);
        return {
          success: false,
          error: error.data?.message || "Error en registro de prueba"
        };
      }
      
    } catch (error: any) {
      console.error("💥 Error inesperado en testSimpleRegistration:", error);
      return {
        success: false,
        error: "Error inesperado: " + error.message
      };
    }
  }

  // NUEVO MÉTODO: Verificar la estructura de la colección
  static async checkCollectionStructure(): Promise<void> {
    try {
      await this.ensureConnection();
      const pb = getPB();
      
      console.log("🔍 Verificando estructura de la colección users...");
      
      // Intentar obtener información de la colección
      try {
        const collections = await pb.collections.getFullList();
        const usersCollection = collections.find(col => col.name === 'users');
        
        if (usersCollection) {
          console.log("📋 Campos de la colección users:");
          usersCollection.schema.forEach((field: { name: any; type: any; required: any; system: any; options: any; }) => {
            console.log(`   - ${field.name}: ${field.type} ${field.required ? '(REQUERIDO)' : ''} ${field.system ? '(SISTEMA)' : ''}`);
            if (field.options) {
              console.log(`     Opciones:`, field.options);
            }
          });
        } else {
          console.log("❌ No se encontró la colección users");
        }
      } catch (error) {
        console.log("⚠ No se pudo obtener información detallada de la colección (probablemente por permisos)");
      }
      
    } catch (error) {
      console.error("❌ No se pudo verificar la estructura de la colección:", error);
    }
  }
}

if (typeof window !== 'undefined') {
  (window as any).UsersAPI = UsersAPI;
}