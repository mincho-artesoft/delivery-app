/// <reference lib="webworker" />
import * as Y from 'yjs/src/index.js';
import { WebsocketProvider } from './y-websocket.js';
import { IndexeddbPersistence } from './y-indexeddb.js';

function generateGuid(a?) {
  return a
    ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
     // @ts-ignore
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateGuid);
}

interface IData {
  body: any | null;
  headers: any;
  method: string;
  responseType: string;
  url: string;
  uuid: string;
}

let ydoc: Y.Doc;
let subdocsMap: Y.Map;
let documentStructureMap: Y.Map;
let provider: WebsocketProvider;
let providerIndexedDb: any;

const init = (
  websocketUrl: string,
  userID: string,
  cb: (params: any) => any
) => {
  const connect = () => {
    provider = new WebsocketProvider(websocketUrl, userID, ydoc, {
      params: { auth: '', readonly: 'true', docName: userID },
    });

    provider.on('status', async (event) => {
      console.log(event.status);
      if (event.status === 'connected') {
      }
    });

    provider.on('synced', async (isSynced) => {
      if (isSynced) {
        documentStructureMap = ydoc.getMap("documentStructure");
        if(!documentStructureMap.get("structure")) {
          documentStructureMap.set("structure", {organizations: {}});
        }
        const struct = documentStructureMap.get("structure").organizations;
        const guids = Object.keys(struct);
        const allSubdocumentGuids = [];

        const getAllGuids = (guids: string[], structure: any) => {
          guids.forEach(guid => {
            allSubdocumentGuids.push(guid);
            if(structure[guid] && Object.keys(structure[guid]).length) {
              getAllGuids(Object.keys(structure[guid]), structure);
            }
          })
        }
        getAllGuids(guids, struct);
        provider.syncSubdocs(allSubdocumentGuids);
        
        let checkSyncStatus = setInterval(() => {
          // const notSynced = Array.from(provider.subdocs.values()).filter(
          //   (s: Y.Doc) => s?.isSynced == false
          // );
          if (provider.allSubdocumentsGuids.length == 0) {
            subdocsMap = ydoc.getMap("subdocs");
            setTimeout(() => {
              cb(ydoc);
            }, 200);
            clearInterval(checkSyncStatus);
          }
        }, 100);
      }
    });
  };

  if (!provider) {
    ydoc = new Y.Doc({ guid: userID, autoLoad: true });
   

    providerIndexedDb = new IndexeddbPersistence(userID, ydoc);

    if (providerIndexedDb.synced) {
      connect();
    } else {
      providerIndexedDb.on('synced', () => {
        connect();
      });
    }
  } else {
    if(provider.synced) {
      cb(ydoc);
    } else {
      provider.on('synced', async (isSynced) => {
        if (isSynced) {
          provider.syncSubdocs();
          let checkSyncStatus = setInterval(() => {
            const notSynced = Array.from(provider.subdocs.values()).filter(
              (s: Y.Doc) => s?.isSynced == false
            );
            if (notSynced.length == 0) {
              subdocsMap = ydoc.getMap("subdocs");
              cb(ydoc);
              clearInterval(checkSyncStatus);
            }
          }, 100);
        }
      });
    }
  }
};

let initialUUID: string;

