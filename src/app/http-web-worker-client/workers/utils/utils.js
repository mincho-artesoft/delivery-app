
export const generateGuid = (a) =>  a ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateGuid);
  

export function iterateDocument (doc, docStructure) {
  if (!doc?.share) return;
  doc.share.forEach((yMap, key) => {
    if(key != "documentStructure") {
      docStructure[key] = {};
      yMap = doc.getMap(key);
      if (key == 'subdocs') {
        yMap.forEach((subdoc, docGuid) => {
            docStructure[key][docGuid] = {};
            iterateDocument(subdoc, docStructure[key][docGuid]);
          });
      } else {
        yMap.forEach((value, mapKey) => {
          docStructure[key][mapKey] = value.data;
        });
      }
    }
  });
}