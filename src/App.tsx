import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Feature } from './types/features';
import { HomePage } from './pages/HomePage';
import { FaturamentoPage } from './pages/FaturamentoPage';
import { DespesaPage } from './pages/DespesaPage';
import { RelatoriosHubPage } from './pages/RelatoriosHubPage';
import { RelatorioFinanceiroPage } from './pages/RelatorioFinanceiroPage';
import { RelatorioAnualPage } from './pages/RelatorioAnualPage';
import { RankingClientesPage } from './pages/relatorios/RankingClientesPage';
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
import { PlatformLicensePlans } from './pages/platform/PlatformLicensePlans';
import { PlatformResellers } from './pages/platform/PlatformResellers';
import { PlatformOwnerDashboard } from './pages/platform/PlatformOwnerDashboard';
import { PlatformChangePasswordPage } from './pages/platform/PlatformChangePasswordPage';
import { PlatformRiskPage } from './pages/platform/PlatformRiskPage';
// import { ChangePasswordPage } from './pages/auth/ChangePasswordPage'; // Moved down
import { CompanySettings } from './pages/settings/CompanySettings';
import { TeamSettings } from './pages/settings/TeamSettings';
import { SubscriptionSettings } from './pages/settings/SubscriptionSettings';
import { ComissaoRulesPage } from './pages/settings/ComissaoRulesPage';
import { GestaoComissoesPage } from './pages/settings/GestaoComissoesPage';
import TributacaoPage from './pages/admin/TributacaoPage';
import PrestadoresPage from './pages/admin/PrestadoresPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import FinanceiroDashboard from './pages/financeiro/FinanceiroDashboard';
import ContasPagarPage from './pages/financeiro/ContasPagarPage';
import ContasReceberPage from './pages/financeiro/ContasReceberPage';
import CartoesPage from './pages/financeiro/CartoesPage';
import FaturasPage from './pages/financeiro/FaturasPage';
import DistribuicaoLucrosPage from './pages/financeiro/DistribuicaoLucrosPage';
import FluxoCaixaPage from './pages/financeiro/FluxoCaixaPage';
import ReceitaCaixaPage from './pages/relatorios/ReceitaCaixaPage';
import ImpostoPagoPage from './pages/financeiro/ImpostoPagoPage';
import { ResponsiveLayout } from './layouts/ResponsiveLayout';
import { PlatformLayout } from './layouts/PlatformLayout';
import './index.css';

import { queryClient } from './lib/react-query';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Platform Routes (Blue Theme) */}
          <Route path="/platform" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_PLATAFORMA', 'ADMIN_LICENCA', 'REVENDEDOR']}>
              <PlatformLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<PlatformDashboard />} />
            <Route path="tenants" element={<PlatformTenants />} />
            <Route path="risk" element={<PlatformRiskPage />} />
            <Route path="plans" element={<PlatformPlans />} />
            <Route path="license-plans" element={<PlatformLicensePlans />} />
            <Route path="resellers" element={<PlatformResellers />} />
            <Route path="owner" element={<PlatformOwnerDashboard />} />
            <Route path="change-password" element={<PlatformChangePasswordPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* App Routes (Cyberpunk Theme) */}
          <Route element={<ResponsiveLayout />}>
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
            <Route path="/settings/tributacao" element={
              <ProtectedRoute requiredFeature={Feature.ADMIN_CONFIG}>
                <TributacaoPage />
              </ProtectedRoute>
            } />
            <Route path="/settings/comissao" element={
              <ProtectedRoute requiredFeature={Feature.ADMIN_CONFIG}>
                <ComissaoRulesPage />
              </ProtectedRoute>
            } />
            <Route path="/settings/comissao/pagamentos" element={
              <ProtectedRoute requiredFeature={Feature.ADMIN_CONFIG}>
                <GestaoComissoesPage />
              </ProtectedRoute>
            } />
            <Route path="/settings/prestadores" element={
              <ProtectedRoute requiredFeature={Feature.ADMIN_CONFIG}>
                <PrestadoresPage />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={<Navigate to="/settings" />} />

            {/* Financeiro */}
            <Route path="/faturamento" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <FaturamentoPage />
              </ProtectedRoute>
            } />
            <Route path="/despesa" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <DespesaPage />
              </ProtectedRoute>
            } />

            {/* Módulo Financeiro - Contas a Pagar/Receber */}
            <Route path="/financeiro" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <FinanceiroDashboard />
              </ProtectedRoute>
            } />
            <Route path="/financeiro/contas-pagar" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <ContasPagarPage />
              </ProtectedRoute>
            } />
            <Route path="/financeiro/contas-receber" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <ContasReceberPage />
              </ProtectedRoute>
            } />
            <Route path="/financeiro/cartoes" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <CartoesPage />
              </ProtectedRoute>
            } />

            <Route path="/financeiro/faturas" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <FaturasPage />
              </ProtectedRoute>
            } />

            <Route path="/financeiro/fluxo-caixa" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <FluxoCaixaPage />
              </ProtectedRoute>
            } />

            <Route path="/financeiro/distribuicao-lucros" element={
              <ProtectedRoute requiredFeature={Feature.ADMIN_CONFIG}>
                <DistribuicaoLucrosPage />
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
                <RelatoriosHubPage />
              </ProtectedRoute>
            } />

            <Route path="/relatorio/financeiro" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <RelatorioFinanceiroPage />
              </ProtectedRoute>
            } />

            <Route path="/relatorio/anual" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <RelatorioAnualPage />
              </ProtectedRoute>
            } />

            <Route path="/relatorio/ranking" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <RankingClientesPage />
              </ProtectedRoute>
            } />

            <Route path="/relatorio/receita-caixa" element={
              <ProtectedRoute requiredFeature={Feature.RELATORIO_FINANCEIRO_VIEW}>
                <ReceitaCaixaPage />
              </ProtectedRoute>
            } />

            <Route path="/financeiro/imposto-pago" element={
              <ProtectedRoute requiredFeature={Feature.ADMIN_CONFIG}>
                <ImpostoPagoPage />
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
