export interface Faturamento {
    id: number;
    dataFaturamento: string;
    valor: number;
    dataCriacao: string;
}

export interface FaturamentoRequest {
    dataFaturamento: string;
    valor: number;
}

export interface PagamentoAdiantado {
    id: number;
    dataPagamento: string;
    valor: number;
    descricao?: string;
    dataCriacao: string;
}

export interface AdiantamentoRequest {
    dataPagamento: string;
    valor: number;
    descricao?: string;
}

export interface ComissaoCalculada {
    anoMesReferencia: string;
    faturamentoMensal: number;
    faixaComissao: string;
    porcentagemComissao: number;
    valorBrutoComissao: number;
    valorAdiantado: number;
    saldoAReceber: number;
}

export type CategoriaDespesa = 'ALIMENTACAO' | 'COMBUSTIVEL' | 'FERRAMENTAS' | 'MARKETING' | 'INFRAESTRUTURA' | 'PROLABORE' | 'DIVERSOS' | 'OUTROS';

export interface Despesa {
    id: number;
    dataDespesa: string;
    valor: number;
    categoria: CategoriaDespesa;
    descricao?: string;
    dataCriacao: string;
}

export interface DespesaRequest {
    dataDespesa: string;
    valor: number;
    categoria: CategoriaDespesa;
    descricao?: string;
}

export interface RelatorioFinanceiro {
    despesasPorCategoria: Record<string, number>;
    faturamentoTotal: number;
    despesasTotal: number;
    imposto: number;
    adiantamentosTotal: number;
    comissaoAlocada: number;
    saldoRemanescenteComissao: number;
    totalGeral: number;
    lucroLiquido: number;
}

export interface ErrorResponse {
    status: number;
    message: string;
    error: string;
    timestamp: string;
    path: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ErrorResponse;
    isLoading: boolean;
    isError: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string; // User specified 'password' in the JSON example
}

export interface UserResponse {
    token: string;
    email: string;
    name?: string;
    role?: string;
    roles?: string[];
    expiresIn: number;

    // V2 Multi-Tenant
    empresa?: Empresa;
    features?: string[];
    mustChangePassword?: boolean;
}

export interface Empresa {
    nome: string;
    plano: 'BRONZE' | 'PRATA' | 'OURO' | string;
}

// Commission Mode Configuration
export type ModoComissao = 'INDIVIDUAL' | 'COLETIVA';

export interface EmpresaConfig {
    id: number;
    nome: string;
    modoComissao: ModoComissao;
}

export interface UpdateEmpresaConfigRequest {
    modoComissao?: ModoComissao;
}

export interface Feature {
    id?: number;
    codigo: string;
    descricao?: string;
    planoMinimo?: string;
}

export interface User {
    id: number;
    email: string;
    name?: string;
    role?: 'USER' | 'ADMIN' | string;
    roles?: string[];
    active: boolean;

    // V2 Multi-Tenant Fields
    empresa?: Empresa;
    features?: Feature[] | string[]; // Can be strings (legacy/mock) or objects (backend)
    mustChangePassword?: boolean;
}

// --- Módulo OS Definitions ---

export type OSStatus = 'ABERTA' | 'EM_EXECUCAO' | 'FINALIZADA' | 'CANCELADA';

export type StatusCliente = 'ATIVO' | 'INATIVO' | 'EM_PROSPECCAO';

export interface Cliente {
    id: number;
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    endereco?: string; // Mantido para retrocompatibilidade visual se necessario, mas o foco agora são os campos detalhados
    contato: string;
    email: string;
    status: StatusCliente;

    // Address Fields
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
}

export interface ClienteRequest {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    endereco?: string;
    contato: string;
    email: string;
    status: StatusCliente;

    // Address Fields
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
}

export interface ClienteFiltros {
    termo?: string;
    cidade?: string;
    bairro?: string;
    status?: StatusCliente;
}

export interface TipoPeca {
    id: number;
    nome: string;
    valorPadrao: number;
}

export interface TipoPecaRequest {
    nome: string;
    valorPadrao: number;
}

export interface PecaOS {
    id: number;
    nomePeca: string;
    valorCobrado: number;
}

export interface VeiculoOS {
    id: number;
    placa: string;
    modelo: string;
    cor: string;
    valorTotal: number;
    pecas: PecaOS[];
}

export interface VeiculoExistente {
    modelo: string;
    cor: string;
    cliente: string; // Nome fantasia do cliente
}

export interface PlacaCheckResponse {
    existe: boolean;
    mensagem: string;
    veiculoExistente?: VeiculoExistente;
}

export interface HistoricoItem {
    ordemServicoId: number;
    data: string; // Formato ISO "YYYY-MM-DD"
    status: OSStatus;
    valorTotalServico: number;
    pecasOuServicos: string[]; // Lista de nomes das peças/serviços
}

export type HistoricoResponse = HistoricoItem[];

export interface OrdemServico {
    id: number;
    data: string;
    status: OSStatus;
    valorTotal: number;
    // New Discount Fields
    tipoDesconto?: 'PERCENTUAL' | 'VALOR_FIXO';
    valorDesconto?: number;
    valorTotalSemDesconto?: number;
    valorTotalComDesconto?: number;
    cliente: Cliente;
    veiculos: VeiculoOS[];
}

export interface CreateOSRequest {
    clienteId: number;
    data: string;
    tipoDesconto?: 'PERCENTUAL' | 'VALOR_FIXO';
    valorDesconto?: number;
}

export interface AddVeiculoRequest {
    ordemServicoId: number;
    placa: string;
    modelo: string;
    cor: string;
}

export interface AddPecaRequest {
    veiculoId: number;
    tipoPecaId: number;
    valorCobrado?: number; // Optional, uses default if null
}

export interface UpdateOSStatusRequest {
    status: OSStatus;
}

// --- Year-over-Year Revenue Comparison ---

export interface ComparacaoFaturamentoDTO {
    faturamentoAtual: number;
    faturamentoAnoAnterior: number;
    diferencaAbsoluta: number;
    diferencaPercentual: number;
    temDadosAnoAnterior: boolean;
}

export interface MesFaturamentoDTO {
    mes: number;
    nomeMes: string;
    faturamentoAtual: number;
    faturamentoAnoAnterior: number;
    diferencaAbsoluta: number;
    diferencaPercentual: number;
}

export interface RelatorioAnualDTO {
    meses: MesFaturamentoDTO[];
    faturamentoTotalAno: number;
    faturamentoTotalAnoAnterior: number;
    crescimentoAnual: number;
}
