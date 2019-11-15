# Spot Electron SDK

This SDK provides spot beacon functionality for desktop (electron) apps.

# Usage

1. Instantiate the SDK with (optional) configuration object.

```javascript
const { BeaconDetector } =  require('spot-electron-sdk');
const detector = new BeaconDetector({
    beaconUUID: string,
    beaconDismissTimeoutSeconds: number,
    reportIntervalMillisecs: number
});
```
2. Subscribe to events

```javascript
detector.on('scanStart', () => {
    console.log('Beacon scanning started.');
});
detector.on('scanStartError', (error) => {
    console.log('Failed to start beacon scanning.', error);
});
detector.on('scanStop', () => {
    console.log('Beacon scanning stopped.');
});
detector.on('beacons', beacons  => {
    console.log('Beacons', beacons);
});
detector.on('bestBeacon', beacon  => {
    console.log('Best beacon', beacon);
});
```

3. Start detection

```javascript
detector.start();
```

4. Stop detection

```javascript
detector.stop();
```

# Reference

## Config object
`beaconUUID`: (Optional) The Beacon UUID to look for. Omit this to detect Jitsi beacons, but custom deployments should have their own ID.

`beaconDismissTimeoutSeconds`: (Optional) The timeout in seconds that the SDK waits before dismissing (not reporting anymore) a beacon that it stopped detecting. Min: 5s.

`reportIntervalMillisecs`: (Optional) The timeout in milliseconds the SDK reports newly detected devices (if any). Min: 2000ms.

## Events
`scanStart`: Scanning started.

`scanStartError`: The SDK failed to start the scanning. An error object is passed to the callback.

`scanStop`: Scanning stopped.

`beacons`: New list of beacons are available. An array of `Beacon` object is passed to the callback.

`bestBeacon`: A new _best_ (closest, most reliable... etc) beacon is available. A `Beacon` object is passed to the callback.

## Example
See `example.js` for code examples.
