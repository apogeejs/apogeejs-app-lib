import {bannerConstants,getBanner,getIconOverlay} from "/apogeeapp/app/component/banner.js";

import WebDisplayContainer from "/apogeeapp/app/component/literatepage/PageDisplayContainer.js";

/** This is the component display for a web page.
 * NOTES:
 * - I currently allow only one view to be displayed. The can be changed to allow multiple display containers and views.
 */
export default class WebComponentDisplay {

    constructor(component, activeView) {
        this.component = component;
        this.member = component.getMember();
        this.webParentDisplay = webParentDisplay;

        this.activeView = activeView;
        this.displayContainer = null;
        
        //these are the header elements
        this.mainElement = null;
        this.bannerContainer = null;
        
        this.isPageShowing = false;
    
        //this is the window in which the component is displayed
        this.loadComponentDisplay();

        //add a cleanup action to the base component - component must already be initialized
    //    this.addCleanupAction(PageChildComponentDisplay.destroy);
    };

    getElement() {
        return this.mainElement;
    }

    getComponent() {
        return this.component;
    }

    getMember() {
        return this.member;
    }

    setBannerState(bannerState,bannerMessage) {
        //update the banner
        var bannerDiv;
        if(bannerState == bannerConstants.BANNER_TYPE_NONE) {
            bannerDiv = null;
        }
        else {
            bannerDiv = getBanner(bannerMessage,bannerState);
        }
        apogeeapp.ui.removeAllChildren(this.bannerContainer);
        if(bannerDiv) {
            this.bannerContainer.appendChild(bannerDiv);
        }
    }

    updateData() {
        this.displayContainer.memberUpdated();
    }

    /** This gets the current window state, to reconstruct the view. */
    getStateJson() {
        return undefined;
    }

    /** This gets the current window state, to reconstruct the view. */
    setStateJson(json) {
        
    }

    /** This will reload the given data display. */
    reloadDisplay(viewType) {
        if(viewType == this.activeView) {
            if(this.displayContainer) {
                displayContainer.forceClearDisplay();
            }
        }
    }

    /** This should be called by the component when it discards this display. */
    deleteDisplay() {
        //dispose any view elements
        if(this.displayContainer) {
            this.displayContainer.destroy();
            this.displayContainer = null;
        }
    }


    //===============================
    // Private Functions
    //===============================


    /** This is the standard window for the component.  
     * @private */
    loadComponentDisplay() {

        //make the container
        this.mainElement = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_mainClass",null);
        
        //add banner container
        this.bannerContainer = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_bannerContainerClass",this.mainElement);
        
        //add the view container
        this.viewContainer = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_viewContainerClass",this.mainElement);
        
        //create the view element
        this.displayContainer = new WebDisplayContainer(this.component, activeView);
        
        //add the view display
        this.viewContainer.appendChild(displayContainer.getDisplayElement());
    }

}

