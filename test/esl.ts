import { ESLWrapper, createESLWrapper } from '../src';
import { logger } from './logger';

export const esl = createESLWrapper(ESLWrapper, {
    logger,
    conninfo: {
        host: process.env.FS_ESL_ADDRESS,
        port: parseInt(process.env.FS_ESL_PORT),
        secret: process.env.FS_ESL_SECRET,
    },
});
