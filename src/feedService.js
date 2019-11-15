const WEBSOCKET_URL = "ws://52.43.85.86:8785/websocket";

let socket;
let msgSeqNum = 0;
let openCallback;
let msgCallback;

const handleConnectionOpen = () => {
  console.log('connection opened')
  openCallback()
}

const handleConnectionClose = () => {
  console.log('connection closed')
}

const handleMessage = (event) => {
  let subKey
  //console.log('message', event)  

  var eventData = event.data;
  if (eventData.substring(0,2) === "SB") { 
      return; // ignore subscription confirmations for now.
  }

  var message = JSON.parse(eventData);
  
  // this is a weak test, but so far only L2 has mmid.
  if (message.mmid === undefined) {                    
      subKey = new SubscriptionKey(
        message.symbol, 
        message.exchange, 
        message.carrier, 
        message.supplier, 
        "FOREXLEVEL1"
      );
      message.subKey = JSON.stringify(subKey);		
      msgCallback(message)
  } else {
      subKey = new SubscriptionKey(
        message.symbol, 
        message.exchange, 
        message.carrier, 
        message.supplier, 
        "FOREXLEVEL2"
      );
      message.subKey = JSON.stringify(subKey);		
      msgCallback(message)
  }
}

export const connect = (onOpenCallback, onMessageCallback) => {
  openCallback = onOpenCallback
	msgCallback = onMessageCallback
	
	let appType;
	
	if (typeof global.MozWebSocket !== "undefined") {
	   appType = "Mozilla";
	} else if (window.WebSocket) {
	   appType = "Chrome";
	} else {
	   return console.log('Error: web sockets not supported by this browser')
	}

	if (appType === "Mozilla") {
	   socket = new global.MozWebSocket(WEBSOCKET_URL);
	} else {
	   socket = new WebSocket(WEBSOCKET_URL);
	}
	
	socket.onopen = handleConnectionOpen
	socket.onclose = handleConnectionClose
	socket.onmessage = handleMessage
}

export class SubscriptionKey {
  constructor(symbol,market,carrier,supplier,level) {
  	this.symbol = symbol;
  	this.market = market;
  	this.carrier = carrier;
  	this.supplier = supplier;
  	this.level = level;
  }
  
  equals(other) {
		return (
		  other.symbol === this.symbol && 
		  other.market === this.market && 
		  other.carrier === this.carrier && 
		  other.supplier === this.supplier && 
		  other.level === this.level
		)
  }		
}

export const subscribe = (subscriptionKey, subscribe = true) => {
	const message = {
		"subscribe" : subscribe,
		"level" : subscriptionKey.level,
		"symbol" : subscriptionKey.symbol,
		"market" : subscriptionKey.market,
		"carrier" : subscriptionKey.carrier,
		"seqno" : ++msgSeqNum,
		"supplier" : subscriptionKey.supplier
	};
	
	const encoded = JSON.stringify(message);
	
	try {
  	socket.send("SB"+encoded);
	} catch(e) {
	  console.log('Error occurred while sending subscribe message', encoded)
	  console.log(e)
	}
}
