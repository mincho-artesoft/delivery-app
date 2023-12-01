/// <reference lib="webworker" />
import * as Y from 'yjs/src/index.js';
import { WebsocketProvider } from './y-websocket.js';
import { IndexeddbPersistence } from './y-indexeddb.js';
import { generateGuid } from "./utils/utils.js";

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
let isPending = false;
let isDisconnected = false;
let wholeStructure = {};

let timeout

const init = (
  websocketUrl: string,
  userID: string,
  cb: (params: any) => any
) => {
  const initFunc = () => {
    documentStructureMap = ydoc.getMap("documentStructure");
    if(!documentStructureMap.get("structure")) {
      documentStructureMap.set("structure", {organizations: []});
    }
    const organizationGuids = documentStructureMap.get("structure").organizations as string[];
    provider.syncSubdocs(organizationGuids);
    
    let checkSyncStatus = setInterval(() => {
      if (provider.allSubdocumentsGuids.length == 0) {
        subdocsMap = ydoc.getMap("subdocs");
        setTimeout(() => {
          cb(ydoc);
        }, 200);
        clearInterval(checkSyncStatus);
      } else {
        provider.syncSubdocs(provider.allSubdocumentsGuids);
      }
    }, 300);
  }

  const connect = () => {
    if(!provider) {
      provider = new WebsocketProvider(websocketUrl, userID, ydoc, {
        // params: { auth: '', readonly: 'true', docName: userID },
      }, (doc: Y.Doc, shouldOffListener?: boolean) => docUpdateObserver(doc, () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          console.log("from the provideeeeeer 123123123123123");
          
          let structure = {};
          iterateDocument(ydoc, structure);
          wholeStructure = structure;
          postMessage({ type: 'yjs', response: JSON.stringify({ structure, uuid: initialUUID }) });
        }, 200);
      }, shouldOffListener));
  
      provider.on('status', async (event) => {
        console.log(event.status);
        if (event.status === 'connected' && isDisconnected) {
          isDisconnected = false;
          initFunc();
        } else if (event.status == "disconnected") {
          isDisconnected = true;
        }
      });
  
      provider.on('synced', async (isSynced: boolean) => {
        if (isSynced) {
          initFunc();
        }
      });
    }
  };

  if (!provider && !isPending) {
    ydoc = new Y.Doc({ guid: userID, autoLoad: true });
    isPending = true;

    providerIndexedDb = new IndexeddbPersistence(userID, ydoc);

    if (providerIndexedDb.synced) {
      connect();
    } else {
      providerIndexedDb.on('synced', () => {
        connect();
      });
    }
  } else {
    if(provider?.synced) {
      cb(ydoc);
    } else {
      let checkStatus = setInterval(() => {
        if(provider && provider.synced) {
          initFunc();
        }
        
        clearInterval(checkStatus);
      }, 100);
    }
  }
};
let initialUUID: string;

