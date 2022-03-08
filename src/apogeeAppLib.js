//This is a single module that exports the public items from the apogee app namespace
export {default as Apogee} from "/apogeejs-app-lib/src/Apogee.js";
export {default as BaseFileAccess} from "/apogeejs-app-lib/src/BaseFileAccess.js";

export {default as Component} from "/apogeejs-app-lib/src/component/Component.js";

export {getFormComponentDefaultMemberJson} from "/apogeejs-app-lib/src/components/formInputComponentUtils.js";

export {default as componentInfo} from "/apogeejs-app-lib/src/componentConfig.js";

//initialize the component and command and reference types.
import "/apogeejs-app-lib/src/commandConfig.js";
import "/apogeejs-app-lib/src/referenceConfig.js";

