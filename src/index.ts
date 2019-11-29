import os from 'os';

import logger from './logger';

export const beaconDetectorResolver = new Promise(async $export => {
    let module;

    switch (os.type()) {
    case 'Darwin':
        module = await import('./BeaconDetector.mac');
        break;
    case 'Windows_NT':
        module = await import('./BeaconDetector.win');
        break;
    default:
        logger.error('BeaconDetector is not supported on this OS.');
    }

    $export(module);
});
