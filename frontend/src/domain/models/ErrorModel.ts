interface ErrorHandler {
    error: unknown;
    defaultMessage?: string;
}

export const getErrorMessage = ({ error, defaultMessage = "Something went wrong" }: ErrorHandler): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return defaultMessage;
};
