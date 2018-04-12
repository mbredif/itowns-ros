import * as itowns from 'itowns';
import ROSProvider from './ROSProvider';
import * as THREE from 'three';

let positionOnGlobe = { longitude: 8.4317799209025, latitude: 49.014364070464, altitude: 1000 };
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
    material: {color: 0xff00dd, linewidth: 10}    
}));

globeView.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, () => {
    Promise.all(promises).then(function () {
        console.log("loading layers done")
    })
});

globeView.wgs84TileLayer.visible = false;

console.log('itowns', itowns);

var sphere = new THREE.Mesh(
        new THREE.SphereGeometry( 100000, 32, 32 ),
        new THREE.MeshBasicMaterial( {color: 0xffff00, depthTest: false} )
    );


var coords = new itowns.Coordinates('EPSG:4326', positionOnGlobe.longitude, positionOnGlobe.latitude, positionOnGlobe.altitude);
var p = coords.as('EPSG:4978').xyz();
sphere.position.set(p.x, p.y, p.z);
sphere.updateMatrix();
globeView.scene.add(sphere);

console.log(globeView.camera);
console.log(sphere.position);
