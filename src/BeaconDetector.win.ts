import _ from 'lodash';
import AdvertisementAPI from '@jitsi/windows.devices.bluetooth.advertisement';
import StreamsAPI from '@jitsi/windows.storage.streams';

import AbstractBeaconDetector from './AbstractBeaconDetector';
import logger from './logger';
import { Config } from './model';

// Windows specific beacon device ID.
const BEACON_DEVICE_ID = '0215';

/**
 * Base emitter class to emit high level detections for consumer apps.
 */
export default class BeaconDetector extends AbstractBeaconDetector {
    watcher: AdvertisementAPI.BluetoothLEAdvertisementWatcher;

    /**
     * Instantiates a new BeaconDetector instance.
     *
     * @inheritdoc
     */
    constructor(config?: Config) {
        super(config);

        this.watcher = new AdvertisementAPI.BluetoothLEAdvertisementWatcher();
        this.watcher.ScanningMode = AdvertisementAPI.BluetoothLEScanningMode.active;
        this.setEventListeners();
    }

    /**
     * Sets the event listeners.
     */
    protected setEventListeners(): void {
        this.watcher.on('Received', (
                watcher: AdvertisementAPI.BluetoothLEAdvertisementWatcher,
                args: AdvertisementAPI.BluetoothLEAdvertisementReceivedEventArgs
        ) => {
            if (!args.advertisement.manufacturerData.size) {
                // This is not a beacon.
                return;
            }

            const manufacturerData = args.advertisement.manufacturerData.getAt(0).data;
            const reader = StreamsAPI.DataReader.fromBuffer(manufacturerData);
            const hexValue: string[] = [];

            while (reader.unconsumedBufferLength) {
                hexValue.push(_.padStart(reader.readByte().toString(16), 2, '0'));
            }

            const manufecturerDataString = hexValue.join('');

            if (!manufecturerDataString.startsWith(BEACON_DEVICE_ID)) {
                // This is not a beacon.
                return;
            }

            reader.close();

            this.onDiscover(manufecturerDataString.slice(4), args.rawSignalStrengthInDBm);
        });

        this.watcher.on('Stopped', this.onScanStop);

        // this API doesn't provide a 'Started' event
    }

    /**
     * Function to start the device detection.
     */
    public start(): void {
        try {
            this.watcher.start();

            // This API doesn't provide a 'Started' event, so we fake it, assuming that
            // if we don't run into an error by here, we're good.
            this.onScanStart();
        } catch (error) {
            logger.error('Error starting beacon scanner.', error);
            this.onScanStartError(error);
        }
    }

    /**
     * Functio to stop the device detection.
     */
    public stop(): void {
        this.watcher.stop();
    }
}
