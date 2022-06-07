/** This is the implementation of the run context, implementing the interface definition of ModelRunContext. */
export default class AppRunContext {
    constructor(app) {
        this.app = app;
    }

    /** This method should return true if the run context is active and false if it has been stopped. For example, if an application
     * is the run context and it has been closed, this should return false.
     */
     getIsActive() {
        return (this.app) ? true : false; 
    }
    
    deactivate() {
        this.app = null;
    }

    getConfirmedModel() {
        if(this.app) {
            try {
                return this.app.getWorkspaceManager().getModelManager().getModel();
            }
            catch(error) {
                //no op - and no recovery. This shouldn't happen but if it does all we can do is return null.
                //allow fall through to return null 
            }
        }
            
        return null;
    }
    //also add this.inProcessModel = null to the constructor

    setInProcessModel(model) {
        this.inProcessModel = model
    }

    // do we need these? -----
    acceptInProcessModel() {
        this.inProcessModel = null
    }

    clearInProcessModel() {
        this.inProcessModel = null
    }
    //----------------------------

    getCurrentModel() {
        return this.inProcessModel ? this.inProcessModel : this.getConfirmedModel()
    }

    futureExecuteAction(actionData) {
        //if this context instance is not active, ignore command
        if(!this.getIsActive()) return

        //create a command to run this action
        let modelActionCommand = {}
        modelActionCommand.type = "futureModelActionCommand"
        modelActionCommand.modelId = this.getCurrentModel().getId()
        modelActionCommand.action = actionData

        this.app.executeCommand(modelActionCommand)
    }


};