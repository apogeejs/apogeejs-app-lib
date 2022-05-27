import WebApogeeModuleEntry from "/apogeejs-app-lib/src/references/WebApogeeModuleEntry.js";
import NodeApogeeModuleEntry from "/apogeejs-app-lib/src/references/NodeApogeeModuleEntry.js";
import EsModuleEntry from "/apogeejs-app-lib/src/references/EsModuleEntry.js";
import NpmModuleEntry from "/apogeejs-app-lib/src/references/NpmModuleEntry.js";
import JsScriptEntry from "/apogeejs-app-lib/src/references/JsScriptEntry.js";
import CssEntry from "/apogeejs-app-lib/src/references/CssEntry.js";

import ReferenceManager from "/apogeejs-app-lib/src/references/ReferenceManager.js";

/** This file initializes the reference class types available. */

let referenceClassArray = [];
if(__APOGEE_ENVIRONMENT__ == "WEB") {
    referenceClassArray.push(WebApogeeModuleEntry);
    referenceClassArray.push(EsModuleEntry);
    referenceClassArray.push(JsScriptEntry);
    referenceClassArray.push(CssEntry);
}
else if(__APOGEE_ENVIRONMENT__ == "NODE") {
    referenceClassArray.push(NodeApogeeModuleEntry);
    referenceClassArray.push(NpmModuleEntry);
}
else {
    console.log("Warning - apogee environment not recognized!");
}

ReferenceManager.setReferenceClassArray(referenceClassArray);