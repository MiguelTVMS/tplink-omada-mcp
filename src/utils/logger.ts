import pino from 'pino';

type LogFields = Record<string, unknown>;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const level = process.env.LOG_LEVEL ?? 'info';

const levelToSeverity: Record<string, string> = {
    trace: 'DEBUG',
    debug: 'DEBUG',
    info: 'INFO',
    warn: 'WARNING',
    error: 'ERROR',
    fatal: 'CRITICAL'
};

const instance = pino({
    level,
    base: undefined,
    messageKey: 'message',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level(label) {
            return { severity: levelToSeverity[label] ?? label.toUpperCase() };
        }
    }
});

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
    if (fields) {
        instance[level](fields, message);
    } else {
        instance[level](message);
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
