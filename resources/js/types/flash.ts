export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    type: ToastType;
    message: string;
    description?: string;
}

export interface FlashData {
    toast?: Toast;
}

declare module '@inertiajs/react' {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface FlashDataType extends FlashData {}
}
