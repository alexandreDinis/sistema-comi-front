import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Header } from './components/common/Header';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { FaturamentoPage } from './pages/FaturamentoPage';
import { AdiantamentoPage } from './pages/AdiantamentoPage';
import { DespesaPage } from './pages/DespesaPage';
import { RelatorioPage } from './pages/RelatorioPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPanel } from './pages/AdminPanel';
import './index.css';

// ✅ Configurar QueryClient com opções apropriadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Dados sempre considerados "stale"
      gcTime: 1000 * 60 * 5, // Cache por 5 minutos
      retry: 1,
      refetchOnWindowFocus: false, // Não refetch ao focar na janela
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-cyber-bg relative selection:bg-cyber-gold/30 selection:text-white">
          {/* Experimental Global HUD Overlay */}
          <div className="fixed inset-0 pointer-events-none z-60 border-20 border-black/5">
            <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyber-gold/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-cyber-gold/10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-cyber-gold/10"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyber-gold/10"></div>
          </div>

          <Header />
          <main className="container mx-auto py-8 relative">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={
                <ProtectedRoute role="ADMIN">
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/faturamento" element={
                <ProtectedRoute role="ADMIN">
                  <FaturamentoPage />
                </ProtectedRoute>
              } />
              <Route path="/adiantamento" element={
                <ProtectedRoute role="ADMIN">
                  <AdiantamentoPage />
                </ProtectedRoute>
              } />
              <Route path="/despesa" element={
                <ProtectedRoute role="ADMIN">
                  <DespesaPage />
                </ProtectedRoute>
              } />
              <Route path="/relatorio" element={
                <ProtectedRoute role="ADMIN">
                  <RelatorioPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
