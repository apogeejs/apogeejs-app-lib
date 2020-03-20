import Component from "/apogeeapp/component/Component.js";

/** This component represents a table object. */
export default class DynamicForm extends Component {
        
    constructor(member,modelManager) {
        //extend edit component
        super(member,modelManager);
    };

}

//======================================
// This is the component generator, to register the component
//======================================

DynamicForm.displayName = "Dynamic Form";
DynamicForm.uniqueName = "apogeeapp.app.DynamicForm";
DynamicForm.DEFAULT_MEMBER_JSON = {
    "type": "apogee.FunctionTable",
    "updateData": {
        "argList": ["admin"]
    }
};
