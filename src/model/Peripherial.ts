/**
 * Interface represents a raw BLE device detected by the library. An instance of this
 * device may or may not be a beacon.
 */
export default interface Peripherial {

    /**
     * Raw manufacturer data of the device.
     */
    advertisement: {
        manufacturerData: Buffer;
    };

    /**
     * Detected strength of the signal, used for distance calculations.
     */
    rssi: number;

    /**
     * UUID of the device. Please note, it's not the same UUID we use for the beacons.
     */
    uuid: string;
}