addEventListener('message', (req) => {
  const data = req.data as IData;
  const userID = data.headers.find((header) => header.includes("x-user-id"))[1][0];
  const params = data.url.split('?')?.[1]?.split('&');

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
        } else if (params?.find((param) => param.includes('path')) && pathParts[pathParts.length - 1] !== "teams") {
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
        } else if (pathParts[pathParts.length - 1] == "teams") {
          const organizationID = params[0].split("=")[1];

          const organization: Y.Doc = Array.from(provider.subdocs.values()).find((s: Y.Doc) => s.guid.includes(organizationID));
          const sendMessage = () => {
            const teamsData = [];
            organization.getMap("subdocs").forEach((doc: Y.Doc, guid: string) => {
              console.log(guid, doc.isSynced);
              if(guid.includes("team")) {
                const teamData = doc.getMap("data").get("teamData");
                teamsData.push({ guid, ...(teamData || {} )})
              }
            })
            const test = { type: 'yjs', response: JSON.stringify({ structure: teamsData, uuid: data.uuid }) };
            postMessage(test);
          }
          if(organization) {
            organization.getMap("subdocs").observe(() => {
              sendMessage();
            })
            sendMessage();
          }
        } else {
          iterateDocument(ydoc, structure);
          wholeStructure = structure;
          let timeout;
          docUpdateObserver(ydoc, () => {    
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              structure = {};
              iterateDocument(ydoc, structure);
              wholeStructure = structure;
              postMessage({ type: 'yjs', response: JSON.stringify({ structure, uuid: initialUUID }) });
            }, 200);
          });
        }

        postMessage({ type: 'yjs', response: JSON.stringify({ structure, uuid: data.uuid }) });
      });
      break;
    }
    case 'YPOST': {
      init(pathParts[0], userID, (ydoc: Y.Doc) => {
        const part = pathParts[pathParts.length - 1];

        if(part == "teams") {
          if(params.find(param => param.includes("profile"))) {
            const teamGuid = params.find((param) => param.includes("path")).split('=')[1];
            const profileGuid = params.find((param) => param.includes("profile")).split('=')[1];

            const team: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == teamGuid);
            const profile: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == profileGuid);
            
            team.getMap("subdocs").set(profile.guid, profile);
            setTimeout(() => {
              profile.getMap("subdocs").set(team.guid, team);
            }, 300);

            postMessage({
              type: 'yjs',
              response: JSON.stringify({ uuid: data.uuid, action: "Successful added employee to team!" })
            })
          } else {
            const orgID = params[0].split("=")[1];
            const organization: Y.Doc = Array.from(provider.subdocs.values()).find((s: Y.Doc) => s.guid == orgID);
            const organizationCopy: Y.Doc = Array.from(provider.subdocs.values()).find((s: Y.Doc) => s.guid == orgID + "Copy");
            const [prefix, userID, suffix] = organization.guid.split(".");
            
            const teamSubdoc = new Y.Doc({ guid: `${generateGuid()}.${prefix}.team`});
            // provider.subscribeToSubdocs(organization, "subdocs", "organization");
            provider.subscribeToSubdocs(teamSubdoc, "subdocs", "organization");
            teamSubdoc.getMap("data").set("teamData", data.body);

            setTimeout(() => {
              teamSubdoc.getMap("subdocs").set(organizationCopy.guid, organizationCopy);
              organization.getMap("subdocs").set(teamSubdoc.guid, teamSubdoc);
              postMessage({
                type: 'yjs',
                response: JSON.stringify({ uuid: data.uuid, action: "Successful created team!" })
              })
            }, 100);
          }
        } else if (part == "profiles") {
          const profileGuid = params.find((param) => param.includes("path")).split('=')[1];
          const serviceGuid = params.find((param) => param.includes("service")).split('=')[1];

          const service: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == serviceGuid);
          const profile: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == profileGuid);

          profile.transact(() => {
            profile.getMap("subdocs").set(service.guid, service);
          })
          
          postMessage({
            type: 'yjs',
            response: JSON.stringify({ uuid: data.uuid, action: "Successful added service!" })
          })
        } else {
          const [docGuidPart, id, suffix] = params.find((param) => param.includes("path")).split('=')[1].split('.');
  
          if(suffix == "organization") {
            const guid = docGuidPart + '.' + userID + '.' + suffix;
            createOrEditOrganization(guid, data);
          } else {
            const guid = Array.from(provider.subdocs.keys()).find((id: string) => id.includes(docGuidPart)) as string;
  
            editWarehouse(guid, id, data);
          }
        }
      });
      break;
    }
    case 'YDELETE': {
      init(pathParts[0], userID, (ydoc: Y.Doc) => {
        const part = pathParts[pathParts.length - 1];

        if(part == "profiles" || part == "teams") {
          if(params.find(param => param.includes("service"))) {
            debugger
            const docGuid = params.find(param => param.includes("path")).split("=")[1];
            const serviceGuid = params.find(param => param.includes("service")).split("=")[1];

            const service: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == serviceGuid);
            const doc: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == docGuid);
  
            doc.transact(() => {
              doc.getMap("subdocs").delete(service.guid);
            })
  
            postMessage({
              type: 'yjs',
              response: JSON.stringify({ uuid: data.uuid, action: "Successful added service!" })
            })
          } else {
            const organization: Y.Doc = Array.from(provider.subdocs.values()).find((s: Y.Doc) => s.guid.includes(params[0].split('=')[1].split(".")[1]));
            const guid = params[0].split("=")[1];
            if(part == "teams") {
              organization.getMap("subdocs").get(guid)?.destroy();
            }
            organization.getMap("subdocs").delete(params[0].split("=")[1]);
            postMessage({
              type: 'yjs',
              response: JSON.stringify({ uuid: data.uuid, action: "Successful deleting!" })
            })
          }
        } else {
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
            
            deleteWarehouse(guid, id, data);
          }
        }
      });
    }
  }
});

