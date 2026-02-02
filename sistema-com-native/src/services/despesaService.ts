import api from './api';
import { DespesaModel } from './database/models';
import { syncEngine } from './sync/SyncEngine';

export const despesaService = {
    create: async (despesa: any): Promise<any> => {
        // 1. Salvar LOCALMENTE
        // Adaptar payload se necessário para CreateDespesaLocal
        const local = await DespesaModel.create({
            data: despesa.dataDespesa || despesa.data,
            valor: despesa.valor,
            categoria: despesa.categoria,
            descricao: despesa.descricao,
            pagoAgora: despesa.pagoAgora,
            meioPagamento: despesa.meioPagamento,
            dataVencimento: despesa.dataVencimento,
            cartaoId: despesa.cartaoId
        });

        // 2. Sync
        syncEngine.trySyncInBackground();

        // Retornar formato compatível com UI
        return {
            id: local.id, // ID local
            ...despesa
        };
    },

    // Adicionar métodos de leitura se necessário no futuro
};
