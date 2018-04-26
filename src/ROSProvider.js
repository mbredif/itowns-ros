import * as ROSLIB from 'roslib';
import * as ROS3D from 'ros3d';
import * as itowns from 'itowns';
import * as THREE from 'three';

function update(context, layer, node) {
    // necessary to request a redraw ???
    context.view.notifyChange(true);
}

function preprocessDataLayer(layer, view, scheduler) {
    // ROS initialization
    var ros = new ROSLIB.Ros(layer.ros);
    layer.client = layer.client || {};
    layer.client.ros = ros;

    // root object initialization  
    layer.object3d = new THREE.Object3D();
    layer.object3d.name = layer.client.topic;
    layer.client.rootObject = layer.object3d;

    ros.on('connection', () => {
        // debug info
        console.log('Connected to rosbridge server:', layer.ros.url);
        layer.client.ros.getTopics(x => console.log('topics:', x.topics));

        // create the ROS3D client
        if(layer.client.messageType === 'sensor_msgs/NavSatFix') {
            const crs = view.referenceCrs;
            layer.client.convert = layer.client.convert || function (lon, lat, alt) {
                var coords = new itowns.Coordinates('EPSG:4326', lon, lat, alt);
                return coords.as(crs).xyz();
            };
            layer.client = new ROS3D.NavSatFix(layer.client);
            layer.client.line.name = 'trajectory';
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

    ros.on('error', function(error) {
      console.warn('Error connecting to rosbridge server: ', layer.ros.url, error);
    });

    ros.on('close', function() {
      console.log('Connection to rosbridge server closed: ', layer.ros.url);
    });
    layer.update = layer.update || update;
    // console.log('layer:', layer);
}

function executeCommand(command) {
    // console.log('command:', command);
}

function register(view) {
    view.mainLoop.scheduler.addProtocolProvider('ros', this);
}

export default {
    preprocessDataLayer,
    executeCommand,
    register
};
