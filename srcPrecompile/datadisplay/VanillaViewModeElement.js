export default function VanillaViewModeElement({sourceState,getDataDisplay,cellShowing,setEditMode,size}) {

    //this is just for debugging
    let [identifier,setIdentifier] = React.useState(() => apogeeutil.getUniqueString())

    let reloadData = false

    //Get the mutable object for the vanilla javascript display
    let vanillaRef = React.useRef(null)
    let cellShowingRef = React.useRef(false)
    let wasCellShowing = cellShowingRef.current

    let dataDisplay = vanillaRef.current
    if((!dataDisplay)||(sourceState.reloadDataDisplay)) {
        //PRIOBABLY CLEAN UP HOW I DO THIS
        dataDisplay = getDataDisplay(sourceState)
        dataDisplay.setSourceState(sourceState)
        vanillaRef.current = dataDisplay 
        reloadData = true
    }
    else if(sourceState.reloadData)  {
        dataDisplay.setSourceState(sourceState)
        reloadData = true
    }
    else if((!wasCellShowing)&&(cellShowing)) {
        //reload the data if the cell is set to showing from not showing
        reloadData = true
    }

    cellShowingRef.current = cellShowing

    dataDisplay.setEditModeCallback(setEditMode)

    //hide/show display element
    const styleData = sourceState.hideDisplay ? {display: "none"} : {}

    //---------------
    //manage the vanilla display element
    //---------------
    const viewRef = React.useRef()

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

    },[dataDisplay])

    //update data display content
    React.useEffect(() => {
        if(reloadData) {
            dataDisplay.showDisplay()
        }
    })

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