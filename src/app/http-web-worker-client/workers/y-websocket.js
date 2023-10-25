import * as Y from "yjs"; // eslint-disable-line
import * as bc from 'lib0/broadcastchannel.js'
import * as time from 'lib0/time.js'
import * as encoding from 'lib0/encoding.js'
import * as decoding from 'lib0/decoding.js'
import * as syncProtocol from 'y-protocols/sync.js'
import * as authProtocol from 'y-protocols/auth.js'
import * as awarenessProtocol from 'y-protocols/awareness.js'
import * as mutex from 'lib0/mutex.js'
import { Observable } from 'lib0/observable.js'
import * as math from 'lib0/math.js'
import * as url from 'lib0/url.js'
// import { toBase64, fromBase64 } from 'lib0/buffer.js'

function toBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// organization 
// ( warehouse
//   menu
//   profiles )


const messageSync = 0
const messageQueryAwareness = 3
const messageAwareness = 1
const messageAuth = 2
const messageSubDocSync = 4

/**
 *                       encoder,          decoder,          provider,          emitSynced, messageType
 * @type {Array<function(encoding.Encoder, decoding.Decoder, WebsocketProvider, boolean,    number):void>}
 */
const messageHandlers = []

messageHandlers[messageSync] = (encoder, decoder, provider, emitSynced, messageType) => {
  encoding.writeVarUint(encoder, messageSync)
  const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, provider.doc, provider)
  if (emitSynced && syncMessageType === syncProtocol.messageYjsSyncStep2 && !provider.synced) {
    provider.synced = true
  }
}

messageHandlers[messageQueryAwareness] = (encoder, decoder, provider, emitSynced, messageType) => {
  encoding.writeVarUint(encoder, messageAwareness)
  encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(provider.awareness, Array.from(provider.awareness.getStates().keys())))
}

messageHandlers[messageAwareness] = (encoder, decoder, provider, emitSynced, messageType) => {
  awarenessProtocol.applyAwarenessUpdate(provider.awareness, decoding.readVarUint8Array(decoder), provider)
}

messageHandlers[messageAuth] = (encoder, decoder, provider, emitSynced, messageType) => {
  authProtocol.readAuthMessage(decoder, provider.doc, permissionDeniedHandler)
}

messageHandlers[messageSubDocSync] = (encoder, decoder, provider, emitSynced, messageType) => {
  const subDocID = decoding.readVarString(decoder);
  console.log(subDocID);
  encoding.writeVarUint(encoder, messageSync)
  const subDoc = provider.getSubDoc(subDocID)
  if (subDoc) {
    const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, subDoc, provider)
    
    if (emitSynced && syncMessageType === syncProtocol.messageYjsSyncStep2) {
      provider.allSubdocumentsGuids = provider.allSubdocumentsGuids.filter((id) => id != subDocID);
      const [prefix, parentID, suffix] = subDocID.split(".");
      // if(suffix == "organization") {
        provider.subscribeToSubdocs(subDoc, "subdocs", suffix);
        subDoc.getMap("subdocs").forEach((s, key) => {
          if(s && !s.isSynced) {
            s.load();
          }
        });
      // }
      subDoc.emit('synced', [true]);
      subDoc.isSynced = true;
    }
  }
}


const reconnectTimeoutBase = 1200
const maxReconnectTimeout = 2500
// @todo - this should depend on awareness.outdatedTime
const messageReconnectTimeout = 30000

/**
 * @param {WebsocketProvider} provider
 * @param {string} reason
 */
const permissionDeniedHandler = (provider, reason) =>
  console.warn(`Permission denied to access ${provider.url}.\n${reason}`)

/**
 * @param {WebsocketProvider} provider
 * @param {Uint8Array} buf
 * @param {boolean} emitSynced
 * @return {encoding.Encoder}
 */
const readMessage = (provider, buf, emitSynced) => {
  const decoder = decoding.createDecoder(buf)
  const encoder = encoding.createEncoder()
  const messageType = decoding.readVarUint(decoder)
  const messageHandler = provider.messageHandlers[messageType]
  if (/** @type {any} */ (messageHandler)) {
    messageHandler(encoder, decoder, provider, emitSynced, messageType)
  } else {
    console.error('Unable to compute message')
  }
  return encoder
}

/**
 * @param {WebsocketProvider} provider
 */
