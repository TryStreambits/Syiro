/*
This is the module for render-oriented functionality for Components, such as positioning.
*/

/// <reference path="component.ts" />
/// <reference path="data.ts" />

module syiro.render {

    // #region Positioning of Components or Elements

    export function Position(...args : any[]) : boolean {
        var positioningAllowed : boolean = false; // Define positioningAllowed as a boolean, defaulting to false

        if (arguments.length == 3){ // If three arguments were passed
            var positioningList : Array<string>; // Define positioningList as a list of positions we will be setting for the Component or Element
            var componentObject : Object; // Define componentObject as the Object (if any) that was passed that we will be changing the positioning of
            var componentElement : Element; // Define componentElement as the Element (if a Component Object was passed, of the Component)
            var relativeComponentObject : Object; // Define relativeComponentObject as an Object (if any) that was passed so we know how to relate the positioning of the Component / Element
            var relativeComponentElement : Element; // Define realtiveComponentElement as an Element (if a relativeComponentObject was passed, of the Component)

            if (typeof arguments[0] == "string"){ // If the first argument passed (positioning) is a string
                positioningList = [arguments[0]]; // Define positioningList as an array of the string passed
            }
            else if ((typeof arguments[0] == "object") && (arguments[0].length !== 0)){ // If the positioning argument passed is an array with a length greater than zero
                positioningList = arguments[0]; // Define positioningList as the first argument
            }

            if (syiro.component.IsComponentObject(arguments[1])){ // If the second argument is a Syiro Component Object
                componentObject = arguments[1]; // Define componentObject as the second argument passed
                componentElement = syiro.component.Fetch(componentObject); // Define componentElement as the Component Element that we fetch from the Component Object
            }
            else if ((typeof arguments[1]).toLowerCase().indexOf("element") !== -1){ // If the type of the argument is an Element
                componentElement = arguments[1]; // Define componentElement as the second argument passed
            }

            if (syiro.component.IsComponentObject(arguments[2])){ // If the third argument is a Syiro Component Object
                relativeComponentObject = arguments[2]; // Define componentObject as the second argument passed
                relativeComponentElement = syiro.component.Fetch(relativeComponentObject); // Define relativeComponentElement as the Component Element that we fetch from the relativeComponentObject
            }
            else if ((typeof arguments[2]).toLowerCase().indexOf("element") !== -1){ // If the type of the argument is an Element
                relativeComponentElement = arguments[2]; // Define relativeComponentElement as the second argument passed
            }

            if ((typeof positioningList !== "undefined") && (typeof componentElement !== "undefined") && (typeof relativeComponentElement !== "undefined")){ // If all the variables necessary for positioning are defined
                positioningAllowed = true; // Define positioningAllowed as true

                // #region Primary Component & Relative Component Position Variable Defining

                var primaryComponentDimensionsAndPosition : Object = syiro.component.FetchDimensionsAndPosition(componentElement); // Get the dimensions of the Component
                var relativeComponentDimensionsAndPosition : Object = syiro.component.FetchDimensionsAndPosition(relativeComponentElement); // Get the dimensions and position of the Relative Component Element

                var primaryComponentHeight : number = primaryComponentDimensionsAndPosition["height"]; // Get the height of the primaryComponent
                var primaryComponentWidth : number = primaryComponentDimensionsAndPosition["width"]; // Get the width of the primaryComponent

                var relativeComponentHeight : number = relativeComponentDimensionsAndPosition["height"]; // Get the height of the relativeComponentElement
                var relativeComponentWidth : number = relativeComponentDimensionsAndPosition["width"]; // Get the width of the relativeComponentElement
                var relativeComponentVerticalPosition : number = relativeComponentDimensionsAndPosition["y"]; // Get the vertical position (Y coord) of the relativeComponentElement
                var relativeComponentHorizontalPosition : number = relativeComponentDimensionsAndPosition["x"]; // Get the horizontal position (X coord) of the relativeComponentElement

                var primaryComponentWidthInRelationToRelativeComponent = (primaryComponentWidth - relativeComponentWidth); // Set as the primaryComponent Element width minus the relativeComponent Element width

                // #endregion

                // #region Position Calculation and Setting

                for (var positioningListIndex in positioningList){ // For each position in the positioningList
                    var position : string = positioningList[positioningListIndex]; // Define position as the positioningIndex value in positioningList
                    var positionValue : number; // Define positionValue as the variable to hold the coordinate of where the componentElement should render

                    switch (position) {
                        case "above": // If we are positioning the Component above the relativeComponent
                            if ((relativeComponentVerticalPosition == 0) || (relativeComponentVerticalPosition - primaryComponentHeight < 0)){ // If the vertical position of the relativeComponent Element is zero or the primaryComponent vertical position would end up being less than zero
                                positionValue = relativeComponentHeight; // Set the positionValue to sit below the relativeComponentElement
                            }
                            else{ // If the relativeComponentVerticalPosition is not zero or the primaryComponentElement would not clip
                                positionValue = (relativeComponentVerticalPosition - primaryComponentHeight); // Set the position be the Y coord position of the relativeComponent minus the height of the primaryComponent
                            }

                            break;
                        case "below": // If we are positioning the Component below the relativeComponent
                            if ((relativeComponentVerticalPosition == (window.screen.height - relativeComponentHeight)) || ((relativeComponentVerticalPosition + primaryComponentHeight) > window.screen.height)){ // If the relativeComponent Element is right up against the bottom of the screen or the primaryComponent Element vertical position would end up clipping it below the page
                                positionValue = (relativeComponentVerticalPosition - primaryComponentHeight); // Set the primaryComponent Element to be above the relativeComponentElement so it won't clip.
                            }
                            else{ // If the relativeComponent Element is NOT right up against the bottom of the screen or the primaryComponent Element would not clip
                                positionValue = (relativeComponentVerticalPosition + relativeComponentHeight); // Set the position to be the relative Component Y coord position plus the height the relativeComponent
                            }

                            break;
                        case "left": // If we are positioning the Component to the left of the relativeComponent
                            if ((relativeComponentHorizontalPosition + primaryComponentWidth) <= window.screen.width){ // If the relative Component Element's X position plus the primaryComponent width is less than (or equal to) the screen width
                                positionValue = relativeComponentHorizontalPosition; // Have the positionValue equal the relativeComponent Element's X position
                            }
                            else{ // If the primaryComponent would end up partially clipping outside the page
                                positionValue = (relativeComponentHorizontalPosition - primaryComponentWidthInRelationToRelativeComponent); // Set the position to be the relativeComponent Element's X coord position minus primaryComponentWidthInRelationToRelativeComponent
                            }

                            break;
                        case "center": // If we are positioning the Component centered to the relativeComponent
                            var primaryComponentSideLength = (primaryComponentWidthInRelationToRelativeComponent / 2); // Get the amount of pixels that each side of the primaryComponent would have

                            if ((relativeComponentHorizontalPosition - primaryComponentSideLength) < 0){ // If the primaryComponent would partially clip to the left of the page
                                positionValue = relativeComponentHorizontalPosition; // Set the List to align on the LEFT edge of the relativeComponent instead, to prevent clipping
                            }
                            else if ((relativeComponentHorizontalPosition + primaryComponentSideLength) > window.screen.width){ // If the primaryComponent would partially clip to the right of the page
                                positionValue = (relativeComponentHorizontalPosition - primaryComponentWidthInRelationToRelativeComponent); // Set the position to be the relativeComponent Element's X coord position minus primaryComponentWidthInRelationToRelativeComponent
                            }
                            else{ // If the primaryCOmponent would NOT clip
                                positionValue = (relativeComponentHorizontalPosition - primaryComponentSideLength); // Set the position to be the relativeComponent Element's X coord position minus primaryComponentSideLength(ex. X  = 300. pSL = 80. pV = 220.)
                            }

                            break;
                        case "right": // If we are positioning the Component to the right of the relativeComponent
                            if ((relativeComponentHorizontalPosition - (primaryComponentWidth - relativeComponentWidth)) < 0){ // If aligning the right edge of the relativeComponent and primaryComponent would cause the left part of the primaryComponent to clip to the left side of the page
                                positionValue = relativeComponentHorizontalPosition; // Have the primaryComponent align to the LEFT edge of the relativeComponent instead
                            }
                            else{ // If the primaryComponent would NOT clip
                                positionValue = (relativeComponentHorizontalPosition - primaryComponentWidthInRelationToRelativeComponent); // Set the position to be the relativeComponent Element's X coord position minus primaryComponentWidthInRelationToRelativeComponent (ex. X = 300. pCWR = 160. pV = 140)
                            }

                            break;
                    }

                    if ((position == "above") || (position == "below")){ // If we are setting vertical positioning
                        syiro.component.CSS(componentElement, "top", positionValue.toString() + "px"); // Set the top variable to be the Y position + px (ex. 100px)
                    }
                    else{ // If we are setting horizontal positioning
                        syiro.component.CSS(componentElement, "left", positionValue.toString() + "px"); // Set the left variable to the X position + px (ex. 400px)
                    }
                }

                // #endregion
            }
        }

        return positioningAllowed;
    }

