import logger from 'jitsi-meet-logger';

/**
 * An instantiated and configured {@code jitsi-meet-logger} instance.
 */
export default logger.getLogger('spot-electron-sdk', undefined, {
    disableCallerInfo: true
});
