// app/utils/errors.ts
import Toast from 'react-native-toast-message';

export function handleApiError(err: any) {
    const hasResponse = err?.response;
    const userMessage = hasResponse
        ? err.response.data?.error?.message || 'Something went wrong.'
        : 'Could not reach the server. Check your internet connection.';

    const logMessage = hasResponse
        ? err.response.data?.error?.log || err.message
        : err.message;

    // log internal error
    console.warn('[API ERROR LOG]:', logMessage);

    // show user-friendly message
    Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: userMessage,
    });
}
