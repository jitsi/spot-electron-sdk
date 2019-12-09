declare module '@abandonware/noble' {
    export function on(eventName: string, callback: Function): void;
    export function startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean, callback?: Function): void;
    export function stopScanning(): void;
    export const state: string;
}
