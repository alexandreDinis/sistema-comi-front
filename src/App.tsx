import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Feature } from './types/features';
import { HomePage } from './pages/HomePage';
import { FaturamentoPage } from './pages/FaturamentoPage';
import { AdiantamentoPage } from './pages/AdiantamentoPage';
import { DespesaPage } from './pages/DespesaPage';
import { RelatorioPage } from './pages/RelatorioPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
// import { AdminPanel } from './pages/AdminPanel'; // Legacy Admin Module - Removed in V2
import { ClientesPage } from './pages/os/ClientesPage';
import { CatalogoPage } from './pages/os/CatalogoPage';
import { OrdemServicoListPage } from './pages/os/OSListPage';
import { OSDetailsPage } from './pages/os/OSDetailsPage';
import { MinhaComissaoPage } from './pages/MinhaComissaoPage';
import { PlatformDashboard } from './pages/platform/PlatformDashboard';
import { PlatformTenants } from './pages/platform/PlatformTenants';
import { PlatformPlans } from './pages/platform/PlatformPlans';
// import { ChangePasswordPage } from './pages/auth/ChangePasswordPage'; // Moved down
import { CompanySettings } from './pages/settings/CompanySettings';
import { TeamSettings } from './pages/settings/TeamSettings';
import { SubscriptionSettings } from './pages/settings/SubscriptionSettings';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { AppLayout } from './layouts/AppLayout';
import { PlatformLayout } from './layouts/PlatformLayout';
import './index.css';

// ✅ Configurar QueryClient com opções apropriadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache por 5 minutos (evita fetch excessivo)
      gcTime: 1000 * 60 * 10,
      retry: 0, // Não retry em dev/erro 500 para evitar loops
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Platform Routes (Blue Theme) */}
          <Route path="/platform" element={
            <ProtectedRoute role="ADMIN_PLATAFORMA">
              <PlatformLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<PlatformDashboard />} />
            <Route path="tenants" element={<PlatformTenants />} />
            <Route path="plans" element={<PlatformPlans />} />
            {/* TODO: Add 'companies' and 'plans' routes here as we build them */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* App Routes (Cyberpunk Theme) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={
              <ProtectedRoute requiredFeature={Feature.DASHBOARD_VIEW}>
                <HomePage />
              </ProtectedRoute>
            } />

            {/* Force Password Change Route */}
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            } />

            {/* Settings / Company Admin */}
            <Route path="/settings" element={
              <ProtectedRoute requiredFeature={Feature.ADMIN_CONFIG}>
                <CompanySettings />
              </ProtectedRoute>
            } />
            <Route path="/settings/team" element={
              <ProtectedRoute requiredFeature={Feature.ADMIN_CONFIG}>
                <TeamSettings />
              </ProtectedRoute>
            } />
            <Route path="/settings/subscription" element={
              <ProtectedRoute requiredFeature={Feature.ADMIN_CONFIG}>
                <SubscriptionSettings />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={<Navigate to="/settings" />} />

            {/* Financeiro */}
            <Route path="/faturamento" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <FaturamentoPage />
              </ProtectedRoute>
            } />
            <Route path="/adiantamento" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <AdiantamentoPage />
              </ProtectedRoute>
            } />
            <Route path="/despesa" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <DespesaPage />
              </ProtectedRoute>
            } />

            {/* OS Module */}
            <Route path="/clientes" element={
              <ProtectedRoute requiredFeature={Feature.CLIENTE_READ}>
                <ClientesPage />
              </ProtectedRoute>
            } />
            <Route path="/catalogo" element={
              <ProtectedRoute requiredFeature={Feature.PRODUTO_READ}>
                <CatalogoPage />
              </ProtectedRoute>
            } />
            <Route path="/os" element={
              <ProtectedRoute requiredFeature={Feature.OS_READ}>
                <OrdemServicoListPage />
              </ProtectedRoute>
            } />
            <Route path="/os/:id" element={
              <ProtectedRoute requiredFeature={Feature.OS_READ}>
                <OSDetailsPage />
              </ProtectedRoute>
            } />

            <Route path="/relatorio" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <RelatorioPage />
              </ProtectedRoute>
            } />

            <Route path="/minha-comissao" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_COMISSAO_VIEW}>
                <MinhaComissaoPage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
