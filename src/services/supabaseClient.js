// src/services/supabaseClient.js

import { createClient } from '@supabase/supabase-js';
// 💡 Importamos las variables de entorno inyectadas por react-native-dotenv
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'; 

// Usamos las variables importadas
const supabaseUrl = SUPABASE_URL; 
const supabaseAnonKey = SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    // 💡 Opcional: Configuración para manejar almacenamiento en React Native
    auth: {
        storage: require('@react-native-async-storage/async-storage').default,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Deshabilitar ya que no estamos en un navegador web
    },
});