const setupWS = (provider) => {
  if (provider.shouldConnect && provider.ws === null) {
    const websocket = new provider._WS(provider.url)
    websocket.binaryType = 'arraybuffer'
    provider.ws = websocket
    provider.wsconnecting = true
    provider.wsconnected = false
    provider.synced = false

    websocket.onmessage = (event) => {
      provider.wsLastMessageReceived = time.getUnixTime()

      try {
        const encoder = readMessage(
          provider,
          new Uint8Array(event.data),
          true
        )
        if (encoding.length(encoder) > 1) {
          websocket.send(encoding.toUint8Array(encoder));
        }
      } catch (ex) {
        console.error('Malformed web-server response')
        // console.error(ex)
      }
    }
    websocket.onclose = () => {
      provider.ws = null
      provider.wsconnecting = false
      if (provider.wsconnected) {
        provider.wsconnected = false
        provider.synced = false
        // update awareness (all users except local left)
        awarenessProtocol.removeAwarenessStates(
          provider.awareness,
          //@ts-ignore
          Array.from(provider.awareness.getStates().keys()).filter(
            (client) => client !== provider.doc.clientID
          ),
          provider
        )
        provider.emit('status', [
          {
            status: 'disconnected',
          },
        ])
      } else {
        provider.wsUnsuccessfulReconnects++
      }
      // Start with no reconnect timeout and increase timeout by
      // log10(wsUnsuccessfulReconnects).
      // The idea is to increase reconnect timeout slowly and have no reconnect
      // timeout at the beginning (log(1) = 0)
      setTimeout(
        setupWS,
        math.min(
          math.log10(provider.wsUnsuccessfulReconnects + 1) *
            reconnectTimeoutBase,
          maxReconnectTimeout
        ),
        provider
      )
    }
    websocket.onopen = () => {
      provider.wsLastMessageReceived = time.getUnixTime()
      provider.wsconnecting = false
      provider.wsconnected = true
      provider.wsUnsuccessfulReconnects = 0
      provider.emit('status', [
        {
          status: 'connected',
        },
      ])
      // always send sync step 1 when connected
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageSync)
      syncProtocol.writeSyncStep1(encoder, provider.doc)
      websocket.send(encoding.toUint8Array(encoder))

      if (provider.awareness.getLocalState() !== null) {
        const encoderAwarenessState = encoding.createEncoder()
        encoding.writeVarUint(encoderAwarenessState, messageAwareness)
        encoding.writeVarUint8Array(
          encoderAwarenessState,
          awarenessProtocol.encodeAwarenessUpdate(provider.awareness, [
            provider.doc.clientID,
          ])
        )
        websocket.send(encoding.toUint8Array(encoderAwarenessState))
      }
    }

    provider.emit('status', [
      {
        status: 'connecting',
      },
    ])
  }
}

/**
 * @param {WebsocketProvider} provider
 * @param {ArrayBuffer} buf
 */
const broadcastMessage = (provider, buf) => {
  if (provider.wsconnected) {
    // @ts-ignore We know that wsconnected = true
    provider.ws.send(buf)
  }
  if (provider.bcconnected) {
    provider.mux(() => {
      bc.publish(provider.bcChannel, buf)
    })
  }
}

/**
 * Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
 * The document name is attached to the provided url. I.e. the following example
 * creates a websocket connection to http://localhost:1234/my-document-name
 *
 * @example
 *   import * as Y from 'yjs'
 *   import { WebsocketProvider } from 'y-websocket'
 *   const doc = new Y.Doc()
 *   const provider = new WebsocketProvider('http://localhost:1234', 'my-document-name', doc)
 *
 * @extends {Observable<string>}
 */
