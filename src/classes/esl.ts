import { handleESLEvent } from '../modules';
const esl = require('modesl');

export const ESLEvent = {
    Connection: {
        READY: 'esl::ready',
        CLOSED: 'esl::end',
        ERROR: 'error',
    },
    RECEIVED: 'esl::event::*::*',
    ALL_EVENTS: 'all',
};

/**
 * ESL connection options
 */
export interface ESLConnectionOpts {
    readonly host: string;
    readonly port: number;
    readonly secret: string;
}

/**
 * Options interfaces
 *
 */
export interface CallBackListInterface {
    readonly event: string;
    apply: Function;
}

export interface LoggerInterface {
    info: Function;
    debug: Function;
    error: Function;
}

export interface ESLWrapperOpts {
    logger: LoggerInterface;
    conninfo: ESLConnectionOpts;
}

export interface ESLWrapperInterface {
    listen: (c?: CallBackListInterface[], s?: string[], l?: string[]) => Promise<void>;
    ReloadXML: () => Promise<string>;
    UUIDGetVar: (u: string, v: string) => Promise<string>;
    UUIDKill: (u: string, v: string) => Promise<string>;
    UUIDTransfer: (u: string, d: string, c?: string, p?: string) => Promise<string>;
    UUIDSetvarMulti: (u: string, v: string) => Promise<string>;
    UUIDSetvar: (u: string, k: string, v: string) => Promise<string>;
    Originate: (u: string) => Promise<string>;
}

/**
 * Class constructors
 *
 */
export interface ESLWrapperConstructor {
    new (opts: ESLWrapperOpts): ESLWrapperInterface;
}

export function createESLWrapper(ctor: ESLWrapperConstructor, opts: ESLWrapperOpts): ESLWrapperInterface {
    return new ctor(opts);
}

/**
 * ESL Wrapper class
 *
 */
export class ESLWrapper implements ESLWrapperInterface {
    logger: LoggerInterface;
    conninfo: ESLConnectionOpts;
    connection: any;

    /**
     *
     * @param opts
     * @returns
     */
    constructor(opts: ESLWrapperOpts) {
        this.logger = opts.logger;
        this.conninfo = opts.conninfo;
        this.connection = null;
        return this;
    }

    /**
     *
     */
    listen = async (cblist?: CallBackListInterface[], savelist?: string[], loglist?: string[]) => {
        try {
            await this.connect();
            // Subscribe to all FreeSWITCH events
            this.connection.subscribe(ESLEvent.ALL_EVENTS);
            this.connection.on(ESLEvent.RECEIVED, (event: any) => {
                // A new FreeSWITCH event has been received
                handleESLEvent(this.logger, cblist || [], savelist || [], loglist || [], event);
            });
        } catch (error: any) {
            // An error connecting to FreeSWITCH occurred!
            this.logger.error(error.message);
            throw new Error(error.message);
        }
    };

    /**
     *
     * @param uuid
     * @param variable
     * @returns
     */
    UUIDGetVar = async (uuid: string, variable: string) => {
        return await this.execute(`uuid_getvar ${uuid} ${variable}`);
    };

    /**
     *
     * @param uuid
     * @param cause
     * @returns
     */
    UUIDKill = async (uuid: string, cause: string) => {
        return await this.execute(`uuid_kill ${uuid} ${cause}`);
    };

    /**
     *
     * @param uuid
     * @param provider
     * @returns
     */
    UUIDTransfer = async (uuid: string, destexten: string, dialplan?: string, context?: string) => {
        return await this.execute(`uuid_transfer ${uuid} -both ${destexten} ${dialplan} ${context}`);
    };

    /**
     *
     * @param uuid
     * @param varlist
     * @returns
     */
    UUIDSetvarMulti = async (uuid: string, varlist: string) => {
        return this.execute(`uuid_setvar_multi ${uuid} ${varlist}`);
    };

    /**
     *
     * @param uuid
     * @param variable
     * @param value
     * @returns
     */
    UUIDSetvar = async (uuid: string, variable: string, value: any) => {
        return await this.execute(`uuid_setvar ${uuid} ${variable}=${value}`);
    };

    /**
     *
     * @param ostring
     * @returns
     */
    Originate = async (ostring: string) => {
        return await this.execute(`originate ${ostring}`);
    };

    /**
     *
     * @returns
     */
    ReloadXML = async () => {
        return await this.execute(`reloadxml`);
    };

    /**
     *
     * @param millis
     * @returns
     */
    MSleep = async (millis: number) => {
        return await this.execute(`msleep ${millis}`, false);
    };

    /**
     *
     * @param uuid
     * @returns
     */
    UUIDAnswer = async (uuid: string) => {
        return await this.execute(`uuid_answer ${uuid}`);
    };

    /**
     *
     * @param uuid
     * @returns
     */
    UUIDRingReady = async (uuid: string) => {
        return await this.execute(`uuid_ring_ready ${uuid}`);
    };

    /**
     *
     * @param uuid
     * @returns
     */
    UUIDPreAnswer = async (uuid: string) => {
        return await this.execute(`uuid_pre_answer ${uuid}`);
    };

    /**
     *
     * @returns
     */
    private connect = () =>
        new Promise((resolve, reject) => {
            if (this.connection !== null && this.connection.connected()) {
                resolve(this.connection);
            } else {
                this.connection = new esl.Connection(this.conninfo.host, this.conninfo.port, this.conninfo.secret);
                this.connection.on(ESLEvent.Connection.ERROR, (o: any) => {
                    // Error connecting to FreeSWITCH!
                    reject(`Error connecting to FreeSWITCH ESL: ${o}`);
                });
                this.connection.on(ESLEvent.Connection.CLOSED, () => {
                    // Connection to FreeSWITCH closed!
                    reject('Connection to FreeSWITCH ESL closed');
                });
                this.connection.on(ESLEvent.Connection.READY, () => {
                    // Connection to FreeSWITCH established!
                    this.logger.info('Connection to FreeSWITCH ESL established');
                    resolve(this.connection);
                });
            }
        });

    /**
     *
     * @param cmd
     * @returns
     */
    private execute = async (cmd: string, async: boolean = true) => {
        try {
            await this.connect();
            return async
                ? this.connection.bgapi(cmd, (response: any) => response.getBody())
                : this.connection.api(cmd, (response: any) => response.getBody());
        } catch (error: any) {
            this.logger.error(error.message);
            throw error;
        }
    };
}
