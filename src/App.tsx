import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Header } from './components/common/Header';
import { HomePage } from './pages/HomePage';
import { FaturamentoPage } from './pages/FaturamentoPage';
import { AdiantamentoPage } from './pages/AdiantamentoPage';
import { ComissaoPage } from './pages/ComissaoPage';
import { NotFoundPage } from './pages/NotFoundPage';
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
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/faturamento" element={<FaturamentoPage />} />
              <Route path="/adiantamento" element={<AdiantamentoPage />} />
              <Route path="/comissao" element={<ComissaoPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
