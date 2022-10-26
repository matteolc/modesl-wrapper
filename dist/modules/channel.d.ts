import { LoggerInterface, CallBackListInterface } from '../classes';
/**
 * FreeSWITCH ESL event names
 *
 */
export declare const FSEvent: {
    Channel: {
        STATE: string;
        CREATE: string;
        CALLSTATE: string;
        EXECUTE: string;
        EXECUTE_COMPLETE: string;
        API: string;
        BACKGROUND_JOB: string;
        PARK: string;
        UNPARK: string;
        OUTBOUND: string;
        ORIGINATE: string;
        OUTGOING: string;
        PROGRESS_MEDIA: string;
        CODEC: string;
        BRIDGE: string;
        UNBRIDGE: string;
        ANSWER: string;
        UPDATE: string;
        HANGUP: string;
        HANGUP_COMPLETE: string;
        DESTROY: string;
        HEARTBEAT: string;
        RE_SCHEDULE: string;
    };
};
/**
 * Do things with the ESL event
 *
 * @param event
 */
export declare const handleESLEvent: (logger: LoggerInterface, cblist: CallBackListInterface[], savelist: string[], loglist: string[], event: any) => Promise<void>;
