import { getDateTimeFromStringUepoch, writeFileToDateTimePath } from '../utils';
import { LoggerInterface, CallBackListInterface, ESLEvent } from '../classes';
import { ceil, compact, round, isNil } from 'lodash';
import { DateTime } from 'luxon';

/**
 * FreeSWITCH ESL event names
 *
 */
export const FSEvent = {
    Channel: {
        STATE: 'CHANNEL_STATE',
        CREATE: 'CHANNEL_CREATE',
        CALLSTATE: 'CHANNEL_CALLSTATE',
        EXECUTE: 'CHANNEL_EXECUTE',
        EXECUTE_COMPLETE: 'CHANNEL_EXECUTE_COMPLETE',
        API: 'API',
        BACKGROUND_JOB: 'BACKGROUND_JOB',
        PARK: 'CHANNEL_PARK',
        UNPARK: 'CHANNEL_UNPARK',
        OUTBOUND: 'CHANNEL_OUTGOING',
        ORIGINATE: 'CHANNEL_ORIGINATE',
        OUTGOING: 'CHANNEL_OUTGOING',
        PROGRESS_MEDIA: 'CHANNEL_PROGRESS_MEDIA',
        CODEC: 'CODEC',
        BRIDGE: 'CHANNEL_BRIDGE',
        UNBRIDGE: 'CHANNEL_UNBRIDGE',
        ANSWER: 'CHANNEL_ANSWER',
        UPDATE: 'CALL_UPDATE',
        HANGUP: 'CHANNEL_HANGUP',
        HANGUP_COMPLETE: 'CHANNEL_HANGUP_COMPLETE',
        DESTROY: 'CHANNEL_DESTROY',
        HEARTBEAT: 'HEARTBEAT',
        RE_SCHEDULE: 'RE_SCHEDULE',
    },
};

/**
 * Save ESL event to JSON file
 *
 * @param event
 * @returns
 */
const saveEventToJSONFile = async (event: any): Promise<void> => {
    const obj: any = {};
    event['headers'].map((h: any) => {
        obj[h.name] = h.value;
    });
    const fname = compact([
        DateTime.now().toMillis(),
        event.getHeader('Event-Date-Timestamp'),
        event.getHeader('Call-Direction'),
        event.getHeader('Event-Name'),
        event.getHeader('Channel-State'),
        event.getHeader('Channel-Call-State'),
    ]).join('-');

    const ts = getDateTimeFromStringUepoch(event.getHeader('Event-Date-Timestamp'));
    await writeFileToDateTimePath(fname, 'data/esl', JSON.stringify(obj, null, '\t'), ts);
};

/**
 * Do things with the ESL event
 *
 * @param event
 */
