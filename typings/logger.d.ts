declare module 'jitsi-meet-logger' {
    class Logger {
        error(message: string, ...params): void;
        info(message: string, ...params): void;
    }

    export function getLogger(id: string, transports: Array<Object> | undefined, config: Object): Logger;
}