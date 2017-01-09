// Turing Machine
var machine = {
    table: {},
    startState: null,
    tape: [],
    steps: 0,
    head: 0,
    state: null,
    timer: null,
    isFast: false,
    interval: 50,
}

var msgOutput = null;
var highlight = null;
var drawCallback = null;

var directions = {
    'r': 1,
    'l': -1,
}

function makeTable(graph) {
    var m = machine;

    m.table = {}
    m.startState = null;

    var edges = graph.edges._data;
    var nodes = graph.nodes._data;
    for (var k in nodes) {
        v = nodes[k];
        if (m.table[k] == null) {
            m.table[k] = {
                extra: v.extra,
                label: v.label,
            };
        }
        if (v.extra == 'start' && m.startState == null) {
            m.startState = k;
        }
    }
    for (var k in edges) {
        v = edges[k];
        v.label.split(',').forEach(function (rule) {
            trans = rule.split('/');
            if (trans.length != 3) {
                msgOutput('transform must have 3 elements');
                console.error('transform must have 3 elements');
                return;
            }
            if (m.table[v.from][trans[0]] != null) {
                msgOutput('cannot have indetermined transition');
                console.error('cannot have indetermined transition');
                return;
            }
            m.table[v.from][trans[0]] = {
                nextSymbol: trans[1],
                direction: trans[2],
                nextState: v.to,
                edge: k,
                extra: v.extra,
            }
        });
    }
}

function reset(tape, interval) {
    var m = machine;
    m.tape = Array.from(tape.replace(/ /g, '_'));
    m.steps = 0;
    m.head = 0;
    m.state = m.startState;
    m.isFast = false;
    m.interval = interval;
    m.timer = null;
    drawCallback();
}

function start() {
    if (step()) {
        timer = window.setTimeout(start, machine.interval);
    }
}

function halt() {
    var m = machine;
    if (m.head < 0) {
        msgOutput('halt because tape is limited');
        console.log('halt because tape is limited');
        return true;
    }
    if (m.table[m.state] == null) {
        msgOutput('halt because no such state');
        console.log('halt because no such state');
        return true;
    }
    if (m.table[m.state].extra == 'accept' && getTransition() == null) {
        msgOutput('halt accept');
        console.log('halt accept');
        return true;
    }
    return false;
}

function step() {
    var m = machine;
    var trans = getTransition();
    if (trans != null) {
        m.state = trans.nextState;
        setSymbolToTape(trans.nextSymbol);
        if (directions.hasOwnProperty(trans.direction)) {
            m.head += directions[trans.direction];
        }
        m.steps++;

        highlight([m.state], [trans.edge])
        drawCallback();

        if (halt()) {
            return false;
        }
        return true;
    }
    return false;
}

function getSymbolFromTape() {
    var m = machine;
    if (m.head < m.tape.length) {
        return m.tape[m.head];
    } else {
        m.tape = m.tape.concat(Array.from('_'.repeat(m.tape.length)));
        return getSymbolFromTape();
    }
}

function setSymbolToTape(ch) {
    var m = machine;
    ch = ch == ' ' ? '_' : ch;
    m.tape[m.head] = ch;
}

function getTransition() {
    var m = machine;
    if (m.table[m.state] == null) {
        msgOutput(m.state, 'do not exits');
        console.error(m.state, 'do not exits');
        return false;
    }
    var symbol = getSymbolFromTape();
    var trans = m.table[m.state][symbol];
    if (trans == null) {
        msgOutput(symbol, m.table[m.state].label, 'do not exits');
        console.error(symbol, m.table[m.state].label, 'do not exits');
    }
    return trans;
}

module.exports = {
    machine: machine,
    reset: reset,
    start: start,
    step: step,
    makeTable: makeTable,
    setMsgOutput: function(output) {
        msgOutput = output;
    },
    setHighlightFunc: function(h) {
        highlight = h;
    },
    setDrawCallback: function(c) {
        drawCallback = c;
    }
}

window.mktable = makeTable;
window.machine = machine;