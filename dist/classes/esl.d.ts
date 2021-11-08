export declare const ESLEvent: {
    Connection: {
        READY: string;
        CLOSED: string;
        ERROR: string;
    };
    RECEIVED: string;
    ALL_EVENTS: string;
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
    cblist?: CallBackListInterface[];
    savelist?: string[];
    loglist?: string[];
}
export interface ESLWrapperInterface {
    listen: () => Promise<void>;
    ReloadXML: () => Promise<string>;
    UUIDGetVar: (u: string, v: string) => Promise<string>;
    UUIDKill: (u: string, v: string) => Promise<string>;
    UUIDTransfer: (u: string, d: string, c: string, p: string) => Promise<string>;
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
export declare function createESLWrapper(ctor: ESLWrapperConstructor, opts: ESLWrapperOpts): ESLWrapperInterface;
/**
 * ESL Wrapper class
 *
 */
export declare class ESLWrapper implements ESLWrapperInterface {
    logger: LoggerInterface;
    conninfo: ESLConnectionOpts;
    cblist: CallBackListInterface[];
    savelist: string[];
    loglist: string[];
    connection: any;
    /**
     *
     * @param opts
     * @returns
     */
    constructor(opts: ESLWrapperOpts);
    /**
     *
     */
    listen: () => Promise<void>;
    /**
     *
     * @param uuid
     * @param variable
     * @returns
     */
    UUIDGetVar: (uuid: string, variable: string) => Promise<any>;
    /**
     *
     * @param uuid
     * @param cause
     * @returns
     */
    UUIDKill: (uuid: string, cause: string) => Promise<any>;
    /**
     *
     * @param uuid
     * @param provider
     * @returns
     */
    UUIDTransfer: (uuid: string, destexten: string, context: string, dialplan?: string) => Promise<any>;
    /**
     *
     * @param uuid
     * @param varlist
     * @returns
     */
    UUIDSetvarMulti: (uuid: string, varlist: string) => Promise<any>;
    /**
     *
     * @param uuid
     * @param variable
     * @param value
     * @returns
     */
    UUIDSetvar: (uuid: string, variable: string, value: any) => Promise<any>;
    /**
     *
     * @param ostring
     * @returns
     */
    Originate: (ostring: string) => Promise<any>;
    /**
     *
     * @returns
     */
    ReloadXML: () => Promise<any>;
    /**
     *
     * @returns
     */
    private connect;
    /**
     *
     * @param cmd
     * @returns
     */
    private execute;
}