export class WebsocketProvider extends Observable {
  /**
   * @param {string} serverUrl
   * @param {string} roomname
   * @param {Y.Doc} doc
   * @param {object} [opts]
   * @param {boolean} [opts.connect]
   * @param {awarenessProtocol.Awareness} [opts.awareness]
   * @param {Object<string,string>} [opts.params]
   * @param {typeof WebSocket} [opts.WebSocketPolyfill] Optionall provide a WebSocket polyfill
   * @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
   */
    roomname
    doc
    _WS
    awareness
    wsconnected
    wsconnecting
    bcconnected
    wsUnsuccessfulReconnects
    mux
    bcChannel
    url
    _synced
    ws
    _bcSubscriber
    wsLastMessageReceived
    shouldConnect
    _resyncInterval
    _updateHandler
    messageHandlers
    send
    waitForConnection
    _getSubDocUpdateHandler
    subdocs = new Map();
    subscribeToSubdocs
  constructor(
    serverUrl,
    roomname,
    doc,
    {
      connect = true,
      awareness = new awarenessProtocol.Awareness(doc),
      params = {},
      WebSocketPolyfill = WebSocket,
      resyncInterval = -1,
    } = {}
  ) {
    super()
    // ensure that url is always ends with /
    while (serverUrl[serverUrl.length - 1] === '/') {
      serverUrl = serverUrl.slice(0, serverUrl.length - 1)
    }
    const encodedParams = url.encodeQueryParams(params)
    // this.bcChannel = serverUrl + "?docName=" + roomname

    // this.url =
    //   serverUrl + "/dev" +
    //   (encodedParams.length === 0 ? '' : '?' + encodedParams)
    this.bcChannel = serverUrl + '/' + roomname
    this.url =
      serverUrl +
      '/' +
      roomname +
      (encodedParams.length === 0 ? '' : '?' + encodedParams)
    this.roomname = roomname
    this.doc = doc
    this._WS = WebSocketPolyfill
    this.awareness = awareness
    this.wsconnected = false
    this.wsconnecting = false
    this.bcconnected = false
    this.wsUnsuccessfulReconnects = 0
    this.messageHandlers = messageHandlers.slice()
    this.mux = mutex.createMutex()
    /**
     * @type {boolean}
     */
    this._synced = false
    /**
     * @type {WebSocket?}
     */
    this.ws = null
    this.wsLastMessageReceived = 0
    /**
     * Whether to connect to other peers or not
     * @type {boolean}
     */
    this.shouldConnect = connect

    /**
     * @type {NodeJS.Timeout | number}
     */
    this._resyncInterval = 0
    if (resyncInterval > 0) {
      this._resyncInterval = setInterval(() => {
        if (this.ws) {
          // resend sync step 1
          const encoder = encoding.createEncoder()
          encoding.writeVarUint(encoder, messageSync)
          syncProtocol.writeSyncStep1(encoder, doc)
          this.ws.send(encoding.toUint8Array(encoder))
        }
      }, resyncInterval)
    }

    /**
     * @param {ArrayBuffer} data
     */
    this._bcSubscriber = (data) => {
      this.mux(() => {
        const encoder = readMessage(this, new Uint8Array(data), false)
        if (encoding.length(encoder) > 1) {
          bc.publish(this.bcChannel, encoding.toUint8Array(encoder))
        }
      })
    }
    /**
     * Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
     * @param {Uint8Array} update
     * @param {any} origin
     */
    this._updateHandler = (update, origin) => {
      if (origin !== this || origin === null) {
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.writeUpdate(encoder, update)
        broadcastMessage(this, encoding.toUint8Array(encoder));
      }
    }
    this.doc.on('update', this._updateHandler);

    const tryToFindWrongSubdoc = (searched, doc, docs) => {
      Array.from(docs).forEach(subdoc => {
        const [a, b, suffix] = subdoc.guid.split(".");
        if(!searched.includes(suffix)) {
          doc.getMap("subdocs").delete(subdoc.guid);
        }
      });
    }

    const docTypes = {
      mainDoc: ["organization"],
      organization: ["warehouse"],
      warehouse: []
    }

    const subscribedDocs = new Set();

    this.subscribeToSubdocs = (doc, typeOfSubsocs, docType) => {
      if(Array.from(subscribedDocs).includes(doc.guid)) {
        return;
      }
      doc.on(typeOfSubsocs, ({ added, removed, loaded }) => {
        added.forEach((subdoc) => {
          this.subdocs.set(subdoc.guid, subdoc)
        })
        removed.forEach((subdoc) => {
          subdoc.off('update', this._getSubDocUpdateHandler(subdoc))
          this.subdocs.delete(subdoc.guid)
        })
        loaded.forEach((subdoc) => {
          if(!this.subdocs.has(subdoc.guid)) {
            this.subdocs.set(subdoc.guid, subdoc);
          }
  
          if(!subdoc.isSynced) {
            const encoder = encoding.createEncoder()
            encoding.writeVarUint(encoder, messageSubDocSync)
            encoding.writeVarString(encoder, subdoc.guid)
            syncProtocol.writeSyncStep1(encoder, subdoc)
            if (this.ws) {
              this.send(encoding.toUint8Array(encoder), () => {
                subdoc.on('update', this._getSubDocUpdateHandler(subdoc))
              })
            }
          }
        })
      })
    }

    this.send = function (message, callback) {
      const ws = this.ws
      this.waitForConnection(function () {
        // @ts-ignore
        ws.send(message);
        if (typeof callback !== 'undefined') {
          callback();
        }
      }, 1000);
    };

    /**
     * 
     * @param {Function} callback 
     * @param {Number} interval 
     */
    this.waitForConnection = function (callback, interval) {
      const ws = this.ws
      if (ws && ws.readyState === 1) {
        callback();
      } else {
        var that = this;
        // optional: implement backoff for interval here
        setTimeout(function () {
          that.waitForConnection(callback, interval);
        }, interval);
      }
    };

    this._getSubDocUpdateHandler = (subdoc) => {
      /**
       * 
       * @param {Uint8Array} update 
       * @param {WebsocketProvider} origin 
       */
      const updateHandler = (update, origin) => {
        const encoder = encoding.createEncoder()
        encoding.writeVarUint(encoder, messageSubDocSync)
        encoding.writeVarString(encoder, subdoc.guid)
        syncProtocol.writeUpdate(encoder, update)
        broadcastMessage(this, encoding.toUint8Array(encoder));
      }
      return updateHandler
    }
    
      
    this.subscribeToSubdocs(this.doc, "subdocs", "mainDoc");

    /**
     * @param {any} changed
     * @param {any} origin
     */
    this._awarenessUpdateHandler = ({ added, updated, removed }, origin) => {
      const changedClients = added.concat(updated).concat(removed)
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      )
      broadcastMessage(this, encoding.toUint8Array(encoder))
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        awarenessProtocol.removeAwarenessStates(
          this.awareness,
          [doc.clientID],
          'window unload'
        )
      })    } else if (typeof process !== 'undefined') {
      process.on('exit', this._unloadHandler)
    }
    
    awareness.on('update', this._awarenessUpdateHandler)
    this._checkInterval = setInterval(() => {
      if (
        this.wsconnected &&
        messageReconnectTimeout <
          time.getUnixTime() - this.wsLastMessageReceived
      ) {
        // no message received in a long time - not even your own awareness
        // updates (which are updated every 15 seconds)
        /** @type {WebSocket} */ (this.ws).close()
      }
    }, messageReconnectTimeout / 10)
    if (connect) {
      this.connect()
    }
  }
  allSubdocumentsGuids
  // maybe if get all guids and check if all are here and synced :)
  syncSubdocs(allSubdocumentsGuids) {
    this.allSubdocumentsGuids = allSubdocumentsGuids;
    const map = this.doc.getMap("subdocs");

    Array.from(map).forEach(([guid, doc]) => {
      const subdoc = doc;
      if(!subdoc) {
        map.delete(guid);
        return;
      }
      if(guid.endsWith("organization")) {
        this.allSubdocumentsGuids = this.allSubdocumentsGuids.filter((id) => id != guid);
        this.subscribeToSubdocs(subdoc, "subdocs", "organization");
        subdoc.load();
      } else {
        map.delete(guid, undefined);
        this.doc.subdocs.delete(subdoc);
      }
    })
  }

  /**
   * @type {boolean}
   */
  get synced() {
    return this._synced
  }

  set synced(state) {
    if (this._synced !== state) {
      this._synced = state
      this.emit('synced', [state])
      this.emit('sync', [state])
    }
  }
  getSubDoc(id) {
    return this.subdocs.get(id);
  }
  _awarenessUpdateHandler
  _checkInterval
  destroy() {
    if (this._resyncInterval !== 0) {
      clearInterval(/** @type {NodeJS.Timeout} */ (this._resyncInterval))
    }
    clearInterval(this._checkInterval)
    this.disconnect()
    this.awareness.off('update', this._awarenessUpdateHandler)
    this.doc.off('update', this._updateHandler)
    super.destroy()
  }

  connectBc() {
    if (!this.bcconnected) {
      bc.subscribe(this.bcChannel, this._bcSubscriber)
      this.bcconnected = true
    }
    // send sync step1 to bc
    this.mux(() => {
      // write sync step 1
      const encoderSync = encoding.createEncoder()
      encoding.writeVarUint(encoderSync, messageSync)
      syncProtocol.writeSyncStep1(encoderSync, this.doc)
      bc.publish(this.bcChannel, encoding.toUint8Array(encoderSync))
      // broadcast local state
      const encoderState = encoding.createEncoder()
      encoding.writeVarUint(encoderState, messageSync)
      syncProtocol.writeSyncStep2(encoderState, this.doc)
      bc.publish(this.bcChannel, encoding.toUint8Array(encoderState))
      // write queryAwareness
      const encoderAwarenessQuery = encoding.createEncoder()
      encoding.writeVarUint(encoderAwarenessQuery, messageQueryAwareness)
      bc.publish(this.bcChannel, encoding.toUint8Array(encoderAwarenessQuery))
      // broadcast local awareness state
      const encoderAwarenessState = encoding.createEncoder()
      encoding.writeVarUint(encoderAwarenessState, messageAwareness)
      encoding.writeVarUint8Array(
        encoderAwarenessState,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
          this.doc.clientID,
        ])
      )
      bc.publish(this.bcChannel, encoding.toUint8Array(encoderAwarenessState))
    })
  }

  disconnectBc() {
    // broadcast message with local awareness state set to null (indicating disconnect)
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageAwareness)
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        [this.doc.clientID],
        new Map()
      )
    )
    broadcastMessage(this, encoding.toUint8Array(encoder))
    if (this.bcconnected) {
      bc.unsubscribe(this.bcChannel, this._bcSubscriber)
      this.bcconnected = false
    }
  }

  disconnect() {
    this.shouldConnect = false
    this.disconnectBc()
    if (this.ws !== null) {
      this.ws.close()
    }
  }

  connect() {
    this.shouldConnect = true
    if (!this.wsconnected && this.ws === null) {
      setupWS(this)
      this.connectBc()
    }
  }
}
