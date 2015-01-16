/*
This is the module for render-oriented functionality for Components, such as positioning.
*/

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
            else if ((typeof arguments[0] == "object") && (arguments[0].length > 0)){ // If the positioning argument passed is an array with a length greater than zero
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

                // #endregoin
            }
        }

        return positioningAllowed;
    }

    // #endregion

}
