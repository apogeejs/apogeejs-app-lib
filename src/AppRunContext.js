import { BaseRunContext } from "/apogeejs-model-lib/src/apogeeModelLib.js";

export default class AppRunContext extends BaseRunContext {
    constructor(app) {
        super();
        this.app = app;
    }  

    getConfirmedModel() {
        return this.app.getWorkspaceManager().getModelManager().getModel();
    }

    futureExecuteAction(modelId,actionData) {
        //create a command to run this action
        let modelActionCommand = {};
        modelActionCommand.type = "futureModelActionCommand";
        modelActionCommand.modelId = modelId;
        modelActionCommand.action = actionData;

        this.app.executeCommand(modelActionCommand);
    }


};