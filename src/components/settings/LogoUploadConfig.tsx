import React, { useState, useRef, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { empresaService } from '../../services/empresaService';
import { Upload, Image, Loader2, Check, AlertCircle, X } from 'lucide-react';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface ValidationError {
    type: 'type' | 'size';
    message: string;
}

export const LogoUploadConfig: React.FC = () => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<ValidationError | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const { data: config, isLoading: isLoadingConfig } = useQuery({
        queryKey: ['empresa-config'],
        queryFn: empresaService.getConfig
    });

    const getUploadErrorMessage = (error: unknown): string => {
        // Axios error with response
        const axiosError = error as { response?: { status?: number; data?: { error?: string } }; message?: string };
        if (axiosError?.response?.status === 413) {
            return `Arquivo excede o limite do servidor (máx. ${MAX_SIZE_MB}MB). Reduza o tamanho da imagem.`;
        }
        if (axiosError?.response?.data?.error) {
            return axiosError.response.data.error;
        }
        if (axiosError?.message?.toLowerCase().includes('too large') ||
            axiosError?.message?.toLowerCase().includes('size')) {
            return `Arquivo muito grande. O limite é ${MAX_SIZE_MB}MB.`;
        }
        return 'Erro ao enviar logo. Tente novamente.';
    };

    const uploadMutation = useMutation({
        mutationFn: (file: File) => {
            if (!config?.id) throw new Error('Empresa não encontrada');
            return empresaService.uploadLogo(config.id, file);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['empresa-config'] });
            setPreviewUrl(null);
            setValidationError(null);
        },
        onError: (error: unknown) => {
            console.error('Logo upload error:', error);
        }
    });

    const validateFile = useCallback((file: File): ValidationError | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return {
                type: 'type',
                message: `Tipo de arquivo inválido. Permitidos: PNG, JPEG, WebP`
            };
        }
        if (file.size > MAX_SIZE_BYTES) {
            return {
                type: 'size',
                message: `Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB`
            };
        }
        return null;
    }, []);

    const handleFileSelect = useCallback((file: File) => {
        setValidationError(null);

        const error = validateFile(file);
        if (error) {
            setValidationError(error);
            setPreviewUrl(null);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        uploadMutation.mutate(file);
    }, [validateFile, uploadMutation]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const clearError = () => {
        setValidationError(null);
    };

    // Get current logo URL
    const currentLogoUrl = config?.logoUrl || (config?.id ? empresaService.getLogoUrl(config.id) : null);
    const displayUrl = previewUrl || (config?.logoUrl ? currentLogoUrl : null);

    if (isLoadingConfig) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-cyber-gold animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-cyber-gold font-bold uppercase text-sm mb-2 flex items-center gap-2">
                    Logo da Empresa
                    {uploadMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {uploadMutation.isSuccess && <Check className="w-4 h-4 text-green-400" />}
                </h3>
                <p className="text-cyber-gold/50 text-xs mb-4">
                    Faça upload do logo da sua empresa. Formatos: PNG, JPEG, WebP (máx. 2MB)
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Current Logo Preview */}
                <div className="shrink-0">
                    <div className="w-32 h-32 border-2 border-dashed border-cyber-gold/30 bg-black/40 flex items-center justify-center overflow-hidden">
                        {displayUrl ? (
                            <img
                                src={displayUrl}
                                alt="Logo da empresa"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    // Hide broken image
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <Image className="w-12 h-12 text-cyber-gold/30" />
                        )}
                    </div>
                </div>

                {/* Upload Zone */}
                <div className="flex-1">
                    <div
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            border-2 border-dashed p-6 text-center cursor-pointer transition-all
                            ${isDragOver
                                ? 'border-cyber-gold bg-cyber-gold/10'
                                : 'border-cyber-gold/30 hover:border-cyber-gold/60 bg-black/40'
                            }
                            ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleInputChange}
                            className="hidden"
                        />

                        <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragOver ? 'text-cyber-gold' : 'text-cyber-gold/50'}`} />
                        <p className="text-cyber-gold/70 text-sm">
                            {isDragOver ? (
                                'Solte o arquivo aqui'
                            ) : (
                                <>
                                    <span className="text-cyber-gold font-semibold">Clique para selecionar</span>
                                    {' '}ou arraste um arquivo
                                </>
                            )}
                        </p>
                        <p className="text-cyber-gold/40 text-xs mt-2">
                            PNG, JPEG ou WebP • Máximo 2MB
                        </p>
                    </div>
                </div>
            </div>

            {/* Validation Error */}
            {validationError && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/30 p-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{validationError.message}</span>
                    <button onClick={clearError} className="hover:text-red-300">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Upload Error */}
            {uploadMutation.isError && (
                <div className="text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/30 p-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {getUploadErrorMessage(uploadMutation.error)}
                    </div>
                </div>
            )}

            {/* Success */}
            {uploadMutation.isSuccess && (
                <div className="text-green-400 text-xs font-mono bg-green-400/10 border border-green-400/30 p-3">
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Logo atualizado com sucesso!
                    </div>
                </div>
            )}
        </div>
    );
};
