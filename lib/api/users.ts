// lib/api/users.ts
import { getPB, ensureConnection } from '@/lib/pocketbase';

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'user';
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
  role?: 'admin' | 'user';
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
      role: record.role || record.rule || 'user',
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
  
      // Datos mínimos y esenciales - enviar AMBOS campos
      const dataToSend: any = {
        email: userData.email,
        password: userData.password,
        passwordConfirm: passwordConfirm, // ← Campo 1
        confirmPassword: passwordConfirm, // ← Campo 2 (añadir este)
        emailVisibility: true,
        verified: false
      };
  
      // Solo añadir campos adicionales si tienen valor
      if (userData.name) dataToSend.name = userData.name;
      if (userData.username) dataToSend.username = userData.username;
      if (userData.role) dataToSend.role = userData.role;
  
      console.log("📤 Enviando datos a PocketBase:", { 
        ...dataToSend, 
        password: '***', 
        passwordConfirm: '***',
        confirmPassword: '***'
      });
  
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

  static async debugRegistration(userData: RegisterData) {
    try {
      await this.ensureConnection();
      const pb = getPB();
      
      console.log("🐛 DEBUG: Probando registro paso a paso");
      
      // Asegurar ambos campos
      const passwordConfirm = userData.passwordConfirm || userData.password;
  
      // Prueba 1: Datos mínimos
      const testData1 = {
        email: userData.email,
        password: userData.password,
        passwordConfirm: passwordConfirm, // ← Campo 1
        confirmPassword: passwordConfirm, // ← Campo 2 (añadir este)
        emailVisibility: true
      };
      
      console.log("🐛 DEBUG: Probando con datos mínimos", testData1);
      try {
        const result1 = await pb.collection('users').create(testData1);
        console.log("✅ DEBUG: Registro mínimo exitoso");
        return result1;
      } catch (error1: any) {
        console.error("❌ DEBUG: Error con datos mínimos", error1.data);
        
        // Prueba 2: Con nombre
        const testData2 = { ...testData1, name: userData.name || "Test User" };
        console.log("🐛 DEBUG: Probando con nombre", testData2);
        try {
          const result2 = await pb.collection('users').create(testData2);
          console.log("✅ DEBUG: Registro con nombre exitoso");
          return result2;
        } catch (error2: any) {
          console.error("❌ DEBUG: Error con nombre", error2.data);
          throw error2;
        }
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
        passwordConfirm: 'testpassword123', // ← Campo 1
        confirmPassword: 'testpassword123', // ← Campo 2 (añadir este)
        emailVisibility: true,
        name: 'Test User'
      };
      
      console.log("🧪 Probando registro simple:", { 
        ...testData, 
        password: '***', 
        passwordConfirm: '***',
        confirmPassword: '***'
      });
      
      try {
        const result = await pb.collection('users').create(testData);
        console.log("✅ Prueba de registro exitosa");
        return { success: true };
      } catch (error: any) {
        // LOGGING SUPER DETALLADO
        console.error("=".repeat(80));
        console.error("❌❌❌ ERROR COMPLETO DE REGISTRO ❌❌❌");
        console.error("=".repeat(80));
        
        console.error("📍 Error object:", error);
        console.error("📍 Error type:", typeof error);
        
        if (error.data) {
          console.error("📋 error.data:", error.data);
          if (error.data.data) {
            console.error("🔍 Validation errors:", error.data.data);
            Object.entries(error.data.data).forEach(([field, errorDetail]: [string, any]) => {
              console.error(`   ${field}:`, errorDetail);
            });
          }
        }
        
        console.error("=".repeat(80));
        
        return {
          success: false,
          error: "Error completo en consola"
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
}
if (typeof window !== 'undefined') {
  (window as any).UsersAPI = UsersAPI;
}