export const handleESLEvent = async (
    logger: LoggerInterface,
    cblist: CallBackListInterface[],
    savelist: string[],
    loglist: string[],
    event: any,
) => {
    const shouldILog = () => {
        return loglist.includes(eventName) || loglist.includes(ESLEvent.ALL_EVENTS);
    };

    const [eventName, eventTxTime, CallUUID, CallDirection, ChannelState, ChannelCallState] = [
        event.getHeader('Event-Name'),
        DateTime.now().toMillis() - ceil(parseInt(event.getHeader('Event-Date-Timestamp')) / 1e3),
        event.getHeader('Unique-ID'),
        event.getHeader('Call-Direction'),
        event.getHeader('Channel-State'),
        event.getHeader('Channel-Call-State'),
    ];
    const LogPrefix = compact([
        CallUUID,
        eventName === (FSEvent.Channel.HEARTBEAT || FSEvent.Channel.RE_SCHEDULE)
            ? ''
            : CallDirection === 'inbound'
            ? 'INGRESS'
            : 'EGRESS',
        eventName,
        event.getHeader('Channel-Name'),
        `${eventTxTime}ms`,
        ChannelState,
        ChannelCallState,
        event.getHeader('Channel-Name'),
        event.getHeader('Event-Calling-File'),
        event.getHeader('Event-Calling-Function'),
    ]).join(' | ');

    // save to JSON file
    savelist.includes(eventName) && saveEventToJSONFile(event);

    // do some logging
    switch (eventName) {
        case FSEvent.Channel.HEARTBEAT:
            shouldILog() &&
                logger.debug(
                    [
                        LogPrefix,
                        event.getHeader('Event-Info'),
                        `IPv4: ${event.getHeader('FreeSWITCH-IPv4')}`,
                        `Idle CPU: ${round(parseInt(event.getHeader('Idle-CPU')), 1)}%`,
                        event.getHeader('FreeSWITCH-Version'),
                        event.getHeader('Up-Time'),
                        `Sessions: ${event.getHeader('Session-Count')}`,
                        `SPS/Last: ${event.getHeader('Session-Per-Sec-Last')}`,
                        `SPS/Max: ${event.getHeader('Session-Per-Sec-Max')}`,
                        `SPS/5m: ${event.getHeader('Session-Per-Sec-FiveMin')}`,
                        `Total sessions: ${event.getHeader('Session-Since-Startup')}`,
                        `Sessions peak: ${event.getHeader('Session-Peak-Max')}`,
                        `Sessions peak (last 5m): ${event.getHeader('Session-Peak-FiveMin')}`,
                    ].join(' | '),
                );
            break;
        case FSEvent.Channel.STATE:
        case FSEvent.Channel.CALLSTATE:
        case FSEvent.Channel.ANSWER:
        case FSEvent.Channel.UPDATE:
        case FSEvent.Channel.UNBRIDGE:
        case FSEvent.Channel.CODEC:
        case FSEvent.Channel.OUTBOUND:
        case FSEvent.Channel.ORIGINATE:
        case FSEvent.Channel.DESTROY:
        case FSEvent.Channel.PARK:
            shouldILog() && logger.debug(LogPrefix);
            break;
        case FSEvent.Channel.CREATE:
            shouldILog() &&
                logger.debug(
                    [
                        LogPrefix,
                        getDateTimeFromStringUepoch(event.getHeader('Caller-Channel-Created-Time')),
                        event.getHeader('Caller-Network-Addr'),
                        event.getHeader('Caller-Orig-Caller-ID-Number'),
                        event.getHeader('Caller-Destination-Number').replace('%2B', '+'), // should be %2b to correctly URI decode
                    ].join(' | '),
                );
            break;
        case FSEvent.Channel.EXECUTE:
            shouldILog() &&
                logger.debug(
                    [
                        LogPrefix,
                        event.getHeader('Application-UUID'),
                        event.getHeader('variable_current_application'),
                        event.getHeader('variable_current_application_data'),
                    ].join(' | '),
                );
            break;
        case FSEvent.Channel.EXECUTE_COMPLETE:
            shouldILog() &&
                logger.debug(
                    [
                        LogPrefix,
                        event.getHeader('Application-UUID'),
                        event.getHeader('variable_current_application'),
                        event.getHeader('variable_current_application_data'),
                        event.getHeader('Application-Response'),
                    ].join(' | '),
                );
            break;
        case FSEvent.Channel.API:
            shouldILog() &&
                logger.debug(
                    [LogPrefix, event.getHeader('API-Command'), event.getHeader('API-Command-Argument')].join(' | '),
                );
            break;
        case FSEvent.Channel.BACKGROUND_JOB:
            shouldILog() &&
                logger.debug(
                    [
                        LogPrefix,
                        event.getHeader('Job-UUID'),
                        event.getHeader('Job-Command'),
                        event.getHeader('Job-Command-Arg'),
                    ].join(' | '),
                );
            break;
        case FSEvent.Channel.UNPARK:
            shouldILog() &&
                logger.debug(
                    [
                        LogPrefix,
                        event.getHeader('variable_outbound_bridge_string'),
                        event.getHeader('variable_transfer_source'),
                        event.getHeader('variable_transfer_history'),
                        `${ceil(
                            (parseInt(event.getHeader('Caller-Profile-Created-Time')) -
                                parseInt(event.getHeader('Caller-Channel-Created-Time'))) /
                                1e6,
                            3,
                        )}s`,
                    ].join(' | '),
                );
            break;
        case FSEvent.Channel.OUTGOING:
            shouldILog() && logger.debug([LogPrefix, event.getHeader('Other-Leg-Unique-ID')].join(' | '));
            break;
        case FSEvent.Channel.PROGRESS_MEDIA:
            shouldILog() &&
                logger.debug(
                    compact([
                        LogPrefix,
                        event.getHeader('variable_endpoint_disposition'),
                        `${event.getHeader('variable_local_media_ip')}:${event.getHeader('variable_local_media_port')}`,
                        event.getHeader('variable_advertised_media_ip'),
                        `${event.getHeader('variable_remote_media_ip')}:${event.getHeader(
                            'variable_remote_media_port',
                        )}`,
                        event.getHeader('variable_rtp_last_audio_codec_string'),
                    ]).join(' | '),
                );
            break;
        case FSEvent.Channel.BRIDGE:
            shouldILog() &&
                logger.debug(
                    [
                        LogPrefix,
                        event.getHeader('variable_originate_disposition'),
                        event.getHeader('variable_originated_legs'),
                        `${ceil(
                            (parseInt(event.getHeader('Caller-Channel-Bridged-Time')) -
                                parseInt(event.getHeader('Caller-Channel-Created-Time'))) /
                                1e6,
                            3,
                        )}s`,
                    ].join(' | '),
                );
            break;
        case FSEvent.Channel.HANGUP:
            shouldILog() &&
                logger.debug(
                    compact([
                        LogPrefix,
                        event.getHeader('Hangup-Cause'),
                        event.getHeader('variable_hangup_cause_q850'),
                        event.getHeader('variable_proto_specific_hangup_cause'),
                        event.getHeader('variable_last_bridge_proto_specific_hangup_cause'),
                        event.getHeader('variable_last_bridge_hangup_cause'),
                        event.getHeader('variable_originate_causes'),
                    ]).join(' | '),
                );
            break;
        case FSEvent.Channel.HANGUP_COMPLETE:
            shouldILog() &&
                logger.debug(
                    compact([
                        LogPrefix,
                        `Duration: ${event.getHeader('variable_flow_billsec')}s`,
                        `Bill: ${event.getHeader('variable_billsec')}s`,
                        `PDD: ${ceil(event.getHeader('variable_progress_mediamsec') / 1000, 3)}s`,
                        event.getHeader('Hangup-Cause'),
                        event.getHeader('variable_hangup_cause_q850'),
                        event.getHeader('variable_proto_specific_hangup_cause'),
                        event.getHeader('variable_last_bridge_proto_specific_hangup_cause'),
                        event.getHeader('variable_last_bridge_hangup_cause'),
                        event.getHeader('variable_originate_causes'),
                    ]).join(' | '),
                );
            break;
        default:
            break;
    }

    // apply callback
    const cb = cblist.find((cb: CallBackListInterface) => cb.event === eventName);
    !isNil(cb) && cb.apply(event);
};
