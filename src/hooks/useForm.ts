import { useState, useCallback } from 'react';

export const useForm = <T extends Record<string, any>>(initialValues: T) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setValues((prev) => ({
                ...prev,
                [name]: value,
            }));
            // Limpar erro do campo ao começar a digitar
            if (errors[name as keyof T]) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: undefined,
                }));
            }
        },
        [errors]
    );

    const setFieldError = useCallback((field: keyof T, error: string) => {
        setErrors((prev) => ({
            ...prev,
            [field]: error,
        }));
    }, []);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
    }, [initialValues]);

    return {
        values,
        errors,
        handleChange,
        setFieldError,
        reset,
        setValues,
    };
};
