import noble from '@abandonware/noble';

import AbstractBeaconDetector from './AbstractBeaconDetector';
import logger from './logger';
import { Config, Peripherial } from './model';

// Mac specific beacon device ID.
const BEACON_DEVICE_ID = '4c000215';

// Noble state required to start scanning.
const START_REQUIRED_STATE = 'poweredOn';

/**
 * Base emitter class to emit high level detections for consumer apps.
 */
export default class BeaconDetector extends AbstractBeaconDetector {
    /**
     * Instantiates a new BeaconDetector instance.
     *
     * @inheritdoc
     */
    constructor(config?: Config) {
        super(config);

        this.setEventListeners();
    }

    /**
     * Sets the event listeners.
     */
    protected setEventListeners(): void {
        noble.on('discover', (peripherial: Peripherial) => {
            // parse manufacturer data here
            const { manufacturerData } = peripherial.advertisement;

            if (!manufacturerData) {
                // This is not a beacon
                return;
            }

            const dataString = manufacturerData.toString('hex').toLowerCase();

            if (!dataString.startsWith(BEACON_DEVICE_ID)) {
                // This is not a beacon
                return;
            }

            const rawData = dataString.slice(8);

            this.onDiscover(rawData, peripherial.rssi);
        });
        noble.on('scanStart', this.onScanStart);
        noble.on('scanStop', this.onScanStop);
    }

    /**
     * Function to start the device detection.
     */
    public start(): void {
        this.waitForPoweredOn().then(() => {
            noble.startScanning([], true, (error: Error) => {
                if (error) {
                    this.onScanStartError(error);
                    logger.error('Error starting beacon scanner.', error);
                }
            });
        });
    }

    /**
     * Functio to stop the device detection.
     */
    public stop(): void {
        noble.stopScanning();
    }

    /**
     * Ensures that the bluetooth hardware is in powered on state.
     */
    private waitForPoweredOn(): Promise<void> {
        if (noble.state === START_REQUIRED_STATE) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            noble.on('stateChange', (state: string) => {
                if (state === START_REQUIRED_STATE) {
                    resolve();
                }
            });
        });

    }
}
