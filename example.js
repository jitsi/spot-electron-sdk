const process = require('process');

const { beaconDetectorResolver } = require('./lib');

beaconDetectorResolver.then(({ default: BeaconDetector }) => {
    const detector = new BeaconDetector();

    // Subscribe to events

    /**
     * Event {@code scanStart}: Scan for devices started.
     */
    detector.on('scanStart', () => {
        console.log('Beacon scanning started.');
    });

    /**
     * Event {@code scanStop}: Scan for devices stopped.
     */
    detector.on('scanStop', () => {
        console.log('Beacon scanning stopped.');
    });


    /**
     * Event {@code beacons}: New list  of beacons detected.
     */
    detector.on('beacons', beacons => {
        console.log('Beacons', beacons);
    });

    /**
     * Event {@code bestBeacon}: The best (closest, most reliable) beacon is updated.
     */
    detector.on('bestBeacon', beacon => {
        console.log('Best beacon', beacon);
    });

    detector.start();

    setTimeout(() => {
        detector.stop();
        process.exit(0);
    }, STEP_TIMEOUT_MS);
});
