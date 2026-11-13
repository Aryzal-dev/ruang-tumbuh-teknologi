import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import PublicGalleryView from './views/PublicGalleryView';
import DashboardView from './views/DashboardView';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();

  // URL Path Routing
  const [currentPath, setCurrentPath] = useState(() =>
    window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/'
  );

  const navigate = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path.toLowerCase().replace(/\/+$/, '') || '/');
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">Memuat PromptVault...</p>
      </div>
    );
  }

  // 1. Dedicated Login Route (/login or /admin/login)
  if (currentPath === '/login' || currentPath === '/admin/login') {
    if (user) {
      navigate('/dashboard');
      return null;
    }
    return (
      <LoginPage
        onLoginSuccess={() => navigate('/dashboard')}
        onBack={() => navigate('/')}
      />
    );
  }

  // 2. Dedicated Dashboard Route (/dashboard)
  if (currentPath.startsWith('/dashboard')) {
    if (!user) {
      // If unauthenticated, redirect to dedicated login
      navigate('/login');
      return null;
    }
    return <DashboardView onNavigate={navigate} />;
  }

  // 3. Public Showcase Website (/) - NO Dashboard, NO Sidebar
  return <PublicGalleryView onNavigate={navigate} />;
}
