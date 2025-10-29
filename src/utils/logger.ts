type LogFields = Record<string, unknown>;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function normalizeMeta(meta?: LogFields): LogFields | undefined {
    if (!meta) {
        return undefined;
    }

    const normalized: LogFields = {};
    for (const [key, value] of Object.entries(meta)) {
        if (value instanceof Error) {
            normalized[key] = { message: value.message, stack: value.stack };
            continue;
        }

        normalized[key] = value;
    }

    return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function write(level: LogLevel, message: string, meta?: LogFields): void {
    const fields = normalizeMeta(meta);
    const args = fields ? [message, fields] : [message];

    switch (level) {
        case 'debug':
            console.debug(...args);
            break;
        case 'info':
            console.info(...args);
            break;
        case 'warn':
            console.warn(...args);
            break;
        case 'error':
            console.error(...args);
            break;
        default:
            console.log(...args);
            break;
    }
}

export const logger = {
    debug(message: string, meta?: LogFields) {
        write('debug', message, meta);
    },
    info(message: string, meta?: LogFields) {
        write('info', message, meta);
    },
    warn(message: string, meta?: LogFields) {
        write('warn', message, meta);
    },
    error(message: string, meta?: LogFields) {
        write('error', message, meta);
    }
};
