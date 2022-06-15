export default function VanillaViewModeElement({component,getDataDisplay,showing,setEditModeData,setMsgData,size,setSizeCommandData}) {

    //this is just for debugging
    let [identifier,setIdentifier] = React.useState(() => apogeeutil.getUniqueString())

    //Get the mutable object for the vanilla javascript display
    let vanillaRef = React.useRef(null)
    let dataDisplay = vanillaRef.current
    if(!dataDisplay) {
        dataDisplay = getDataDisplay(component)
        dataDisplay.setEditModeState(setEditModeData)
        dataDisplay.setMsgState(setMsgData)
        dataDisplay.setSizeCommandCallback(setSizeCommandData)

        //NEW CODE TEST
        dataDisplay.updateData()

        vanillaRef.current = dataDisplay     
    }

    //manage adding and removing the vanilla display element
    const viewRef = React.useRef()

    let [showDataVersion,setShowDataVersion] = React.useState(0)
    let [reloadDataDisplayVersion,setReloadDataDisplayVersion] = React.useState(0)
    let activeShowDataVersion = showDataVersion
    let activeReloadDataDisplayVersion = reloadDataDisplayVersion
    
    //-----------------
    // Manage the data display wrapper
    //-----------------

    //update if the component changes
    if(dataDisplay.getComponent() != component) { 
        dataDisplay.setComponent(component)
        dataDisplay.setEditModeState(setEditModeData)
        dataDisplay.setMsgState(setMsgData)

        let {reloadData,reloadDataDisplay} = dataDisplay.doUpdate();

        if(reloadDataDisplay) {
            //NEED TO HANDLE EDIT MODE!!!
            //create a new data display
            dataDisplay = getDataDisplay(component)
            dataDisplay.setEditModeState(setEditModeData)
            dataDisplay.setMsgState(setMsgData)

            vanillaRef.current = dataDisplay

            //NEW CODE TEST
            dataDisplay.updateData()

            activeShowDataVersion = showDataVersion + 1
            setShowDataVersion(activeShowDataVersion) //make this repeat after a certain value?
            activeReloadDataDisplayVersion = reloadDataDisplayVersion + 1
            setReloadDataDisplayVersion(activeReloadDataDisplayVersion) //make this repeat after a certain value?
            
        }
        else if(reloadData) {
            //only update data in display if we are not in edit mode
            if(!dataDisplay.isInEditMode()) {

                //NEW CODE TEST
                dataDisplay.updateData()

                activeShowDataVersion = showDataVersion + 1
                setShowDataVersion(activeShowDataVersion)
            }
        }
    }

    const hideDisplay = dataDisplay.getHideDisplay()
    const styleData = hideDisplay ? {display: "none"} : {}

    //---------------
    //manage the vanilla display element
    //---------------

    //add/remove data display content
    React.useEffect(() => {
        //set the new data display
        viewRef.current.appendChild(dataDisplay.getContent())
        if(dataDisplay.onLoad) dataDisplay.onLoad()

        //cleanup old data display
        return () => {
            viewRef.current.removeChild(dataDisplay.getContent())
            if(dataDisplay.onUnload) dataDisplay.onUnload()
            if(dataDisplay.destroy) dataDisplay.destroy()
        }

    },[activeReloadDataDisplayVersion])

    //update data display content
    React.useEffect(() => {
        dataDisplay.showDisplay()
    },[activeShowDataVersion,showing,hideDisplay])

    //udpate display size
    React.useEffect(() => {
        if((dataDisplay.setSize)&&(size !== null)) dataDisplay.setSize(size)
    },[size])

    //---------------
    // Render react element
    //---------------

    return (
        <div >
            {<div ref={viewRef} className="visiui_displayContainer_viewContainerClass" style={styleData}/>}
        </div>
    )
}