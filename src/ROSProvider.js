import * as ROSLIB from 'roslib';
import * as ROS3D from 'ros3d';
import * as itowns from 'itowns';
import * as THREE from 'three';

function update(context, layer, node) {
}

function preprocessDataLayer(layer, view) {
    // ROS initialization
    layer.url = layer.ros.url;
    if(layer.url) {
        layer.ros = new ROSLIB.Ros(layer.ros);
    } else if(layer.ros.websocket) {
        layer.url = layer.ros.websocket.url;
    }

    // client setup
    layer.client = layer.client || {};
    layer.client.ros = layer.ros;

    // root object initialization  
    layer.object3d = new THREE.Object3D();
    layer.object3d.name = layer.client.topic;
    layer.client.rootObject = layer.object3d;

    function wrap(layer, fun) {
        return function() {
            layer.client.dispatchEvent({ type: 'update' });
            return fun(...arguments);
        }
    }

    layer.ros.on('connection', () => {
        // debug info
        console.log('Connected to rosbridge server:', layer.url);
        layer.client.ros.getTopics(x => console.log('topics:', x.topics));

        // create the ROS3D client
        if(layer.client.messageType === 'sensor_msgs/NavSatFix') {
            const crs = view.referenceCrs;
            layer.client.convert = wrap(layer, layer.client.convert || function (lon, lat, alt) {
                var coords = new itowns.Coordinates('EPSG:4326', lon, lat, alt);
                return coords.as(crs).xyz();
            });
            layer.client = new ROS3D.NavSatFix(layer.client);
            layer.client.line.name = 'trajectory';
            layer.client.addEventListener('update', () => view.notifyChange(true));
        } else {
            console.error('ROS messages of type "'+layer.client.messageType+'" are not supported (yet)');
        }

        // necessary for picking ???
        layer.client.rootObject.traverse((obj) => {
            obj.frustumCulled = false;
            obj.layer = layer.id;
            obj.layers.set(layer.threejsLayer);
        });
        view.camera.camera3D.layers.enable(layer.threejsLayer);
    });

    layer.ros.on('error', function(error) {
      console.warn('Error connecting to rosbridge server: ', layer.url, error);
    });

    layer.ros.on('close', function() {
      console.log('Connection to rosbridge server closed: ', layer.url);
    });
    layer.update = layer.update || update;
}

function executeCommand(command) {
}

function register(view) {
    view.mainLoop.scheduler.addProtocolProvider('ros', this);
}

export default {
    preprocessDataLayer,
    executeCommand,
    register
};
