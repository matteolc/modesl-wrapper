"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESLWrapper = exports.createESLWrapper = exports.ESLEvent = void 0;
const modules_1 = require("../modules");
const esl = require('modesl');
exports.ESLEvent = {
    Connection: {
        READY: 'esl::ready',
        CLOSED: 'esl::end',
        ERROR: 'error',
    },
    RECEIVED: 'esl::event::*::*',
    ALL_EVENTS: 'all',
};
function createESLWrapper(ctor, opts) {
    return new ctor(opts);
}
exports.createESLWrapper = createESLWrapper;
/**
 * ESL Wrapper class
 *
 */
class ESLWrapper {
    /**
     *
     * @param opts
     * @returns
     */
    constructor(opts) {
        /**
         *
         */
        this.listen = async () => {
            try {
                await this.connect();
                // Subscribe to all FreeSWITCH events
                this.connection.subscribe(exports.ESLEvent.ALL_EVENTS);
                this.connection.on(exports.ESLEvent.RECEIVED, (event) => {
                    // A new FreeSWITCH event has been received
                    // Notify channel manager, no need to wait
                    (0, modules_1.handleESLEvent)(this.logger, this.cblist, this.savelist, this.loglist, event);
                });
            }
            catch (error) {
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
        this.UUIDGetVar = async (uuid, variable) => {
            return await this.execute(`uuid_getvar ${uuid} ${variable}`);
        };
        /**
         *
         * @param uuid
         * @param cause
         * @returns
         */
        this.UUIDKill = async (uuid, cause) => {
            return await this.execute(`uuid_kill ${uuid} ${cause}`);
        };
        /**
         *
         * @param uuid
         * @param provider
         * @returns
         */
        this.UUIDTransfer = async (uuid, provider) => {
            return await this.execute(`uuid_transfer ${uuid} -both ${provider}`);
        };
        /**
         *
         * @param uuid
         * @param varlist
         * @returns
         */
        this.UUIDSetvarMulti = async (uuid, varlist) => {
            return this.execute(`uuid_setvar_multi ${uuid} ${varlist}`);
        };
        /**
         *
         * @param uuid
         * @param variable
         * @param value
         * @returns
         */
        this.UUIDSetvar = async (uuid, variable, value) => {
            return await this.execute(`uuid_setvar ${uuid} ${variable}=${value}`);
        };
        /**
         *
         * @returns
         */
        this.ReloadXML = async () => {
            return await this.execute(`reloadxml`);
        };
        /**
         *
         * @returns
         */
        this.connect = () => new Promise((resolve, reject) => {
            if (this.connection !== null && this.connection.connected()) {
                resolve(this.connection);
            }
            else {
                this.connection = new esl.Connection(this.conninfo.host, this.conninfo.port, this.conninfo.secret);
                this.connection.on(exports.ESLEvent.Connection.ERROR, (o) => {
                    // Error connecting to FreeSWITCH!
                    reject(`Error connecting to FreeSWITCH ESL: ${o}`);
                });
                this.connection.on(exports.ESLEvent.Connection.CLOSED, () => {
                    // Connection to FreeSWITCH closed!
                    reject('Connection to FreeSWITCH ESL closed');
                });
                this.connection.on(exports.ESLEvent.Connection.READY, () => {
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
        this.execute = async (cmd) => {
            try {
                await this.connect();
                return this.connection.bgapi(cmd, (response) => response.getBody());
            }
            catch (error) {
                this.logger.error(error.message);
                throw error;
            }
        };
        this.logger = opts.logger;
        this.conninfo = opts.conninfo;
        this.cblist = opts.cblist || [];
        this.savelist = opts.savelist || [];
        this.loglist = opts.loglist || [];
        this.connection = null;
        return this;
    }
}
exports.ESLWrapper = ESLWrapper;