// const getNested = function (nestedObj, path) {
//   const pathArr = path.split('.');
//   return pathArr.reduce((obj, key, index) => {
//     return (obj && obj[key] !== 'undefined') ? (typeof obj[key] === 'function' ? obj[key]() : obj[key]) : undefined;
//   }, nestedObj);
// };

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

const services = ["warehouse"];

// function iterateDocument (doc: Y.Doc, docStructure: any) {
//   if (!doc?.share) return;

//   doc.share.forEach((yMap: Y.Map, key: string) => {
//     if(key != "documentStructure") {
//       const mapContent = doc.getMap(key).toJSON();
//       if (key == 'subdocs') {
//         (Object.entries(mapContent) as Array<[string, Y.Doc]>).forEach(([docGuid, subdoc]) => {
//           const [_, _2, suffix] = docGuid.split(".");
//           if(!docStructure[suffix + "s"]) {
//             services.includes(suffix) ? key = "services" : key = suffix + "s";

//             docStructure[key] = { [docGuid]: {} };
//           } else {
//             services.includes(suffix) ? key = "services" : key = suffix + "s";
//             docStructure[key][docGuid] = {};
//           }
//           iterateDocument(subdoc, docStructure[key][docGuid]);
//         });
//       } else {
//         (Object.entries(mapContent) as Array<[string, any]>).forEach(([mapKey, value]) => {
//           docStructure[mapKey] = value.data || value;
//         });
//       }
//     }
//   });
// }

function iterateDocument(doc: Y.Doc, docStructure: any, path = []) {
  if (!doc?.share) return;

  const docId = doc.guid
  if (path.includes(docId)) {
    return;
  }

  path.push(docId);

  doc.share.forEach((yMap, key) => {
    if (key != "documentStructure") {
      const mapContent = doc.getMap(key).toJSON();
      if (key == 'subdocs') {
        (Object.entries(mapContent) as Array<[string, Y.Doc]>).forEach(([docGuid, subdoc]) => {

          // we dont need documents copy in the structure
          if(docGuid.includes("Copy")) return;

          const [_, _2, suffix] = docGuid.split(".");
          services.includes(suffix) ? key = "services" : key = suffix + "s";

          if (!docStructure[key]) {
            docStructure[key] = {};
          }
          if (!docStructure[key][docGuid]) {
            docStructure[key][docGuid] = {};
          }
          
          iterateDocument(subdoc, docStructure[key][docGuid], [...path]);
        });
      } else {
        (Object.entries(mapContent) as Array<[string, any]>).forEach(([mapKey, value]) => {
          docStructure[mapKey] = value.data || value;
        });
      }
    }
  });

  path.pop();
}


