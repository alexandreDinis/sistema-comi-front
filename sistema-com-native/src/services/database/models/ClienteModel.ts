// src/services/database/models/ClienteModel.ts
// Model para operações CRUD de Clientes no banco local

import { databaseService } from '../DatabaseService';
import { generateUUID } from '../../../utils/uuid';
import { LocalCliente, SyncStatus, SYNC_PRIORITIES } from './types';
import type { Cliente, ClienteRequest } from '../../../types';

export const ClienteModel = {
    /**
     * Buscar todos os clientes locais
     */
    async getAll(): Promise<LocalCliente[]> {
        return await databaseService.runQuery<LocalCliente>(
            `SELECT * FROM clientes WHERE sync_status != 'PENDING_DELETE' ORDER BY razao_social`
        );
    },

    /**
     * Buscar cliente por ID local
     */
    async getById(id: number): Promise<LocalCliente | null> {
        return await databaseService.getFirst<LocalCliente>(
            `SELECT * FROM clientes WHERE id = ?`,
            [id]
        );
    },

    /**
     * Buscar cliente por server_id
     */
    async getByServerId(serverId: number): Promise<LocalCliente | null> {
        return await databaseService.getFirst<LocalCliente>(
            `SELECT * FROM clientes WHERE server_id = ?`,
            [serverId]
        );
    },

    /**
     * Buscar cliente por local_id
     */
    async getByLocalId(localId: string): Promise<LocalCliente | null> {
        return await databaseService.getFirst<LocalCliente>(
            `SELECT * FROM clientes WHERE local_id = ?`,
            [localId]
        );
    },

    /**
     * Buscar clientes por termo de busca (nome, fantasia, cnpj, cpf)
     */
    async search(termo: string): Promise<LocalCliente[]> {
        const searchTerm = `%${termo}%`;
        return await databaseService.runQuery<LocalCliente>(
            `SELECT * FROM clientes 
       WHERE sync_status != 'PENDING_DELETE'
       AND (razao_social LIKE ? OR nome_fantasia LIKE ? OR cnpj LIKE ? OR cpf LIKE ?)
       ORDER BY razao_social
       LIMIT 50`,
            [searchTerm, searchTerm, searchTerm, searchTerm]
        );
    },

    /**
     * Criar cliente local (para uso offline)
     */
    async create(data: ClienteRequest, syncStatus: SyncStatus = 'PENDING_CREATE'): Promise<LocalCliente> {
        const now = Date.now();
        const localId = generateUUID();

        const id = await databaseService.runInsert(
            `INSERT INTO clientes (
        local_id, server_id, version, razao_social, nome_fantasia, cnpj, cpf,
        tipo_pessoa, contato, email, status, logradouro, numero, complemento,
        bairro, cidade, estado, cep, sync_status, updated_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                localId,
                null, // server_id
                1, // version
                data.razaoSocial,
                data.nomeFantasia || null,
                data.cnpj || null,
                data.cpf || null,
                data.tipoPessoa || null,
                data.contato,
                data.email,
                data.status,
                data.logradouro || null,
                data.numero || null,
                data.complemento || null,
                data.bairro || null,
                data.cidade || null,
                data.estado || null,
                data.cep || null,
                syncStatus,
                now,
                now
            ]
        );

        // Adicionar à fila de sync se for pendente
        if (syncStatus === 'PENDING_CREATE') {
            await this.addToSyncQueue(localId, 'CREATE', data);
        }

        return (await this.getById(id))!;
    },

    /**
     * Salvar cliente do servidor no cache local
     */
    async upsertFromServer(cliente: Cliente): Promise<LocalCliente> {
        const now = Date.now();
        const existing = await this.getByServerId(cliente.id);

        if (existing) {
            // CONFLICT RESOLUTION:
            // Se temos alterações locais pendentes, IGNORA o update do servidor por enquanto
            // O SyncEngine vai tentar enviar nossas alterações depois.
            // "Client Wins" se estiver pendente.
            if (existing.sync_status !== 'SYNCED') {
                console.log(`[ClienteModel] Ignorando update do servidor para id ${existing.id} pois tem alterações locais pendentes.`);
                return existing;
            }

            // Atualizar existente
            await databaseService.runUpdate(
                `UPDATE clientes SET
          razao_social = ?, nome_fantasia = ?, cnpj = ?, cpf = ?,
          tipo_pessoa = ?, contato = ?, email = ?, status = ?,
          logradouro = ?, numero = ?, complemento = ?, bairro = ?,
          cidade = ?, estado = ?, cep = ?,
          sync_status = 'SYNCED', last_synced_at = ?
         WHERE id = ?`,
                [
                    cliente.razaoSocial,
                    cliente.nomeFantasia || null,
                    cliente.cnpj || null,
                    cliente.cpf || null,
                    cliente.tipoPessoa || null,
                    cliente.contato,
                    cliente.email,
                    cliente.status,
                    cliente.logradouro || null,
                    cliente.numero || null,
                    cliente.complemento || null,
                    cliente.bairro || null,
                    cliente.cidade || null,
                    cliente.estado || null,
                    cliente.cep || null,
                    now,
                    existing.id // Mantém updated_at original para não parecer mudança local?
                    // Na verdade, updated_at deve refletir a última mudança. Mas se veio do servidor, ok.
                    // Vamos atualizar updated_at também.
                ]
            );
            // Atualizar updated_at separadamente ou na query acima. Query acima não tinha updated_at!
            await databaseService.runUpdate(`UPDATE clientes SET updated_at = ? WHERE id = ?`, [now, existing.id]);

            return (await this.getById(existing.id))!;
        } else {
            // Inserir novo
            const localId = generateUUID();
            const id = await databaseService.runInsert(
                `INSERT INTO clientes (
          local_id, server_id, version, razao_social, nome_fantasia, cnpj, cpf,
          tipo_pessoa, contato, email, status, logradouro, numero, complemento,
          bairro, cidade, estado, cep, sync_status, last_synced_at, updated_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SYNCED', ?, ?, ?)`,
                [
                    localId,
                    cliente.id,
                    1,
                    cliente.razaoSocial,
                    cliente.nomeFantasia || null,
                    cliente.cnpj || null,
                    cliente.cpf || null,
                    cliente.tipoPessoa || null,
                    cliente.contato,
                    cliente.email,
                    cliente.status,
                    cliente.logradouro || null,
                    cliente.numero || null,
                    cliente.complemento || null,
                    cliente.bairro || null,
                    cliente.cidade || null,
                    cliente.estado || null,
                    cliente.cep || null,
                    now,
                    now,
                    now
                ]
            );
            return (await this.getById(id))!;
        }
    },

    /**
     * Atualizar cliente local
     */
    async update(id: number, data: Partial<ClienteRequest>): Promise<LocalCliente | null> {
        const existing = await this.getById(id);
        if (!existing) return null;

        const now = Date.now();
        const newVersion = existing.version + 1;

        await databaseService.runUpdate(
            `UPDATE clientes SET
        razao_social = COALESCE(?, razao_social),
        nome_fantasia = COALESCE(?, nome_fantasia),
        cnpj = COALESCE(?, cnpj),
        cpf = COALESCE(?, cpf),
        tipo_pessoa = COALESCE(?, tipo_pessoa),
        contato = COALESCE(?, contato),
        email = COALESCE(?, email),
        status = COALESCE(?, status),
        logradouro = COALESCE(?, logradouro),
        numero = COALESCE(?, numero),
        complemento = COALESCE(?, complemento),
        bairro = COALESCE(?, bairro),
        cidade = COALESCE(?, cidade),
        estado = COALESCE(?, estado),
        cep = COALESCE(?, cep),
        version = ?,
        sync_status = CASE WHEN sync_status = 'SYNCED' THEN 'PENDING_UPDATE' ELSE sync_status END,
        updated_at = ?
       WHERE id = ?`,
            [
                data.razaoSocial,
                data.nomeFantasia,
                data.cnpj,
                data.cpf,
                data.tipoPessoa,
                data.contato,
                data.email,
                data.status,
                data.logradouro,
                data.numero,
                data.complemento,
                data.bairro,
                data.cidade,
                data.estado,
                data.cep,
                newVersion,
                now,
                id
            ]
        );

        // Adicionar à fila de sync
        // Se já estava PENDING, não precisa readicionar operação update (mas o debounce cuidaria).
        // Aqui simplificamos: sempre garante na fila.
        const updated = await this.getById(id);
        if (updated && updated.sync_status !== 'SYNCED') {
            // Se estava PENDING_CREATE, continua create com dados novos.
            // Se estava SYNCED, virou PENDING_UPDATE.
            const op = updated.sync_status === 'PENDING_CREATE' ? 'CREATE' : 'UPDATE';
            // Payload deve ser o objeto completo para update (ou partial se suportado).
            // Vamos mandar full object para simplificar o backend.
            const payload = this.toApiFormat(updated);
            await this.addToSyncQueue(updated.local_id, op, payload);
        }

        return await this.getById(id);
    },

    /**
     * Soft Delete: Marcar para deleção sem remover fisicamente imediato
     */
    async softDelete(id: number): Promise<boolean> {
        const existing = await this.getById(id);
        if (!existing) return false;

        // Validar integridade referencial: Verificar se há OS vinculadas
        // Verifica tanto pelo ID numérico (se sincronizado) quanto pelo UUID local
        const query = `
            SELECT COUNT(*) as count FROM ordens_servico 
            WHERE (cliente_id = ? OR cliente_local_id = ?) 
            AND (deleted_at IS NULL OR deleted_at = 0)
        `;
        const result = await databaseService.getFirst<{ count: number }>(query, [existing.id, existing.local_id]);

        if (result && result.count > 0) {
            console.warn(`[ClienteModel] Tentativa de excluir cliente ${id} com ${result.count} OS vinculadas.`);
            // Poderíamos lançar erro ou retornar false. 
            // Para UI feedback, lançar erro é melhor, mas aqui retornamos false e logamos.
            // O ideal seria throw new Error('Cliente possui OS vinculadas');
            throw new Error('Não é possível excluir cliente com Ordens de Serviço vinculadas.');
        }

        const now = Date.now();

        if (existing.server_id) {
            // Tem no servidor, marcar para deleção remota
            await databaseService.runUpdate(
                `UPDATE clientes SET 
                    sync_status = 'PENDING_DELETE', 
                    updated_at = ?,
                    deleted_at = ? 
                WHERE id = ?`,
                [now, now, id]
            );
            await this.addToSyncQueue(existing.local_id, 'DELETE', null);
        } else {
            // Apenas local, pode deletar direto (Hard Delete)
            await databaseService.runDelete(`DELETE FROM clientes WHERE id = ?`, [id]);
            // Remover da fila de sync
            await databaseService.runDelete(
                `DELETE FROM sync_queue WHERE entity_type = 'cliente' AND entity_local_id = ?`,
                [existing.local_id]
            );
        }

        return true;
    },

    // Manter método delete antigo como alias ou remover? 
    // Vamos substituir o delete pelo softDelete na prática, mas manter assinatura.
    async delete(id: number): Promise<boolean> {
        return this.softDelete(id);
    },

    /**
     * Obter clientes pendentes de sincronização
     */
    async getPendingSync(): Promise<LocalCliente[]> {
        return await databaseService.runQuery<LocalCliente>(
            `SELECT * FROM clientes WHERE sync_status IN ('PENDING_CREATE', 'PENDING_UPDATE', 'PENDING_DELETE')`
        );
    },

    /**
     * Marcar como sincronizado após envio bem-sucedido
     */
    async markAsSynced(localId: string, serverId: number): Promise<void> {
        await databaseService.runUpdate(
            `UPDATE clientes SET 
        server_id = ?, 
        sync_status = 'SYNCED', 
        last_synced_at = ? 
       WHERE local_id = ?`,
            [serverId, Date.now(), localId]
        );

        // Remover da fila de sync
        await databaseService.runDelete(
            `DELETE FROM sync_queue WHERE entity_type = 'cliente' AND entity_local_id = ?`,
            [localId]
        );
    },

    /**
     * Marcar como erro de sincronização
     */
    async markAsSyncError(localId: string, errorMessage: string): Promise<void> {
        // Não mudamos o sync_status da entidade para ERROR para não quebrar a UI que espera PENDING
        // Mas podemos logar ou usar tabela auxiliar.
        // O SyncEngine já marca o erro na sync_queue.
        // Aqui apenas atualizamos se quisermos persistência no modelo.
        console.warn(`[ClienteModel] Erro sync cliente ${localId}: ${errorMessage}`);
    },

    /**
     * Adicionar à fila de sincronização
     */
    async addToSyncQueue(localId: string, operation: 'CREATE' | 'UPDATE' | 'DELETE', payload: any): Promise<void> {
        const now = Date.now();

        // Verificar se já existe na fila
        const existing = await databaseService.getFirst<{ id: number; attempts: number }>(
            `SELECT id, attempts FROM sync_queue WHERE entity_type = 'cliente' AND entity_local_id = ?`,
            [localId]
        );

        if (existing) {
            // Atualizar operação existente e resetar erro/retry se for nova alteração do usuário
            // Se o usuário alterou de novo, reseta attempts para tentar nova versão com prioridade.
            await databaseService.runUpdate(
                `UPDATE sync_queue SET 
                    operation = ?, 
                    payload = ?, 
                    created_at = ?,
                    status = 'PENDING',
                    attempts = 0,
                    error_message = NULL
                WHERE id = ?`,
                [operation, payload ? JSON.stringify(payload) : null, now, existing.id]
            );
        } else {
            // Inserir nova
            await databaseService.runInsert(
                `INSERT INTO sync_queue (entity_type, entity_local_id, operation, payload, priority, created_at, status)
         VALUES ('cliente', ?, ?, ?, ?, ?, 'PENDING')`,
                [localId, operation, payload ? JSON.stringify(payload) : null, SYNC_PRIORITIES.HIGH, now]
            );
        }
    },

    /**
     * Converter de LocalCliente para Cliente (formato da API)
     */
    toApiFormat(local: LocalCliente): Cliente {
        return {
            id: local.server_id || local.id,
            razaoSocial: local.razao_social,
            nomeFantasia: local.nome_fantasia || '',
            cnpj: local.cnpj || undefined,
            cpf: local.cpf || undefined,
            tipoPessoa: local.tipo_pessoa as any,
            contato: local.contato || '',
            email: local.email || '',
            status: local.status as any,
            logradouro: local.logradouro || undefined,
            numero: local.numero || undefined,
            complemento: local.complemento || undefined,
            bairro: local.bairro || undefined,
            cidade: local.cidade || undefined,
            estado: local.estado || undefined,
            cep: local.cep || undefined,
        };
    }
};
