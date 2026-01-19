# 📊 Guia do Módulo Financeiro

Este guia explica como utilizar todas as funcionalidades financeiras do sistema para gestão do seu negócio e envio de informações ao contador.

---

## 📌 Índice

1. [Visão Geral](#visão-geral)
2. [Dashboard Financeiro](#dashboard-financeiro)
3. [Contas a Receber](#contas-a-receber)
4. [Contas a Pagar](#contas-a-pagar)
5. [Cartões Corporativos](#cartões-corporativos)
6. [Lançamento de Despesas](#lançamento-de-despesas)
7. [Faturamento Manual](#faturamento-manual)
8. [Adiantamentos](#adiantamentos)
9. [Relatórios](#relatórios)
10. [Informações para o Contador](#informações-para-o-contador)

---

## 🎯 Visão Geral

O módulo financeiro está organizado por **processo de negócio**:

| Menu | O que você encontra |
|------|---------------------|
| **FINANCEIRO** | Dashboard com visão geral |
| **CONTAS** | Receber, Pagar e Cartões |
| **LANÇAMENTOS** | Despesas, Faturamento e Adiantamentos |
| **COMISSÕES** | Suas comissões e gestão |
| **RELATÓRIOS** | DRE, Fluxo de Caixa e Rankings |

---

## 📈 Dashboard Financeiro

**Caminho:** `FINANCEIRO > Dashboard`

O dashboard mostra um resumo rápido da saúde financeira:

- **A Receber:** Total de valores pendentes de clientes
- **A Pagar:** Total de contas pendentes
- **Vencendo em 7 dias:** Alertas de vencimento
- **Fluxo do Mês:** Entradas vs Saídas

💡 **Dica:** Use o dashboard diariamente para acompanhar a situação financeira.

---

## 💰 Contas a Receber

**Caminho:** `CONTAS > Contas a Receber`

### O que são?
São valores que clientes devem pagar por serviços realizados. Cada OS finalizada gera automaticamente uma conta a receber.

### Como usar?

1. **Visualizar contas pendentes:** A lista mostra todas as contas por vencimento
2. **Marcar como recebida:** 
   - Clique na conta desejada
   - Clique em **"Receber"**
   - Informe a **data do recebimento** e o **meio de pagamento** (PIX, Dinheiro, etc.)
3. **Filtrar por status:** Use o filtro para ver apenas Pendentes, Pagas ou Vencidas

### ⚠️ Importante para o DAS!
O **valor do Simples Nacional (DAS)** é calculado com base no que você **efetivamente recebeu** no mês, não no que faturou. Marcar corretamente as datas de recebimento é **essencial** para sua contabilidade!

---

## 📤 Contas a Pagar

**Caminho:** `CONTAS > Contas a Pagar`

### O que são?
São suas obrigações financeiras: despesas, fornecedores, comissões de funcionários, etc.

### Como usar?

1. **Visualizar contas pendentes:** A lista mostra todas por vencimento
2. **Marcar como paga:**
   - Clique na conta
   - Clique em **"Pagar"**
   - Informe a **data do pagamento** e o **meio de pagamento**

### De onde vêm as contas a pagar?
- **Despesas:** Ao lançar uma despesa "A Prazo"
- **Comissões:** Ao registrar comissão de funcionário
- **Parcelamentos:** Despesas parceladas

---

## 💳 Cartões Corporativos

**Caminho:** `CONTAS > Cartões Corporativos`

### Para que serve?
Cadastre os cartões de crédito da empresa para organizar despesas e gerar faturas automáticas.

### Como cadastrar um cartão?

1. Clique em **"Novo Cartão"**
2. Informe o **nome do cartão** (ex: "Nubank PJ", "Itaú Corporate")
3. Informe o **dia de vencimento** da fatura (1 a 28)
4. Clique em **"Criar Cartão"**

### Como funciona?
Quando você lançar uma despesa e selecionar um cartão corporativo:
- A despesa será agrupada na **fatura do mês**
- O vencimento será calculado automaticamente
- Você pode visualizar as faturas em `CONTAS > Faturas de Cartão`

---

## 🧾 Lançamento de Despesas

**Caminho:** `LANÇAMENTOS > Despesas`

### Categorias disponíveis

| Grupo | Categorias |
|-------|------------|
| **Operacional** | 🍽️ Alimentação, ⛽ Combustível, 🔧 Ferramentas, 📎 Material |
| **Infraestrutura** | 🏠 Aluguel, 💡 Energia/Água, 📡 Internet, 🔩 Manutenção |
| **Pessoal** | 💰 Salários, 👔 Pró-Labore, 🎁 Benefícios |
| **Marketing** | 📢 Marketing, 🏦 Taxas Bancárias |
| **Fiscal** | 📋 Impostos, 📊 Contabilidade |
| **Terceiros** | 👥 Serviços de Terceiros |
| **Genérico** | 📦 Diversos, ❓ Outros |

### Tipos de lançamento

#### 1. Despesa à Vista (Pago agora)
- O dinheiro **já saiu** do caixa
- Marque **"Pago à Vista? = Sim"**
- Informe o meio de pagamento

#### 2. Despesa a Prazo
- Pagamento **futuro**
- Deixe **"Pago à Vista? = Não"**
- Informe a **data de vencimento**
- Será criada uma **Conta a Pagar**

#### 3. Despesa no Cartão Corporativo
- Selecione o **cartão** no campo "Cartão Corporativo"
- A despesa será agrupada na **fatura do cartão**
- Você não precisa informar vencimento (é automático)

---

## 📝 Faturamento Manual

**Caminho:** `LANÇAMENTOS > Faturamento Manual`

### Quando usar?
Para registrar receitas que **não vieram de uma Ordem de Serviço**:
- Vendas avulsas
- Serviços externos
- Outras receitas

### Como lançar?
1. Informe a **data**
2. Informe o **valor**
3. Adicione uma **descrição**
4. Clique em **Registrar**

💡 O faturamento manual também gera uma Conta a Receber.

---

## 💵 Adiantamentos

**Caminho:** `LANÇAMENTOS > Adiantamentos`

### O que são?
Valores pagos **antecipadamente** a funcionários como parte da comissão.

### Impacto no cálculo de comissão
- Adiantamentos são **abatidos** do valor total da comissão
- Exemplo: Se a comissão do mês é R$ 5.000 e foi dado R$ 2.000 de adiantamento, o funcionário recebe R$ 3.000

---

## 📊 Relatórios

### Hub de Relatórios
**Caminho:** `RELATÓRIOS > Hub de Relatórios`

Ponto central para acessar todos os relatórios disponíveis.

---

### DRE - Demonstrativo de Resultado (Fluxo de Caixa)
**Caminho:** `RELATÓRIOS > Fluxo de Caixa`

#### O que mostra:
- **Faturamento Total** do mês
- **Despesas por Categoria** (com percentual)
- **Comissões** devidas
- **Impostos** (estimativa)
- **Lucro Líquido**

#### Para que serve:
- Análise de **lucro/prejuízo**
- Base para **IRPJ/CSLL** (se não for Simples)
- **Conferência contábil**

#### Exportar PDF
Clique em **"PDF EXPORT"** para gerar documento para enviar ao contador.

---

### Visão Anual (DRE Anual)
**Caminho:** `RELATÓRIOS > DRE / Visão Anual`

#### O que mostra:
- Faturamento **mês a mês**
- **Comparação com ano anterior** (YoY)
- **Crescimento percentual**
- Gráficos de evolução

---

### Ranking de Clientes
**Caminho:** `RELATÓRIOS > Ranking Clientes`

Identifique seus **melhores clientes** por:
- Volume de faturamento
- Quantidade de OSs

---

## 📄 Informações para o Contador

### O que seu contador precisa?

| Documento | Como obter | Uso |
|-----------|------------|-----|
| **DRE Mensal** | `RELATÓRIOS > Fluxo de Caixa > PDF EXPORT` | Lucro/Prejuízo, IRPJ |
| **Receita do DAS** | `CONTAS > Contas a Receber` (filtrar por PAGAS) | Base Simples Nacional |
| **Despesas** | Incluído no DRE | Conferência |
| **Fluxo de Caixa** | `FINANCEIRO > Dashboard` ou PDF | Gestão |

---

### 🔴 Base do DAS (Simples Nacional)

O DAS é calculado sobre o que **efetivamente entrou no caixa** no mês fiscal.

**Como garantir que está certo:**

1. Sempre que receber um pagamento, marque a Conta a Receber como **"Recebida"**
2. Informe a **data real do recebimento** (não a data do serviço!)
3. O sistema calcula o total automaticamente

**Exemplo:**
- Você realizou um serviço em **Janeiro** (R$ 10.000)
- O cliente pagou em **Fevereiro**
- O valor de R$ 10.000 entra na base do DAS de **Fevereiro**, não Janeiro!

---

### 📅 Rotina Financeira Recomendada

| Frequência | Ação |
|------------|------|
| **Diariamente** | Marcar recebimentos e pagamentos |
| **Semanalmente** | Revisar contas vencidas |
| **Mensalmente** | Gerar DRE e enviar ao contador |
| **Mensalmente** | Conferir faturas de cartão |

---

## ❓ Perguntas Frequentes

### Por que minha comissão está diferente do esperado?
A comissão é calculada sobre o **caixa** (o que foi recebido), não sobre o faturamento. Verifique se todas as contas a receber estão marcadas corretamente.

### Como parcelar uma despesa?
Atualmente, lance cada parcela como uma despesa separada com a data de vencimento correspondente.

### Posso editar uma conta já paga?
Não. Para correções, entre em contato com o administrador do sistema.

### Os PDFs têm logo da empresa?
Sim, se o logo estiver cadastrado nas Configurações da Empresa.

---

## 🆘 Suporte

Em caso de dúvidas ou problemas:
1. Verifique este guia
2. Consulte o administrador do sistema
3. Entre em contato com o suporte técnico

---

*Última atualização: Janeiro 2026*