addEventListener('message', (req) => {
  const data = req.data as IData;
  const userID = data.headers.find((header) => header.includes("x-user-id"))[1][0];
  const params = data.url.split('?')?.[1]?.split('&');
  // const websocketUrl = new URL(data.url).pathname.substring(1);

  const pattern = /^(.*:\/\/[^\/]+)(\/[^?#]*)?/;
  const match = data.url.match(pattern);

  let pathParts = [];
  if (match) {
    // Include the base URL as the first element in the output array
    pathParts.push(match[1]);
    
    if (match[2]) {
      // Get the path without query parameters and fragment
      const pathWithoutQuery = match[2].split("?")[0];
      if(pathWithoutQuery && pathWithoutQuery != "/") pathParts = pathParts.concat(pathWithoutQuery.split("/").slice(1));
    }
  }

  if(params?.[0]?.includes("initial")) {
    initialUUID = data.uuid;
  }
  console.log(data.url, userID, data.method, pathParts);
  switch (data.method) {
    case 'YGET': {
      init(pathParts[0], userID, (ydoc: Y.Doc) => {
        let structure: any = {};

        if (pathParts.find(path => path.includes("organization")) || pathParts.find(path => path.includes("warehouse"))) {
          const path = pathParts.find(path => path.includes("organization")) || pathParts.find(path => path.includes("warehouse"))
          const shouldBuildArray = path.endsWith("s");

          let shouldGetWarehouse = false;
          if(path.includes("warehouse")) {
            shouldGetWarehouse = true;
          }

          const setListener = () => {
            subdocsMap.forEach((doc: Y.Doc, _: string) => docUpdateObserver(doc, () => getSubdocsData(subdocsMap, shouldGetWarehouse, data, (response: any) => postMessage({ type: 'yjs', response }))));
          }
          if(shouldBuildArray) {
            setListener();
            getSubdocsData(subdocsMap, shouldGetWarehouse, data, (response: any) => postMessage({ type: 'yjs', response }));
            subdocsMap.observe(() => {
              setListener();
              setTimeout(() => {
                getSubdocsData(subdocsMap, false, data, (response: any) => postMessage({ type: 'yjs', response }));
              }, 200)
            })
          } else {
            const path = params.find(param => param.includes("path"));
            let guid: string;
            let dataKey: string;

            if(path) {
              guid = path.split('=')[1];

              shouldGetWarehouse ? dataKey = "warehouseData" : dataKey = "organizationData";
              const docID = Array.from(provider.subdocs.keys()).find((id: string) => id.includes(guid));
              const subdoc = provider.subdocs.get(docID);
              const map = subdoc?.getMap("data");

              if(map) {
                structure = getOne(map, guid, dataKey);
                postMessage({ type: 'yjs', response: JSON.stringify({ structure: structure, uuid: data.uuid }) });
                docUpdateObserver(subdoc, () => {
                  const structure = getOne(map, guid, dataKey);
                  postMessage({ type: 'yjs', response: JSON.stringify({ structure: structure, uuid: data.uuid }) });    
                });
              }
            }
          }
          return;
        } else if (params?.find((param) => param.includes('path'))) {
          const [subdocID, parentID, suffix] = params.find((param) => param.includes("path")).split('=')[1].split('.');
          let subdoc: Y.Doc;
          let dataKey: string;
          if(suffix == "warehouse") {
            dataKey = "warehouseData";
          } else {
            dataKey = "organizationData";
          }
          const id = Array.from(provider.subdocs.keys()).find((id: string) => id.includes(subdocID)) as string;
          subdoc = provider.subdocs.get(id);
          structure = getOne(subdoc?.getMap("data"), id, dataKey);
          docUpdateObserver(subdoc, () => {
            const structure = getOne(subdoc?.getMap("data"), id, dataKey);
            postMessage({ type: 'yjs', response: JSON.stringify({ structure: structure, uuid: data.uuid }) });    
          });
          postMessage({ type: 'yjs', response: JSON.stringify({ structure: structure, uuid: data.uuid }) });
          return;
        } else {
          iterateDocument(ydoc, structure);

          docUpdateObserver(ydoc, () => {
            structure = {};
            iterateDocument(ydoc, structure);
            postMessage({ type: 'yjs', response: JSON.stringify({ structure, uuid: initialUUID }) });
          });
        }

        postMessage({ type: 'yjs', response: JSON.stringify({ structure, uuid: data.uuid }) });
      });
      break;
    }
    case 'YPOST': {
      init(pathParts[0], userID, (ydoc: Y.Doc) => {
        const [docGuidPart, id, suffix] = params.find((param) => param.includes("path")).split('=')[1].split('.');

        if(suffix == "organization") {
          const guid = docGuidPart + '.' + userID + '.' + suffix;
          createOrEditOrganization(guid, data);
        } else {
          const guid = Array.from(provider.subdocs.keys()).find((id: string) => id.includes(docGuidPart)) as string;

          debugger
          editWarehouse(guid, id, data);
        }
      });
      break;
    }
    case 'YDELETE': {
      init(pathParts[0], userID, (ydoc: Y.Doc) => {
        const [docGuidPart, id, suffix] = params.find((param) => param.includes("path")).split('=')[1].split('.');

        if(suffix == "organization") {
          const guid = docGuidPart + '.' + id + '.' + suffix;
          const subdoc = subdocsMap.get(guid);
          subdoc.destroy();
          subdocsMap.delete(guid);

          postMessage({
            type: 'yjs',
            response: JSON.stringify({ uuid: data.uuid, action: "Successful deleting!" }),
          });
        } else {
          const guid = Array.from(provider.subdocs.keys()).find((id: string) => id.includes(docGuidPart)) as string;
          debugger
          deleteWarehouse(guid, id, data);
        }
      });
    }
  }
});

function getNested(nestedMap: Y.Map, pathArr: string[]) {
  const obj1 = nestedMap.toJSON();

  return pathArr.reduce((obj, key, index) => {
    if (obj instanceof Y.Doc) {
      return obj.getMap(key);
    } else if (obj instanceof Y.Map) {
      return obj && obj.get(key) !== 'undefined' ? obj.get(key) : undefined;
    } else {
      return obj && obj && obj[key] !== 'undefined' ? obj[key] : undefined;
    }
  }, obj1);
}

function iterateDocument (doc: Y.Doc, docStructure: any) {
  if (!doc?.share) return;
  doc.share.forEach((yMap: Y.Map, key: string) => {
    if(key != "documentStructure") {
      docStructure[key] = {};
      yMap = doc.getMap(key);
      if (key == 'subdocs') {
        yMap.forEach((subdoc: Y.Doc, docGuid: string) => {
            docStructure[key][docGuid] = {};
            iterateDocument(subdoc, docStructure[key][docGuid]);
          });
      } else {
        yMap.forEach((value: any, mapKey: string) => {
          docStructure[key][mapKey] = value.data;
        });
      }
    }
  });
}

function getSubdocsData (subdocs: Y.Map, shouldGetWarehouses: boolean, data: { uuid: string }, callback: (response: any) => void) {
  let structure = {};
  subdocs.forEach((doc: Y.Doc, key: string) => {
    if(shouldGetWarehouses) {
      const map = doc.getMap("warehouses");
      map.forEach((warehouseDoc: Y.Doc, guid: string) => {
        const data = warehouseDoc.getMap("data");
        const serializedMapData = {};
        data.forEach((value: any, mapKey: string) => {
          serializedMapData[mapKey] = value?.data;
        });
        structure[key] = serializedMapData;
      })
    } else {
      const data = doc.getMap('data');
      const serializedMapData = {};
      data.forEach((value: any, mapKey: string) => {
        serializedMapData[mapKey] = value?.data;
      });
      structure[key] = serializedMapData;
    }
  });
  if(shouldGetWarehouses) {
    structure = Object.keys(structure).map((key) => ({...structure[key].warehouseData, _id: key}));
  } else {
    structure = Object.keys(structure).map((key) => ({...structure[key].organizationData, _id: key}));
  }

  callback(JSON.stringify({ structure, uuid: data.uuid }));
}

function getOne(map: Y.Map, guid: string,dataKey: string) {
  if(dataKey == "warehouseData") {
    const data = [];
    debugger
    map.forEach((value: any, mapKey: string) => {
      data.push({ ...value?.data, _id: value._id });
    });
    return data;
  } else {
    const serializedMapData = {};
    map.forEach((value: any, mapKey: string) => {
      serializedMapData[mapKey] = value?.data;
    });
    return { ...serializedMapData[dataKey], _id: guid };
  }
}

function createOrEditOrganization(guid: string, data: any) {
  let subdoc = subdocsMap.get(guid);

  if(subdoc) {
    subdoc.getMap("data").set('organizationData', JSON.parse(data.body));
    postMessage({
      type: 'yjs',
      response: JSON.stringify({ uuid: data.uuid, message: "Succesfully edited organization!" }),
    });
  } else {
    subdoc = new Y.Doc({ guid, meta: {} });
    subdocsMap.set(guid, subdoc);
    provider.subscribeToSubdocs(subdoc, "subdocs", "organization");
    subdoc.getMap('data').set('organizationData', JSON.parse(data.body));
    const [orgID, userID, suffix] = guid.split(".");
    const warehouseDoc = new Y.Doc({ guid: `${generateGuid()}.${orgID}.warehouse`, meta: {} });
    subdoc.getMap('subdocs').set(warehouseDoc.guid, warehouseDoc);
    warehouseDoc.getMap("data").set("warehouseData", {});
    const struct = documentStructureMap.get("structure");
    struct["organizations"][guid] = {[warehouseDoc.guid]: {}};
    documentStructureMap.set("structure", struct);
    postMessage({
      type: 'yjs',
      response: JSON.stringify({ uuid: data.uuid, message: "Succesfully created organization!" }),
    });
  }
}

function editWarehouse(guid: string, productID: string,data: any) {
  const subdoc = provider.subdocs.get(guid);
  debugger
  subdoc.getMap('data').set(productID, { ...JSON.parse(data.body), _id: productID });

  postMessage({
    type: 'yjs',
    response: JSON.stringify({ uuid: data.uuid, message: "Succesfull operation!" }),
  });
}

function deleteWarehouse(guid: string, productID: string, data: any) {
  const subdoc = provider.subdocs.get(guid);
  debugger
  subdoc.getMap('data').delete(productID);

  postMessage({
    type: 'yjs',
    response: JSON.stringify({ uuid: data.uuid, message: "Succesfull deleting!" }),
  });
}

const updateCallback = (callback: any) => (update: Uint8Array) => callback();

function docUpdateObserver(doc: Y.Doc, callback: any) {
  try {
    doc.off("update", updateCallback(callback));
  } catch(err) {
    console.error(err);
  }
  doc.on("update", updateCallback(callback));
}

const warehouses = [
  {
    _id: '64d7431e7cee91fc292ba47e',
    name: [
      {
        key: 'name_k1ey1',
        value: '1111',
      },
      {
        key: 'name_key2',
        value: 'name_value2',
      },
    ],
    brand_name: 'brand_name_here',
    description: [
      {
        key: 'description_key1',
        value: 'desc123ription_value1',
      },
      {
        key: 'description_key2',
        value: 'description_value2',
      },
    ],
    organizationId: '64d4bd75227bd3a0fdcca700',
    unit: 'unit_value_here',
    quantity: 2,
    tags: null,
    price: 49.99,
    currentProducts: [
      {
        quantity: 1,
        expirationDate: '2023-10-31T23:59:59Z',
      },
      {
        quantity: 1,
        expirationDate: '2023-10-31T23:59:59Z',
      },
    ],
    ingredients: [
      {
        quantity: 5,
        productId: '64d743027cee91fc292ba47d',
      },
    ],
    createdAt: '2023-08-12T08:30:22.904Z',
    updatedAt: '2023-08-12T08:36:46.639Z',
  },
  {
    _id: '64d752b1be35953488c6a16f',
    name: [
      {
        key: 'name_k1ey1',
        value: '1113121',
      },
      {
        key: 'name_key2',
        value: 'name_value2',
      },
    ],
    brand_name: 'brand_name_here',
    description: [
      {
        key: 'description_key1',
        value: 'desc123ription_value1',
      },
      {
        key: 'description_key2',
        value: 'description_value2',
      },
    ],
    organizationId: '64d4bd75227bd3a0fdcca700',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: [
      {
        quantity: 5,
        productId: '64d743027cee91fc292ba47d',
      },
    ],
    createdAt: '2023-08-12T09:36:49.290Z',
    updatedAt: '2023-08-12T09:36:49.290Z',
  },
  {
    _id: '64db246f5ec5e9d1aa5cda46',
    name: [
      {
        key: 'name_k1ey1',
        value: '1113121',
      },
      {
        key: 'name_key2',
        value: 'name_value2',
      },
    ],
    brand_name: 'brand_name_here',
    description: [
      {
        key: 'description_key1',
        value: 'desc123ription_value1',
      },
      {
        key: 'description_key2',
        value: 'description_value2',
      },
    ],
    organizationId: '64d8c10830379f1db3e8c48e',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    createdAt: '2023-08-15T07:08:31.977Z',
    updatedAt: '2023-08-15T07:08:31.977Z',
  },
  {
    _id: '64ed9bb2167c025d7b7e57c8',
    name: [
      {
        key: 'name_k1ey1',
        value: '11131121',
      },
      {
        key: 'name_key2',
        value: 'name_value2',
      },
    ],
    brand_name: 'brand_name_here',
    description: [
      {
        key: 'description_key1',
        value: 'desc123ription_value1',
      },
      {
        key: 'description_key2',
        value: 'description_value2',
      },
    ],
    organizationId: '64d8c10830379f1db3e8c48e',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    images: [],
    createdAt: '2023-08-29T07:18:10.929Z',
    updatedAt: '2023-08-29T07:18:10.929Z',
  },
  {
    _id: '64edd5508749844bcb90601a',
    name: {
      en: 'name_k1ey1',
    },
    brand_name: 'brand_name_here',
    description: [
      {
        key: 'description_key1',
        value: 'desc123ription_value1',
      },
      {
        key: 'description_key2',
        value: 'description_value2',
      },
    ],
    organizationId: '64d8c10830379f1db3e8c48e',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    images: [],
    createdAt: '2023-08-29T11:24:00.485Z',
    updatedAt: '2023-08-29T11:24:00.485Z',
  },
  {
    _id: '64edd57c8749844bcb90601b',
    name: {
      en: 'name_k1ey1',
      bg: 'сйдкафхкйсд',
    },
    brand_name: 'brand_name_here',
    description: [
      {
        key: 'description_key1',
        value: 'desc123ription_value1',
      },
      {
        key: 'description_key2',
        value: 'description_value2',
      },
    ],
    organizationId: '64d8c10830379f1db3e8c48e',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    images: [],
    createdAt: '2023-08-29T11:24:44.620Z',
    updatedAt: '2023-08-29T11:24:44.620Z',
  },
  {
    _id: '64edd5958749844bcb90601c',
    name: {
      en: 'name_1k1ey1',
      bg: 'сйдкафхкйсд',
    },
    brand_name: 'brand_name_here',
    description: {
      en: 'name_k1ey1',
      bg: 'сйдкафхкйсд',
    },
    organizationId: '64d8c10830379f1db3e8c48e',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    images: [],
    createdAt: '2023-08-29T11:25:09.132Z',
    updatedAt: '2023-08-29T11:25:09.132Z',
  },
  {
    _id: '64ede35f9b8dacb6179f71e7',
    name: {
      en: 'name_1k1ey1',
      bg: 'сйдкафхкйсд',
    },
    brand_name: 'brand_name_here',
    description: {
      en: 'name_k1ey1',
      bg: 'сйдкафхкйсд',
    },
    organizationId: '64edda14a254963735dd5a09',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    images: [],
    createdAt: '2023-08-29T12:23:59.105Z',
    updatedAt: '2023-08-29T12:23:59.105Z',
  },
  {
    _id: '64ede3769b8dacb6179f71e8',
    name: {
      en: 'name_1k1ey1',
      bg: 'сйдкафхкйсд',
      asd: '3213123',
    },
    brand_name: 'brand_name_here',
    description: {
      en: 'name_k1ey1',
      bg: 'сйдкафхкйсд',
    },
    organizationId: '64edda14a254963735dd5a09',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    images: [],
    createdAt: '2023-08-29T12:24:22.837Z',
    updatedAt: '2023-08-29T12:24:22.837Z',
  },
  {
    _id: '64ede39e9b8dacb6179f71e9',
    name: {
      en: 'name_1k1ey1',
    },
    brand_name: 'brand_name_here',
    description: {
      en: 'name_k1ey1',
      bg: 'сйдкафхкйсд',
    },
    organizationId: '64edda14a254963735dd5a09',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    images: [],
    createdAt: '2023-08-29T12:25:02.844Z',
    updatedAt: '2023-08-29T12:25:02.844Z',
  },
  {
    _id: '64ede3fad9dbb06f10222467',
    name: {
      en: 'name_1231k1ey1',
    },
    brand_name: 'brand_name_here',
    description: {
      en: 'name_k1ey1',
      bg: 'сйдкафхкйсд',
    },
    organizationId: '64edda14a254963735dd5a09',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    images: [],
    createdAt: '2023-08-29T12:26:34.752Z',
    updatedAt: '2023-08-29T12:26:34.752Z',
  },
  {
    _id: '64ede6096531b929df0997f4',
    name: {
      en: 'name_1k1ey1',
      asd: '123213',
    },
    brand_name: 'brand_name_here',
    description: {
      en: 'name_k1ey1',
      bg: 'сйдкафхкйсд',
    },
    organizationId: '64edda14a254963735dd5a09',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    images: [],
    createdAt: '2023-08-29T12:35:21.119Z',
    updatedAt: '2023-08-29T12:35:21.119Z',
  },
  {
    _id: '64ede6c1be779904159612ff',
    name: {
      en: 'name_1k1ey3121',
    },
    brand_name: 'brand_name_here',
    description: {
      en: 'name_k1ey1',
      bg: 'сйдкафхкйсд',
    },
    organizationId: '64edda14a254963735dd5a09',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    images: [],
    createdAt: '2023-08-29T12:38:25.685Z',
    updatedAt: '2023-08-29T12:38:25.685Z',
  },
  {
    _id: '64ede7a199cb2ec1db55f2ef',
    name: {
      en: 'name_1k1ey33123121',
    },
    brand_name: 'brand_name_here',
    description: {
      en: 'name_k1ey1',
      bg: 'сйдкафхкйсд',
    },
    organizationId: '64edda14a254963735dd5a09',
    unit: 'unit_value_here',
    quantity: 0,
    tags: null,
    price: 49.99,
    currentProducts: [],
    ingredients: null,
    images: [
      {
        key: '1000',
        value:
          'https://images-delevery-app.s3.amazonaws.com/1000-64ede7a199cb2ec1db55f2ef-07806681-f5a5-418c-8562-f818defbbe36.png',
      },
    ],
    createdAt: '2023-08-29T12:42:09.133Z',
    updatedAt: '2023-08-30T05:38:11.199Z',
  },
];
