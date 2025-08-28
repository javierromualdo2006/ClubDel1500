// components/database-connection-handler.tsx
"use client";

import { useEffect, useState } from 'react';
import { ensureConnection } from '@/lib/pocketbase';

interface DatabaseConnectionHandlerProps {
  children: React.ReactNode;
  onConnectionChange?: (status: 'connected' | 'error' | 'connecting') => void;
}

// Asegúrate de exportar como named export
export function DatabaseConnectionHandler({ 
  children, 
  onConnectionChange 
}: DatabaseConnectionHandlerProps) {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'connecting'>('connecting');

  useEffect(() => {
    const initDB = async () => {
      try {
        onConnectionChange?.('connecting');
        setConnectionStatus('connecting');
        
        console.log('🔗 Iniciando conexión a la base de datos...');
        
        const connected = await ensureConnection("http://127.0.0.1:8090");
        
        if (connected) {
          console.log('✅ Conexión a la base de datos establecida');
          onConnectionChange?.('connected');
          setConnectionStatus('connected');
        } else {
          console.error('❌ No se pudo conectar a la base de datos');
          onConnectionChange?.('error');
          setConnectionStatus('error');
        }
      } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error);
        onConnectionChange?.('error');
        setConnectionStatus('error');
      }
    };

    initDB();
  }, [onConnectionChange]);

  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="font-bold text-lg mb-2">Error de conexión</h2>
            <p>No se pudo conectar a la base de datos. Por favor, verifica que el servidor esté ejecutándose.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando a la base de datos...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}