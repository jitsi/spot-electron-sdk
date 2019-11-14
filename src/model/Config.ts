/**
 * Model class representing the configuration of the SDK.
 */
export default class Config {
    /**
     * The beacon UUID to be used for ranging.
     */
    public beaconUUID: string;

    /**
     * The timeout in seconds to dismiss a beacon that we haven't seen in the last
     * {@code beaconDismissTimeoutSeconds} seconds.
     *
     * NOTE: 5 seconds is the min here due to the relatively long raw beacon detection interval.
     */
    public beaconDismissTimeoutSeconds: number;

    /**
     * The interval in millisecs for reporting detected devices.
     */
    public reportIntervalMillisecs: number;

    /**
     * Instantiates a new {@code Config} instance.
     *
     * @param {string} baseURL - The base URL to be used when connecting to the Spot instance (e.g. spot.jitsi.net).
     * @param {string} beaconUUID - The beacon UUID to be used for ranging.
     */
    constructor(config: {
        beaconUUID?: string;
        beaconDismissTimeoutSeconds?: number;
        reportIntervalMillisecs?: number;
    } = {}) {
        this.beaconUUID = config.beaconUUID || 'bf23c311-24ae-414b-b153-cf097836947f';
        this.beaconDismissTimeoutSeconds = Math.max(config.beaconDismissTimeoutSeconds || 10, 5);
        this.reportIntervalMillisecs = Math.max(config.reportIntervalMillisecs || 2000, 2000);
    }
}
