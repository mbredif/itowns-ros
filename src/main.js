import * as itowns from 'itowns';
import ROSProvider from './ROSProvider';

let positionOnGlobe = { longitude: 2.351323, latitude: 48.856712, altitude: 25000000 };
let viewerDiv = document.getElementById('viewerDiv');
let globeView = new itowns.GlobeView(viewerDiv, positionOnGlobe);

ROSProvider.register(globeView);

let promises = [];
promises.push(itowns.Fetcher.json('./layers/JSONLayers/DARK.json').then(function (result) {
    return globeView.addLayer(result);
}));

promises.push(globeView.addLayer({
    protocol: 'ros',
    id: 'ros',
    type: 'geometry',
    ros: { url: 'ws://localhost:9090' },
    topic: '/kitti/oxts/gps/fix',
    keep: 50,
    color: 0xff0000
}));

globeView.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, () => {
    Promise.all(promises).then(function () {
        console.log("loading layers done")
    })
});