    // #endregion

    // #region Scale Components
	// This function is responsible for scaling Components based on screen information, their initialDimensions data (if any) and scaling of any inner Components or Elements

    export function Scale(component : Object, data ?: Object){
        // #region Variable Setup

		var componentId = component["id"]; // Get the Component Id of the Component
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the componentElement

		var userHorizontalSpace : number = window.screen.width; // Define userHorizontalSpace as the space the user has, in pixels, horizontally.
		var parentHeight : number = componentElement.parentElement.clientHeight; // Set the parentHeight to the parent Element's clientHeight of the Component Element
		var parentWidth : number = componentElement.parentElement.clientWidth; // Set the parentWidth to the parent Element's clientWidth of the Component Element

		// #endregion

        // #region Scaling Data Definition

        var storedScalingData : any = syiro.data.Read(componentId + "->scaling"); // Check if we have any scaling data

        if ((typeof data !== "undefined") && (storedScalingData == false)){ // If data has been defined (passed as second arg) and there is no stored scalingData
            syiro.data.Write(componentId + "->scaling", data); // Write the data to the componentId scaling key/val
            storedScalingData = data; // Define storedScalingData as the data based
        }

        // #endregion

        // #region Initial Dimension Checking

        var initialDimensions : any = syiro.data.Read(componentId + "->scaling->initialDimensions"); // Define initialDimensions as an array of numbers, defaulting to any value (which can technically be false) from componentId->scaling->initialDimensions via syiro.data APIs

        if ((initialDimensions.length !== 2) || (initialDimensions == false)){ // If initialDimensions is not a length of two <height, width>
            if (initialDimensions == false){ // If initialDimensions were not provided (was returned false because it didn't exist)
                initialDimensions = []; // Define initialDimensions as an empty Array
            }

            initialDimensions.push(componentElement.clientHeight); // Append the clientHeight as the second item (or first, depending on if there was any length to begin with)

            if (initialDimensions.length == 1){ // If, after pushing the clientHeight, the initialDimensions is 1 (only height)
                initialDimensions.push(componentElement.clientWidth); // Append the clientWidth as the second item
            }
            else{ // If the initialDimensions.length is now two
                initialDimensions.reverse(); // Reverse the initialDimensions to <height, width>
            }

            syiro.data.Write(componentId + "->scaling->initialDimensions", initialDimensions); // Call syiro.data.Update with the keyList and initialDimensions
        }

        var componentHeight : number = initialDimensions[0]; // Define the componentHeight as the initial height defined
        var componentWidth : number =  initialDimensions[1]; // Define the componentWidth as the initial width defined

        // #endregion

        var ratios : any = syiro.data.Read(componentId + "->scaling->ratios"); // Define ratios an array of numbers <height, width> or false (whatever is initially provided by syiro.data.Read)
        var fill : any = syiro.data.Read(componentId + "->scaling->fill"); // Define ratios as an array of numbers <height, width> or false (whatever is initially provided by syiro.data.Read)

        if (ratios !== false){ // If ratios is defined
            var scalingState = storedScalingData["state"]; // Get the current scaling state if any

            if ((typeof scalingState == "undefined") || (scalingState == false)){ // If no scaling state defined
                syiro.data.Write(componentId + "->scaling->state", "no-scaling"); // Define our scalingState as initial
                scalingState = "no-scaling";
            }

            if (ratios.length == 1){ // If ratios are defined in the scaling data but only one dimension is defined
                ratios.push(1.0); // Push 1.0 as the height ratio. Currently it is the second argument instead of first.
                ratios.reverse(); // Reverse the items so it is once again <height, width>
            }

            if (scalingState == "no-scaling"){ // If we have never scaled this content before or we have scaled it before but are in a no-scaling state
                if (ratios[0] !== 0){ // If the height is supposed to scale
                    componentHeight = (initialDimensions[0] * ratios[0]); // Updated componentHeight is the initialDimensions height * height ratio
				}
				else{ // If the height is not supposed to scale
                    componentHeight = initialDimensions[0]; // Set the updatedComponentHeight to the initialDimensions height
				}

				if (ratios[1] !== 0){ // If the width is supposed to scale
                    componentWidth = (initialDimensions[0] * (ratios[1] / ratios[0])); // Updated componentWidth is the initialDimensions height * heightToWidthRatio (ratios[1] / ratios[0])
				}
				else{ // If the width is not supposed to scale
                    componentWidth = initialDimensions[1]; // Set the width to the initialDimensions width
				}

                scalingState = "scaled";
            }
            else{ // If we have scaled this component and need to set the initialDimensions
                componentHeight = initialDimensions[0]; // Set the componentHeight to the initialDimensions height
                componentWidth = initialDimensions[1]; // Set the componentWidth to the initialDimensions width

                scalingState = "no-scaling"; // Set the scalingState back to no-scaling since we are reverting to initialDimensions
            }

            // #region Component Overflow Prevention

            if (componentWidth > userHorizontalSpace){ // If the width of the updatedComponentWidth is greater than the horizontal space available to the user
                componentWidth = userHorizontalSpace; // Initially the updatedComponentWidth to horizontal space available to the user

                if ((ratios !== false) && (ratios[0] !== 0)){ // If we can scale the height of the Component as necessary
                    componentHeight = (componentWidth * (initialDimensions[0] / initialDimensions[1])); // Define the updatedComponentHeight as the width times the height-to-width pixel ratio
                }
            }

            // #endregion

            syiro.data.Write(componentId + "->scaling->state", scalingState); // Update the state of the Component
        }
        else if (fill !== false){ // If fill is defined
            if (fill.length == 1){ // If fill data is defined in scaling data but only one dimension is defined
    			fill.push(1.0) // Push 1.0 as the height fill. Currently it is the second argument instead of first.
    			fill.reverse(); // Reverse the items so it is once again <height, width>
    		}

            if (fill[0] !== 0){ // If the height is supposed to scale with the parent
                componentHeight = (parentHeight * fill[0]); // Define updatedComponentHeight as the height of the parent our fill percentage
            }
            else{ // If the height of the Component is supposed to remain the same
                componentHeight = initialDimensions[0]; // Define updatedComponentHeight as the initialDimensions height
            }

            if (fill[1] !== 0){ // If the width is supposed to scale with the parent
                componentWidth = (parentWidth * fill[1]); // Define updatedComponentWidth as the width of the parent times our fill percentage
            }
            else{ // If the height of the Component is supposed to remain the same
                componentWidth = initialDimensions[1]; // Define updatedComponentWidth as the initialDimensions width
            }
        }

        syiro.component.CSS(componentElement, "height", componentHeight.toString() + "px"); // Set the height to the updated height data
        syiro.component.CSS(componentElement, "width", componentWidth.toString() + "px"); // Set the width to the updated width data

        // #region Children Scaling

        var potentialComponentScalableChildren : any = syiro.data.Read(component["id"] + "->scaling->children"); // Get any children that need scaling in this Component

        if (potentialComponentScalableChildren !== false){ // If we are scaling child Components or Elements

            // #region Children Component Data Parsing
            // Parses any component data like scaling information passed regarding Children of the Component, sets to own data and changes "children" key / val to point to an array instead

            if (typeof potentialComponentScalableChildren.pop == "undefined"){ // If children key / val is an Object rather than an Array (Array would have .pop)
                var childComponentsArray : Array<Object> = []; // Define childComponents as an array of Objects

                for (var childSelector in potentialComponentScalableChildren){ // For each childSelector in the children section of scaling
                    var childElement : Element = componentElement.querySelector(childSelector); // Get the childElement from componentElement based on the querySelector of the componentElement
                    var childComponent : Object = syiro.component.FetchComponentObject(childElement); // Fetch the Component Object (or generate one if it doesn't exist already)

                    syiro.data.Write(childComponent["id"] + "->scaling", syiro.data.Read(component["id"] + "->scaling->children->" + childSelector + "->scaling")); // Write the scaling information from component->scaling->children ETC to the childComponent scaling key/val
                    childComponentsArray.push(childComponent); // Push the childComponent to the childComponentsArray Array of Objects
                    syiro.data.Delete(component["id"] + "->scaling->children->" + childSelector); // Delete the childSelector from scaling children in component
                }

                syiro.data.Write(component["id"] + "->scaling->children", childComponentsArray); // Set the childComponentsArray to the component->scaling->children via syiro.data.Write
            }

            // #endregion

            var componentChildren : Array<Object> = syiro.data.Read(component["id"] + "->scaling->children"); // Define componentChildren as the children in component->scaling->children

            for (var childComponentIndex = 0; childComponentIndex < componentChildren.length; childComponentIndex++){ // For each childComponent in the Children scaling Object
                var childComponentObject : Object = componentChildren[childComponentIndex]; // Define childComponentObject as the index of the Object from key / val children
                syiro.render.Scale(childComponentObject); // Scale the child Component
            }
        }

        // #endregion
    }

}
