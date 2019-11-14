import noble from '@abandonware/noble';
import EventEmitter from 'events';
import _ from 'lodash';

import logger from './logger';
import { Beacon, Config, Peripherial } from './model';

/**
 * Base emitter class to emit high level detections for consumer apps.
 */
export default class BeaconDetector extends EventEmitter {
    /**
     * A map of all recently detected beacons mapped by join code.
     */
    beacons: Map<string, Beacon>;

    /**
     * The config object used by the emitter.
     */
    config: Config;

    /**
     * List of previously reported beacons to match and avoid unnecesary reporting.
     */
    lastReportedBeacons: Beacon[];

    /**
     * The beacon last reported to be the best.
     */
    lastReportedBestBeacon: Beacon | undefined;

    /**
     * Timeout reference to start/stop reporting timer.
     */
    reporterTimer: any;

    /**
     * Instantiates a new {@code BeaconEmitter}.
     *
     * @param config - The config object to use
     */
    constructor(config?: {
        beaconUUID?: string;
        beaconDismissTimeoutSeconds?: number;
        reportIntervalMillisecs?: number;
    }) {
        super();

        this.beacons = new Map();
        this.config = new Config(config);
        this.lastReportedBeacons = [];

        // Binding this
        this.onDiscover = this.onDiscover.bind(this);
        this.onScanStart = this.onScanStart.bind(this);
        this.onScanStop = this.onScanStop.bind(this);
        this.reportBeacons = this.reportBeacons.bind(this);

        // Setting event listeners
        noble.on('discover', this.onDiscover);
        noble.on('scanStart', this.onScanStart);
        noble.on('scanStop', this.onScanStop);
    }

    /**
     * Internal callback to handle discovered devices.
     *
     * @param device - The discovered device.
     */
    private onDiscover(device: Peripherial): void {
        const beacon = Beacon.parse(device);

        if (beacon && beacon.uuid === this.config.beaconUUID) {
            this.beacons.set(beacon.joinCode, beacon);
        }
    }

    /**
     * Internal callback to handle the start of the scanning.
     */
    private onScanStart(): void {
        this.reporterTimer = setInterval(this.reportBeacons, this.config.reportIntervalMillisecs);
        this.emit('scanStart');
        logger.info('Spot BLE scanning started.');
    }

    /**
     * Internal callback to handle the stop of the scanning.
     */
    private onScanStop(): void {
        clearInterval(this.reporterTimer);
        this.emit('scanStop');
        logger.info('Spot BLE scanning stopped.');
    }

    /**
     * A timed function to report the current state of the detection (if need be) for SDK consumers.
     */
    private reportBeacons(): void {
        // First, cleaning up all beacons that we didn't see for a given time.
        const valuesIterator = this.beacons.values();
        const now = Date.now();
        let beacon: Beacon;

        while ((beacon = valuesIterator.next().value) !== undefined) {
            if (beacon.lastSeen < now - (this.config.beaconDismissTimeoutSeconds * 1000)) {
                this.beacons.delete(beacon.joinCode);
            }
        }

        // Now create an array of remaining beacons and compare the changes
        // If there's a difference, we report the new list
        const sortedBeaconsArray = _.sortBy(Array.from(this.beacons.values()), [ 'uuid', 'joinCode' ]);

        if (this.shouldReportNewList(sortedBeaconsArray)) {
            this.emit('beacons', sortedBeaconsArray);

            logger.info('Beacons detected.', sortedBeaconsArray);

            // Please note: lastReportedBeacons is always sorted
            this.lastReportedBeacons = sortedBeaconsArray;
        }

        // We also need to report the current best detection
        if (sortedBeaconsArray.length) {
            const bestBeacon = _.nth(_.sortBy(sortedBeaconsArray, [ 'distance' ]), -1);

            if (bestBeacon && (!this.lastReportedBestBeacon
            || bestBeacon.joinCode !== this.lastReportedBestBeacon.joinCode
            || bestBeacon.proximity !== this.lastReportedBestBeacon.proximity)) {
                this.emit('bestBeacon', bestBeacon);
                logger.info('Best beacon updated.', bestBeacon);
                this.lastReportedBestBeacon = bestBeacon;
            }
        } else {
            // There is no best beacon
            this.emit('bestBeacon', undefined);
            logger.info('There is no current best beacon.');
            this.lastReportedBestBeacon = undefined;
        }
    }

    /**
     * Function to decide if the SDK should report a new list of beacons.
     *
     * @param newList - The list of currently available (detected) beacons.
     * @return {boolean}
     */
    private shouldReportNewList(newList: Beacon[]): boolean {
        if (newList.length !== this.lastReportedBeacons.length) {
            // Device count changed, we need to report for sure.
            return true;
        }

        for (let i = 0; i < newList.length; i++) {
            const b1 = newList[i];
            const b2 = this.lastReportedBeacons[i];

            if (b1.uuid !== b2.uuid || b1.joinCode !== b2.joinCode) {
                // There is at least one different device.
                return true;
            }
        }

        return false;
    }

    /**
     * Function to start the device detection.
     */
    public start(): void {
        noble.on('stateChange', (state: string) => {
            if (state === 'poweredOn') {
                noble.startScanning([], true, (error: Error) => {
                    if (error) {
                        this.emit('scanStartError', error);
                        logger.error('Error starting beacon scanner.', error);
                    }
                });
            }
        });
    }

    /**
     * Functio to stop the device detection.
     */
    public stop(): void {
        noble.stopScanning();
    }
}
