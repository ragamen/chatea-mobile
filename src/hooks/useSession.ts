import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient'; 
import { Session, User } from '@supabase/supabase-js'; 

// Define el tipo de tu perfil (ajusta según tu tabla 'profiles')
interface UserProfile {
  id: string;
  email: string;
  username: string | null; // El campo que determina si el setup está completo
  // Puedes añadir más campos como avatar_url, etc.
}

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Obtiene la sesión y se suscribe a los cambios (Login/Logout)
  useEffect(() => {
    // Escucha el evento de autenticación de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        // Si hay una sesión, cargamos el perfil
        if (newSession?.user) {
          fetchProfile(newSession.user);
        } else {
          setUserProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Intenta obtener la sesión inicial
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        setSession(initialSession);
        if (initialSession?.user) {
            fetchProfile(initialSession.user);
        } else {
            setIsLoading(false);
        }
    });

    // Limpieza al desmontar
    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Carga el perfil del usuario autenticado
  const fetchProfile = async (user: User) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select(`id, email, username`) // Asegúrate de que los campos coincidan
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = No se encontró la fila (puede pasar en un registro nuevo)
      console.error('Error al cargar perfil:', error);
      setUserProfile({ id: user.id, email: user.email || '', username: null }); // Si hay error, asumimos que debe hacer setup
    } else if (data) {
      setUserProfile(data as UserProfile);
    } else {
      // Si no hay datos (registro nuevo), forzamos el setup
      setUserProfile({ id: user.id, email: user.email || '', username: null });
    }
    
    setIsLoading(false);
  };
  
  // Función para actualizar el perfil desde otras pantallas (ej. UsernameSetupScreen)
  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  return { 
    session, 
    userProfile, 
    isLoading, 
    updateProfile 
  };
};