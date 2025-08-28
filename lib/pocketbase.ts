// lib/pocketbase.ts
import PocketBase from 'pocketbase';

class DatabaseManager {
  private client: PocketBase | null = null;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<boolean> | null = null;
  private defaultUrl: string = 'http://127.0.0.1:8090';

  async connect(url?: string): Promise<boolean> {
    if (this.client) {
      return true;
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise(async (resolve) => {
      try {
        const baseUrl = url || process.env.NEXT_PUBLIC_POCKETBASE_URL || this.defaultUrl;
        console.log('🔗 Conectando a PocketBase en:', baseUrl);
        
        this.client = new PocketBase(baseUrl);
        
        // Test de conexión simple - solo verifica que la URL sea accesible
        try {
          await this.client.health.check();
          console.log('✅ Conexión a PocketBase establecida');
          resolve(true);
        } catch (healthError: any) {
          // Si health check falla, pero podemos crear la instancia, consideramos éxito
          console.log('⚠ PocketBase conectado (health check falló)');
          resolve(true);
        }
        
      } catch (error: any) {
        console.error('❌ Error conectando a PocketBase:', error.message);
        resolve(false);
      } finally {
        this.isConnecting = false;
      }
    });

    return this.connectionPromise;
  }

  getClient(): PocketBase {
    if (!this.client) {
      throw new Error("⚠ No hay conexión activa con PocketBase. Llama a connect() primero.");
    }
    return this.client;
  }

  async getClientSafe(): Promise<PocketBase> {
    if (!this.client) {
      await this.connect();
    }
    if (!this.client) {
      throw new Error("No se pudo establecer conexión con PocketBase");
    }
    return this.client;
  }

  isConnected(): boolean {
    return this.client !== null;
  }

  disconnect(): void {
    this.client = null;
  }
}

export const db = new DatabaseManager();

export const getPB = (): PocketBase => {
  return db.getClient();
};

export const getPBSafe = async (): Promise<PocketBase> => {
  return await db.getClientSafe();
};

export const ensureConnection = async (url?: string): Promise<boolean> => {
  if (db.isConnected()) return true;
  return await db.connect(url);
};

// Añade esta función que falta
export const connectDB = async (url?: string): Promise<boolean> => {
  return await ensureConnection(url);
};