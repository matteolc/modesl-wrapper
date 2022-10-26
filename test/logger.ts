process.env.NODE_ENV = 'test';

import { createLogger, format, transports } from 'winston';
import { compact, upperCase } from 'lodash';
const { combine, timestamp, splat, printf } = format;

const enumerateErrorFormat = format((info: any) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});

const consoleFormat = combine(
    enumerateErrorFormat(),
    timestamp(),
    splat(),
    printf(({ label, timestamp, level, message, ...meta }: any) => {
        return compact([
            timestamp,
            `${upperCase(process.env.NODE_ENV)}-${process.version}`,
            upperCase(level),
            message,
            meta?.error?.message,
        ]).join(' | ');
    }),
);

export const logger = createLogger({
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        trace: 5,
    },
    transports: [
        new transports.Console({
            level: 'debug',
            silent: false,
            handleExceptions: true,
            format: consoleFormat,
        }),
    ],
    exitOnError: false,
});
