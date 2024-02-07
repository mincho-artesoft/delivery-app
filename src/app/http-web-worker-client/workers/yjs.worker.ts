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

        if (pathParts.find(path => path.includes("organization"))) {
          const path = pathParts.find(path => path.includes("organization"));
          const shouldBuildArray = path.endsWith("s");

          const setListener = () => {
            subdocsMap.forEach((doc: Y.Doc, _: string) => docUpdateObserver(doc, () => getSubdocsData(subdocsMap, data, (response: any) => postMessage({ type: 'yjs', response }))));
          }

          if(shouldBuildArray) {
            setListener();
            getSubdocsData(subdocsMap, data, (response: any) => postMessage({ type: 'yjs', response }));
            subdocsMap.observe(() => {
              setListener();
              setTimeout(() => {
                getSubdocsData(subdocsMap, data, (response: any) => postMessage({ type: 'yjs', response }));
              }, 200)
            })
          } else {
            const path = params.find(param => param.includes("path"));
            let guid: string;
            let dataKey: string;

            if(path) {
              guid = path.split('=')[1];

              dataKey = "organizationData";
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
        } else if (pathParts.find(path => path == "services")) {
          const organizationGuid = params.find(param => param.includes("path")).split("=")[1];
          
          if(organizationGuid) {
            const organizationDoc: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == organizationGuid);
            if(organizationDoc) {
              const services = [];
  
              const subdocsData = organizationDoc.getMap("subdocs").toJSON();
  
              (Object.entries(subdocsData) as Array<[string, Y.Doc]>).forEach(([key, doc]) => {
                if(key.includes("service")) {
                  let serviceData = {};
                  doc.share.forEach((yMap: Y.Map, mapKey: string) => {
                    const mapContent = subdocsData[key].getMap(mapKey).toJSON();
                    (Object.entries(mapContent) as Array<[string, any]>).forEach(([k, value]) => {
                      serviceData[k] = value;
                      // services.push({ ...(/*value.data ? value.data :*/ value), _id: key });
                    });
                  })
                  serviceData["_id"] = key;
                  services.push(serviceData);
                }
              })
  
              postMessage({ type: 'yjs', response: JSON.stringify({ services, uuid: data.uuid }) });
              return
            } else {
              postMessage({ type: 'yjs', response: JSON.stringify({ services: [], uuid: data.uuid }) });
            }
          }
          return;
        } else if (pathParts.find(path => path == "service")) {
          const serviceGuid = params.find(param => param.includes("path")).split("=")[1];

          if(serviceGuid) {
            const serviceDoc: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == serviceGuid);
            const body = JSON.parse(data.body);
            const dataMap = serviceDoc.getMap("data");
            const settings = dataMap.get("settings");
            const type = settings?.settings?.data;
            if(body) {
              if(type) {
                const mapData = dataMap.get(type + "Data") || [];
                const item = mapData.find(i => i.guid == body._id);

                postMessage({ 
                  type: 'yjs', 
                  response: JSON.stringify({ 
                    item, 
                    uuid: data.uuid
                  })
                });
              }
            } else {
              if(type) {
                const structure = dataMap.get(type + "Data") || [];
  
                dataMap.observe(() => {
                  setTimeout(() => {
                    const structure = dataMap.get(type + "Data") || [];
                    postMessage({ 
                      type: 'yjs', 
                      response: JSON.stringify({ 
                        structure, 
                        uuid: data.uuid
                      })
                    });
                  }, 200)
                })
                
                postMessage({ 
                  type: 'yjs', 
                  response: JSON.stringify({ 
                    structure, 
                    uuid: data.uuid
                  })
                });
              }
            }

          }
          return;
        } else if (pathParts.find(path => path.includes("team"))) {
          const path = pathParts.find(path => path.includes("team"));
          const shouldBuildArray = path.endsWith("s");

          if(shouldBuildArray) {
            const [orgID, userID, _] = params.find((param) => param.includes("path")).split('=')[1].split(".");
            const teams = Array.from((provider.subdocs as Map<any, any>).values()).filter((doc) => doc.guid.includes(orgID) && doc.guid.includes("team"));

            let structure = [];

            const structureFunc = () => {
              const structure = [];
              teams.forEach(teamDoc => {
                const data: any = { _id: teamDoc.guid };
                iterateDocument(teamDoc, data);

                structure.push(data);
              });
              return structure;
            }
            structure = structureFunc();
            postMessage({ type: 'yjs', response: JSON.stringify({ structure: structure, uuid: data.uuid }) });
          } else {
            const teamGuid = params.find((param) => param.includes("path")).split('=')[1];
            const teamDoc = provider.subdocs.get(teamGuid);

            if(teamDoc) {
              const structure = {};
              iterateDocument(teamDoc, structure);

              postMessage({ type: 'yjs', response: JSON.stringify({ structure, uuid: data.uuid }) });
            } else {
              postMessage({ type: 'yjs', response: JSON.stringify({ message: "Cannot find team with this id - " + teamGuid, uuid: data.uuid }) });
            }
          }
          return;
          // postMessage({ type: 'yjs', response: JSON.stringify({ structure: structure, uuid: data.uuid }) });
        } else if (pathParts.find(path => path.includes("profile"))) {
          const path = pathParts.find(path => path.includes("profile"));
          const shouldBuildArray = path.endsWith("s");

          if(shouldBuildArray) {
            const [orgID, userID, _] = params.find((param) => param.includes("path")).split('=')[1].split(".");
            const profiles = Array.from((provider.subdocs as Map<any, any>).values()).filter((doc) => doc.guid.includes(orgID) && doc.guid.includes("profile"));
            // teamSubdoc.getMap("data").set("profileData", data.body);

            let structure = [];

            const structureFunc = () => {
              const structure = [];
              profiles.forEach(profileDoc => {
                const data = profileDoc.getMap("data").get("profileData");
                if(data) {
                  structure.push({ _id: profileDoc.guid, ...data});
                }
              });
              return structure;
            }
            structure = structureFunc();

            postMessage({ type: 'yjs', response: JSON.stringify({ structure, uuid: data.uuid }) });
          } else {
            const profileGuid = params.find((param) => param.includes("path")).split('=')[1];
            const profileDoc = provider.subdocs.get(profileGuid);

            if(profileDoc) {
              const structure = {};
              iterateDocument(profileDoc, structure);

              postMessage({ type: 'yjs', response: JSON.stringify({ structure, uuid: data.uuid }) });
            } else {
              postMessage({ type: 'yjs', response: JSON.stringify({ message: "Cannot find profile with this id - " + profileGuid, uuid: data.uuid }) });
            }
          }
          return;
        } else if (params?.find((param) => param.includes('path')) && pathParts[pathParts.length - 1] !== "teams" && (pathParts || []).length > 1) {
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
          if((pathParts || []).length == 1 && (params || []).find(param => param.includes("path"))) {
            const docGuid = params.find(param => param.includes("path")).split("=")[1];

            const doc: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == docGuid);
            
            if(doc) {
              const structure = { _id: doc.guid }
              iterateDocument(doc, structure);

              postMessage({ type: 'yjs', response: JSON.stringify({ structure, uuid: data.uuid }) });
            }
            return;
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
        }

        postMessage({ type: 'yjs', response: JSON.stringify({ structure, uuid: data.uuid }) });
      });
      break;
    }
    case 'YPOST': {
      init(pathParts[0], userID, (ydoc: Y.Doc) => {
        const part = pathParts[pathParts.length - 1];
        console.log(part);
        
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
            organization.getMap("subdocs").set(teamSubdoc.guid, teamSubdoc);
            
            setTimeout(() => {
              // teamSubdoc.getMap("subdocs").set(organizationCopy.guid, organizationCopy);
              teamSubdoc.getMap("data").set("teamData", JSON.parse(data.body));
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
        } else if (part == "services") {
          const guid = params ? params.find((param) => param.includes("path")).split('=')[1] : null;
          
          if(guid) {
            const settings = JSON.parse(data.body);
            if(guid.includes("service")) {
              const service: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == guid);

              if(service) {
                service.getMap("data").set("settings", settings);
                
                postMessage({
                  type: 'yjs',
                  response: JSON.stringify({ uuid: data.uuid, action: "Successful edited service!" })
                });
              }
            } else {
              const prefix = guid.split(".")[0];
              const serviceDoc = new Y.Doc({ guid: `${generateGuid()}.${prefix}.service`});
              
              const organization: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == guid);
              if(organization) {
                organization.getMap("subdocs").set(serviceDoc.guid, serviceDoc);
                setTimeout(() => {
                  serviceDoc.getMap("data").set("settings", settings);
                }, 200);
                postMessage({
                  type: 'yjs',
                  response: JSON.stringify({ uuid: data.uuid, action: "Successful added service!" })
                });
              }
            }
          } else {
            const body = JSON.parse(data.body);
            const guid = body.guid;

            if(guid) {
              const serviceDoc: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == guid);

              if(serviceDoc) {
                const dataMap = serviceDoc.getMap("data");
                const settings = dataMap.get("settings").settings;

                const type = settings.data;

                if(type) {
                  const values = dataMap.get(type + "Data");
                  if(!values) {
                    dataMap.set(type + "Data", [{ ...body, guid: generateGuid() }]);
                  } else {
                    if(body._id) {
                      const res = (values as any[]).filter((e: any) => e.guid != body._id);
                      res.push(body);
                      dataMap.set(type + "Data", res);
                    } else {
                      values.push({ ...body, guid: generateGuid() });
                      dataMap.set(type + "Data", values);
                    }
                  }
                  postMessage({
                    type: 'yjs',
                    response: JSON.stringify({ uuid: data.uuid, action: "Successful added!" })
                  });
                }
              }
            }
          }
        } else {
          const [docGuidPart, id, suffix] = params.find((param) => param.includes("path")).split('=')[1].split('.');
  
          if(suffix == "organization") {
            const guid = docGuidPart + '.' + userID + '.' + suffix;
            createOrEditOrganization(guid, data);
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
            const docGuid = params.find(param => param.includes("path")).split("=")[1];
            const serviceGuid = params.find(param => param.includes("service")).split("=")[1];

            const service: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == serviceGuid);
            const doc: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == docGuid);
  
            doc.transact(() => {
              doc.getMap("subdocs").delete(service.guid);
            })
  
            postMessage({
              type: 'yjs',
              response: JSON.stringify({ uuid: data.uuid, action: "Successful deleted service!" })
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
        } else if (part == "services") {
          const serviceGuid = params.find((param) => param.includes("path")).split('=')[1];

          if(serviceGuid) {
            const body = JSON.parse(data.body);

            if(body._id) {
              const serviceDoc: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid == serviceGuid);
              const dataMap = serviceDoc.getMap("data");
              const settings = dataMap.get("settings").settings;

              const type = settings.data;

              if(type) {
                const values = dataMap.get(type + "Data");

                const res = (values as any[]).filter((e: any) => e.guid != body._id);
                dataMap.set(type + "Data", res);

                postMessage({
                  type: 'yjs',
                  response: JSON.stringify({ uuid: data.uuid, action: "Successful deletion!" })
                });
              }
            } else {
              const [prefix, orgGuid, _] = serviceGuid.split(".");
  
              const organizationDoc: Y.Doc = Array.from(provider.subdocs.values()).find((doc: Y.Doc) => doc.guid.includes(orgGuid) && doc.guid.includes("organization"));
  
              organizationDoc.getMap("subdocs").delete(serviceGuid);
  
              postMessage({
                type: 'yjs',
                response: JSON.stringify({ uuid: data.uuid, action: "Successful removed service!" })
              });
            }
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

function iterateDocument(doc: Y.Doc, docStructure: any, path = []) {
  if (!doc?.share) return;

  const docId = doc.guid;

  if (path.includes(docId)) {
    return;
  }

  path.push(docId);

  doc.share.forEach((yMap, key) => {
    if (key != "documentStructure") {
      const mapContent = doc.getMap(key).toJSON();
      if (key == 'subdocs') {
        (Object.entries(mapContent) as Array<[string, Y.Doc]>).forEach(([docGuid, subdoc], i) => {

          // we dont need documents copy in the structure
          if(docGuid.includes("Copy")) return;

          const [_, _2, suffix] = docGuid.split(".");
          // serviceDoc.getMap("data").set("settings", settings);
          key = suffix + "s";

          if (!docStructure[key]) {
            docStructure[key] = {};
          }
          if (!docStructure[key][docGuid]) {
            // console.log(subdoc, subdoc.guid);
            const data = subdoc.getMap("data").get("settings");
            
            if(data) {
              docStructure[key][data.settings.data] = { _id: docGuid };
              iterateDocument(provider.subdocs.get(docGuid), docStructure[key][data.settings.data], [...path]);
            } else {
              docStructure[key][docGuid] = { _id: docGuid };
              iterateDocument(provider.subdocs.get(docGuid), docStructure[key][docGuid], [...path]);
            }
          }
          
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


function getSubdocsData (subdocs: Y.Map, data: { uuid: string }, callback: (response: any) => void) {
  let structure = {};
  subdocs.forEach((doc: Y.Doc, key: string) => {
    // if(shouldGetWarehouses) {
    //   const warehouseKey = Array.from(provider.subdocs.keys()).find((k: string) => k.includes("warehouse") && k.includes(key.split(".")[0])) as string;
    //   const warehouse = provider.subdocs.get(warehouseKey);
    //   const map = warehouse.getMap("data");
    //   const serializedMapData = {};
    //   map.forEach((value: any, mapKey: string) => {
    //     serializedMapData[mapKey] = value?.data;
    //   });
    //   structure[key] = serializedMapData;
    // } else {
      const data = doc.getMap('data');
      const serializedMapData = {};
      data.forEach((value: any, mapKey: string) => {
        if(value?.data && Object.keys(value.data).length > 1) {
          serializedMapData[mapKey] = value.data;
        }
      });
      structure[key] = serializedMapData;
    // }
  });

  structure = Object.keys(structure).map((key) => ({...structure[key].organizationData, _id: key}));

  callback(JSON.stringify({ structure, uuid: data.uuid }));
}

function getOne(map: Y.Map, guid: string,dataKey: string) {
  const serializedMapData = {};
  map.forEach((value: any, mapKey: string) => {
    serializedMapData[mapKey] = value?.data;
  });
  return { ...serializedMapData[dataKey], _id: guid };
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
    // const warehouseDoc = new Y.Doc({ guid: `${generateGuid()}.${orgID}.warehouse` });
    // subdoc.getMap('subdocs').set(warehouseDoc.guid, warehouseDoc);
    // warehouseDoc.getMap("data").set("warehouseData", {});
    // const struct = documentStructureMap.get("structure");
    // struct["organizations"].push(guid);
    // documentStructureMap.set("structure", struct);
    const organizationData = { ...JSON.parse(data.body), _id: guid };

    postMessage({
      type: 'yjs',
      response: JSON.stringify({ uuid: data.uuid, ...organizationData, message: "Succesfully edited organization!" }),
    });
  }
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
/**
 * example of document uuid
 * ````````````````````````
 * (unique id).(parent document unique id).(suffix - 'organization', 'warehouse', 'profile' etc.)
 */