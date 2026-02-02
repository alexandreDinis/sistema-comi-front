import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const CREDENTIALS_KEY = 'secure_user_credentials';
const BIOMETRIC_PREF_KEY = 'biometric_enabled';

export const BiometricService = {
    // 0. Verifica apenas o hardware (para decidir se pergunta ao usuário)
    async hasHardware(): Promise<boolean> {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            console.log('[BiometricService] Hardware check:', { hasHardware, isEnrolled });
            return hasHardware && isEnrolled;
        } catch (error) {
            console.error('[BiometricService] Error checking hardware:', error);
            return false;
        }
    },

    // 1. Verifica se pode usar (Hardware + Configuração do Usuário)
    async isReady(): Promise<boolean> {
        try {
            const capable = await this.hasHardware();
            const isEnabledInApp = await SecureStore.getItemAsync(BIOMETRIC_PREF_KEY);
            console.log('[BiometricService] isReady check:', { capable, isEnabledInApp });
            return capable && (isEnabledInApp === 'true');
        } catch (error) {
            console.error('Erro ao verificar disponibilidade', error);
            return false;
        }
    },

    // 2. Salva as credenciais "trancadas"
    // Chamado APENAS após um login manual com sucesso (senha digitada)
    async saveCredentials(email: string, pass: string) {
        try {
            // Salvamos um objeto JSON stringify para pegar tudo de uma vez
            const credentials = JSON.stringify({ email, pass });

            await SecureStore.setItemAsync(CREDENTIALS_KEY, credentials, {
                // No iOS, isso garante que o dado só é acessível se o aparelho estiver desbloqueado
                keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
            });

            // Ativa a flag de preferência
            await SecureStore.setItemAsync(BIOMETRIC_PREF_KEY, 'true');
        } catch (error) {
            console.error('Erro ao salvar credenciais', error);
            throw new Error('Falha ao proteger credenciais');
        }
    },

    // 3. O Fluxo de Login Biométrico
    async loginWithBiometrics(): Promise<{ email: string; pass: string } | null> {
        try {
            // A. Primeiro, checa se a biometria "física" passa
            const authResult = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Acesse sua conta',
                fallbackLabel: 'Digitar senha',
                disableDeviceFallback: false, // Permite PIN do celular se falhar a bio (opcional)
                cancelLabel: 'Cancelar'
            });

            if (!authResult.success) {
                return null; // Usuário cancelou ou falhou
            }

            // B. Se passou, abre o cofre
            const jsonCredentials = await SecureStore.getItemAsync(CREDENTIALS_KEY);

            if (!jsonCredentials) {
                // Caso raro: Biometria ok, mas dados sumiram (ex: limpeza de dados)
                return null;
            }

            return JSON.parse(jsonCredentials);
        } catch (error) {
            console.error('Erro crítico na autenticação', error);
            return null;
        }
    },

    // 4. Logout / Limpeza (Segurança)
    async clearCredentials() {
        await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
        await SecureStore.deleteItemAsync(BIOMETRIC_PREF_KEY);
    }
};
