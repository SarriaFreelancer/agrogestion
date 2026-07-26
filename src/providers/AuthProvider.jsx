import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agro_currentUser');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('agro_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('agro_currentUser');
    }
  }, [currentUser]);

  const hasPermission = (permissionKey) => {
    if (!currentUser) return false;
    if (currentUser.rol === 'Super Admin') return true;
    
    // Asumiremos que el contexto global le pasará las categorías, pero
    // por ahora podemos hacer un proxy a través de AgroContext o guardar las categorias en local storage.
    // Para no romper nada, hasPermission puede simplemente verificar currentUser.rol por ahora
    return true; // Simplificado momentáneamente hasta integrar con DataProvider
  };

  const loginUser = async ({ email, password }) => {
    // Simulando login
    const normalized = {
      id: `USR-${Date.now()}`,
      code: `USR-${Date.now()}`,
      nombres: email.split('@')[0],
      apellidos: '',
      correo: email,
      rol: email.includes('admin') ? 'Super Admin' : 'Usuario General',
      modulos: email.includes('admin') ? ['ALL'] : ['Dashboard']
    };
    setCurrentUser(normalized);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('agro_currentUser');
    localStorage.removeItem('agro_currentClient');
    window.location.href = '/'; 
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, hasPermission, loginUser, logoutUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