function getSubdocsData (subdocs: Y.Map, shouldGetWarehouses: boolean, data: { uuid: string }, callback: (response: any) => void) {
  let structure = {};
  subdocs.forEach((doc: Y.Doc, key: string) => {
    if(shouldGetWarehouses) {
      const warehouseKey = Array.from(provider.subdocs.keys()).find((k: string) => k.includes("warehouse") && k.includes(key.split(".")[0])) as string;
      const warehouse = provider.subdocs.get(warehouseKey);
      const map = warehouse.getMap("data");
      const serializedMapData = {};
      map.forEach((value: any, mapKey: string) => {
        serializedMapData[mapKey] = value?.data;
      });
      structure[key] = serializedMapData;
    } else {
      const data = doc.getMap('data');
      const serializedMapData = {};
      data.forEach((value: any, mapKey: string) => {
        if(value?.data && Object.keys(value.data).length > 1) {
          serializedMapData[mapKey] = value.data;
        }
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
    const restaurantData = { ...JSON.parse(data.body), _id: guid };
    postMessage({
      type: 'yjs',
      response: JSON.stringify({ uuid: data.uuid, ...restaurantData, message: "Succesfully edited organization!" }),
    });
  } else {
    // creating organization document
    subdoc = new Y.Doc({ guid });
    subdocsMap.set(guid, subdoc);
    provider.subscribeToSubdocs(subdoc, "subdocs", "organization");
    subdoc.getMap('data').set('organizationData', JSON.parse(data.body));
    const [orgID, userID, suffix] = guid.split(".");

    // creating organization copy which will be used by employees and teams
    const organizationCopy = new Y.Doc({ guid: `${orgID}.${userID}.${suffix}Copy` });
    organizationCopy.getMap('data').set('organizationData', JSON.parse(data.body));
    subdoc.getMap("subdocs").set(organizationCopy.guid, organizationCopy);

    // creating warehouse
    const warehouseDoc = new Y.Doc({ guid: `${generateGuid()}.${orgID}.warehouse` });
    subdoc.getMap('subdocs').set(warehouseDoc.guid, warehouseDoc);
    warehouseDoc.getMap("data").set("warehouseData", {});
    const struct = documentStructureMap.get("structure");
    struct["organizations"].push(guid);
    documentStructureMap.set("structure", struct);
    const restaurantData = { ...JSON.parse(data.body), _id: guid };

    postMessage({
      type: 'yjs',
      response: JSON.stringify({ uuid: data.uuid, ...restaurantData, message: "Succesfully edited organization!" }),
    });
  }
}

function editWarehouse(guid: string, productID: string,data: any) {
  const subdoc = provider.subdocs.get(guid);
  subdoc.getMap('data').set(productID, { ...JSON.parse(data.body), _id: productID });

  postMessage({
    type: 'yjs',
    response: JSON.stringify({ uuid: data.uuid, message: "Succesfull operation!" }),
  });
}

function deleteWarehouse(guid: string, productID: string, data: any) {
  const subdoc = provider.subdocs.get(guid);
  subdoc.getMap('data').delete(productID);

  postMessage({
    type: 'yjs',
    response: JSON.stringify({ uuid: data.uuid, message: "Succesfull deleting!" }),
  });
}

const updateCallback = (callback: any, clog?: string) => (update: Uint8Array) => callback();

function docUpdateObserver(doc: Y.Doc, callback: any, shouldOffListener?: boolean) {
  try {
    doc.off("update", updateCallback(callback));
  } catch(err) {
    console.error(err);
  }
  if(!shouldOffListener) {
    doc.on("update", updateCallback(callback));
  }
}

function createProfile(organizationID: string, data: any) {
  let profileSubdoc = Array.from(provider.subdocs).find((subdoc: Y.Doc) => subdoc.guid.endsWith("profiles")) as Y.Doc;

  if(profileSubdoc) {
    provider.subscribeToSubdocs(profileSubdoc, "subdocs", "profiles");
    const profile = new Y.Doc({ guid: `${generateGuid()}.${organizationID}.profile` });
    profileSubdoc.getMap('subdocs').set(profile.guid, profile);
    profile.getMap("data").set("profileData", JSON.parse(data.body));
  } else {
    const organization = Array.from(provider.subdocs).find((subdoc: Y.Doc) => subdoc.guid.startsWith(organizationID)) as Y.Doc;
    provider.subscribeToSubdocs(organization, "subdocs", "organization");
    profileSubdoc = new Y.Doc({ guid: `${generateGuid()}.${organizationID}.profiles` });
    organization.getMap('subdocs').set(profileSubdoc.guid, profileSubdoc);
    provider.subscribeToSubdocs(profileSubdoc, "subdocs", "profiles");
    const profile = new Y.Doc({ guid: `${generateGuid()}.${organizationID}.profile` });
    profileSubdoc.getMap('subdocs').set(profile.guid, profile);
    profile.getMap("data").set("profileData", JSON.parse(data.body));
  }

  postMessage({
    type: 'yjs',
    response: JSON.stringify({ uuid: data.uuid, message: "Succesfull operation!" }),
  });
}

function getProfiles(organizationID: string, data: any) {
  const profiles = Array.from(provider.subdocs).filter((subdoc: Y.doc) => subdoc.guid.endsWith("profile") && subdoc.guid.includes(organizationID));

  const serializeData: any = {};
  
  if(profiles.length) {
    profiles.forEach((profile: Y.Doc) => {
      const data = profile.getMap("data").get("profileData");
      serializeData[profile.guid] = data;
    })
  }
  
  postMessage({
    type: 'yjs',
    response: JSON.stringify({ uuid: JSON.parse(data.body).uuid, data: serializeData }),
  });
}

function editProfile() {

}

function deleteProfile() {

}

/**
 * example of document uuid
 * ````````````````````````
 * (unique id).(parent document unique id).(suffix - 'organization', 'warehouse', 'profile' etc.)
 */