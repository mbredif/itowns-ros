import * as ROSLIB from 'roslib';
import * as ROS3D from 'ros3d';
import * as itowns from 'itowns';
import * as THREE from 'three';

function update(context, layer, node) {
    //console.log('ros update', context, layer, node);
    //layer.ros.getTopics(console.log);
}

function convert(lon, lat, alt) {
    var coords = new itowns.Coordinates('EPSG:4326', lon, lat, alt);
    return coords.as('EPSG:4978').xyz();
}

function assignLayer(object, layer) {
    if (object) {
        object.layer = layer.id;
        object.layers.set(layer.threejsLayer);
        for (const c of object.children) {
            assignLayer(c, layer);
        }
        return object;
    }
}
function onConnect(layer, view) {
    return function() {
      console.log('Connected to websocket server.');
      layer.ros.getTopics(x => console.log('preprocessDataLayer', x));
      layer.convert = convert;
      layer.rootObject = new THREE.Group();
      layer.object3d = layer.rootObject;
      layer.client = new ROS3D.NavSatFix(layer);
      console.log('NavSatFix', layer);
      assignLayer(layer.rootObject, layer);
      view.camera.camera3D.layers.enable(layer.threejsLayer);
    };
}


function preprocessDataLayer(layer, view, scheduler) {

  //ROS initialization
  layer.ros = new ROSLIB.Ros(layer.ros);
  layer.ros.on('connection', onConnect(layer, view));

  layer.ros.on('error', function(error) {
      console.log('Error connecting to websocket server: ', error);
  });

  layer.ros.on('close', function() {
      console.log('Connection to websocket server closed.');
  });

  console.log('preprocessDataLayer', layer);
  layer.update = layer.update || update;
}

function executeCommand(command) {
  console.log('executeCommand', command.layer.ros);
}

function register(view) {
    view.mainLoop.scheduler.addProtocolProvider('ros', this);
}

export default {
    preprocessDataLayer,
    executeCommand,
    register
};
