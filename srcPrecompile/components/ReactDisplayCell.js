import Component from "/apogeejs-app-lib/src/component/Component.js";
import Apogee from "/apogeejs-app-lib/src/Apogee.js";
import transformFunctionBody from "/apogeejs-admin/dev/babelTransformer/releases/v0.0.0-p.0/jsxTransform.es.js"
import {getErrorViewModeEntry,getAppCodeViewModeEntry,getFormulaViewModeEntry,getPrivateViewModeEntry} from "/apogeejs-app-lib/src/datasource/standardDataDisplay.js";


/** This method creates the resource. */
function onJsxCodeUpdate(component,jsxFunctionBody) {
    try {
        const functionBody = transformFunctionBody(jsxFunctionBody);

        let actionData = {
            action: "updateCode",
            memberId: component.getField("member.jsx").getId(),
            argList: ["props"],
            functionBody: functionBody,
            supplementalCode: ""
        }

        //Another KLUDGE
        //Lookup the model id from the run context and send a future command
        let app = Apogee.getInstance();
        let appRunContext = app.getRunContext();
        
        setTimeout(() => {
            appRunContext.futureExecuteAction(actionData)
        },0);

    }
    catch(error) {
        //how do I send an error to a function member?
        //I think set data is no allowed, which is the usual way to set an error

        apogeeUserAlert("Error converter JSX code: " + error.toString());
    }
}


///////////////////////////////////////////////////////
// view code
////////////////////////////////////////////////////////

function getOutputElement(component) {
    let elementMember = component.getField("member.jsx");
    if(elementMember.getState() == apogeeutil.STATE_NORMAL) {
        const elementFunction = elementMember.getData();
        return elementFunction()
    }
    else {
        //return <div>Error in JSX code</div>
        let div = document.createElement("div")
        div.innerHTML = "Error in JSX code"
        return div
    }
}


//======================================
// This is the control config, to register the control
//======================================

const ReactDisplayCellConfig = {
    componentClass: Component,
    displayName: "React Display Cell",
    defaultMemberJson: {
        "type": "apogee.Folder",
        "childrenNotWriteable": true,
        "children": {
            "jsx": {
                "name": "jsx",
                "type": "apogee.FunctionMember",
                "fields": {
                    "argList": [],
                    "functionBody": "return ''",
                    "supplementalCode": ""
                }
            },
            "props": {
                "name": "props",
                "type": "apogee.DataMember",
                "fields": {
                    "data": {},
                }
            }
        }
    },
    defaultComponentJson: {
        type: "apogeeapp.ReactDisplayCell",
        fields: {
            jsxCode: ""
        }
    },
    fieldFunctions: {
		jsxCode: {
			fieldChangeHandler: onJsxCodeUpdate 
		}
	},

    viewModes: [
        getErrorViewModeEntry(),
        {
            name: "Display", 
            label: "Display", 
            isActive: true,
            getViewModeElement: (component,showing,size) => getOutputElement(component),
        },
        getAppCodeViewModeEntry("jsxCode",null,"jsxCode","JSX Code",{sourceType: "code", argList:"props", isActive: true /*,textDisplayMode: "ace/mode/js"*/}),
        getFormulaViewModeEntry("member.jsx",{name: "convertedCode", label:"Converted Code"}),
        getFormulaViewModeEntry("member.props","inputProperties","Input Properties"),
        getPrivateViewModeEntry("member.props","inputPrivate","Input Private"),
    ],
    iconResPath: "/icons3/genericCellIcon.png"
}
export default ReactDisplayCellConfig;






