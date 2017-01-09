console.log('app.js');

var vis = require('vis/dist/vis.js');
var util = require('./util.js');
var turing = require('./turing.js');

// DOM element where the Timeline will be attached
var container = document.getElementById('visualization');

var nodes = null;
var edges = null;
var network = null;
// randomly create some nodes and edges
var data = null;
var seed = 2;
var env = {};

function destroy() {
    if (network !== null) {
        network.destroy();
        network = null;
    }
}

function makeColor(color) {
    return {
        border: '#2B7CE9',
        background: color,
        highlight: {
            border: '#2B7CE9',
            background: 'red'
        }
    }
}

function resetData() {
    nodes = [{
        id: util.guid(),
        label: 'q0',
        color: makeColor('orange'),
        extra: 'start'
    }, {
        id: util.guid(),
        label: 'q1',
        color: makeColor('green'),
        extra: 'accept'
    }];
    edges = [];
    data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    }
}

function draw() {
    destroy();
    resetData();

    var container = document.getElementById('mynetwork');
    var options = {
        layout: {
            randomSeed: 2
        },
        interaction: {
            hover: true
        },
        nodes: {
            font: {
                size: 14
            },

        },
        manipulation: {
            addNode: function (data, callback) {
                data.extra = '';
                doPopUp("Add Node", saveNode, data, callback);
            },
            editNode: function (data, callback) {
                doPopUp("Edit Node", saveNode, data, callback);
            },
            addEdge: function (data, callback) {
                console.log('addEdge', data);
                data.id = util.guid();
                data.arrows = 'to';
                data.label = '0/1/r';
                data.extra = '';
                doPopUp("Add Edge", saveEdge, data, callback);
            },
            editEdge: function (data, callback) {
                console.log('editEdge', data);
                data.arrows = 'to';
                data.label = '0/1/r';
                data.extra = '';
                doPopUp("Edit Edge", saveEdge, data, callback);
            },
            deleteNode: function (data, callback) {
                console.log('deleteNode', data);
                callback(data);
            },
            deleteEdge: function (data, callback) {
                console.log('deleteEdge', data);
                callback(data);
            },
        }
    };
    network = new vis.Network(container, data, options);

    window.network = network;
    window.env = env;
    env.data = data;
}

function doPopUp(title, saveFunc, data, callback) {
    document.getElementById('operation').innerHTML = title;
    document.getElementById('node-label').value = data.label;
    document.getElementById('node-extra').value = data.extra;
    document.getElementById('saveButton').onclick = saveFunc.bind(null, data, callback);
    document.getElementById('cancelButton').onclick = clearPopUp.bind();
    document.getElementById('network-popUp').style.display = 'block';
}

function clearPopUp() {
    document.getElementById('saveButton').onclick = null;
    document.getElementById('cancelButton').onclick = null;
    document.getElementById('network-popUp').style.display = 'none';
}

function cancelEdit(callback) {
    clearPopUp();
    callback(null);
}

function saveNode(data, callback) {
    data.label = document.getElementById('node-label').value;
    data.extra = document.getElementById('node-extra').value;
    switch (data.extra) {
        case 'start':
            data.color = makeColor('orange');
            break;
        case 'accept':
            data.color = makeColor('green');
            break;
        default:
            data.color = makeColor('cyan');
            break;
    }
    clearPopUp();
    callback(data);
    console.log('save data', data);
}

function saveEdge(data, callback) {
    data.label = document.getElementById('node-label').value;
    data.extra = document.getElementById('node-extra').value;
    clearPopUp();
    callback(data);
    console.log('save data', data);
}

function init() {
    var msgArea = document.getElementById("msgArea");
    var msgOutput = function (...msg) {
        msgArea.value = msg.join(' ');
    }
    turing.setMsgOutput(msgOutput);

    var highlight = function (n, e) {
        network.unselectAll();
        network.setSelection({
            nodes: n,
            edges: e
        });
    }
    turing.setHighlightFunc(highlight);

    var stepArea = document.getElementById("stepArea");
    var tapeLeft = document.getElementById("tapeLeft");
    var tapeRight = document.getElementById("tapeRight");
    var tapeHead = document.getElementById("tapeHead");
    var drawCallback = function() {
        var head = turing.machine.head;
        var len = turing.machine.tape.length;
        var tape = turing.machine.tape;
        stepArea.innerText = turing.machine.steps;
        tapeLeft.innerText = '';
        tapeRight.innerText = '';

        if(head > 0) {
            tapeLeft.innerText = tape.slice(0, head).join('');
        }
        tapeHead.innerText = tape[head] == undefined ? '_' : tape[head];
        if(len-1-head > 0){
            tapeRight.innerText = tape.slice(head+1, len).join('');
        }
        network.redraw();
    }
    turing.setDrawCallback(drawCallback);

    document.getElementById('restoreWorkspaceBtn')
        .addEventListener('change', function (evt) {
            var files = evt.target.files;
            var reader = new FileReader();
            reader.onload = function (e) {
                str = e.target.result;
                restoreWorkspace(str);
            }
            reader.readAsText(files[0]);
        }, false);
    document.getElementById('saveWorkspaceBtn')
        .addEventListener('click', function (evt) {
            saveWorkspace();
        }, false);
    document.getElementById('buildBtn')
        .addEventListener('click', function (evt) {
            turing.makeTable(data);
        }, false);
    document.getElementById('resetBtn')
        .addEventListener('click', function (evt) {
            network.unselectAll();
            turing.reset(
                document.getElementById("tapeInput").value,
                parseInt(document.getElementById('intervalInput').value));
        }, false);
    document.getElementById('startBtn')
        .addEventListener('click', function (evt) {
            turing.start();
        }, false);
    document.getElementById('stepBtn')
        .addEventListener('click', function (evt) {
            turing.step();
        }, false);

    draw();
}

function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {
        type: type
    });
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

function saveWorkspace() {
    download(JSON.stringify({
        data: data
    }), 'save.tmws', 'tmws');
}

function restoreWorkspace(str) {
    snapshot = JSON.parse(str);
    data = {
        nodes: obj2DataSet(snapshot.data.nodes),
        edges: obj2DataSet(snapshot.data.edges)
    }
    network.setData(data);
    network.redraw();
    env.data = data;
}

function obj2DataSet(obj) {
    var ds = new vis.DataSet();
    for (var prop in obj) {
        ds[prop] = obj[prop];
    }
    return ds;
}

document.body.onload = init;
window.turing = turing;