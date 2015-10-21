/*
This is the namespace for render-oriented functionality for Components, such as positioning.
*/

/// <reference path="component.ts" />
/// <reference path="data.ts" />
/// <reference path="utilities.ts" />

namespace syiro.render {

	// #region Positioning of Components or Elements

	export function Position(positioningList : (string | Array<string>), componentObject : any, relativeComponentObject : any) : boolean {
		var positioningAllowed : boolean = false; // Define positioningAllowed as a boolean, defaulting to false

		if (arguments.length == 3){ // If three arguments were passed
			var componentElement : Element; // Define componentElement as the Element (if a Component Object was passed, of the Component)
			var relativeComponentElement : Element; // Define realtiveComponentElement as an Element (if a relativeComponentObject was passed, of the Component)

			var typeOfPositioningList : string = syiro.utilities.TypeOfThing(positioningList); // Get the type of the positioningList

			if (typeOfPositioningList == "string"){ // If the positioningList is a string
				positioningList = [arguments[0]]; // Redefine as an array
			} else if ((typeOfPositioningList == "Array") && (positioningList.length !== 0)){ // If the positioning argument passed is an array with a length greater than zero
				positioningList = positioningList; // Define positioningList as the first argument
			}

			if (syiro.utilities.TypeOfThing(componentObject) == "ComponentObject"){ // If the componentObject passed is in fact a Syiro Component Object
				componentElement = syiro.component.Fetch(componentObject); // Define componentElement as the Component Element that we fetch from the Component Object
			}

			if (syiro.utilities.TypeOfThing(relativeComponentObject) == "ComponentObject"){ // If the relativeComponentObject passed is in fact a Syiro Component Object
				relativeComponentElement = syiro.component.Fetch(relativeComponentObject); // Define relativeComponentElement as the Component Element that we fetch from the relativeComponentObject
			}

			if ((typeof positioningList == "object") && (componentElement !== null) && (relativeComponentElement !== null)){ // If all the variables necessary for positioning are defined
				positioningAllowed = true; // Define positioningAllowed as true

				// #region Primary Component & Relative Component Position Variable Defining

				var componentDimensionsAndPosition : Object = syiro.component.FetchDimensionsAndPosition(componentElement); // Get the dimensions of the Component
				var relativeComponentDimensionsAndPosition : Object = syiro.component.FetchDimensionsAndPosition(relativeComponentElement); // Get the dimensions and position of the Relative Component Element

				var componentHeight : number = componentDimensionsAndPosition["height"]; // Get the height of the primaryComponent
				var componentWidth : number = componentDimensionsAndPosition["width"]; // Get the width of the primaryComponent

				var relativeComponentHeight : number = relativeComponentDimensionsAndPosition["height"]; // Get the height of the relativeComponentElement
				var relativeComponentWidth : number = relativeComponentDimensionsAndPosition["width"]; // Get the width of the relativeComponentElement
				var relativeComponentYPosition : number = relativeComponentDimensionsAndPosition["y"]; // Get the Y position (Y coord) of the relativeComponentElement
				var relativeComponentXPosition : number = relativeComponentDimensionsAndPosition["x"]; // Get the Y position (X coord) of the relativeComponentElement

				var componentWidthDifference = (componentWidth - relativeComponentWidth); // Set as the componentElement width minus the relativeComponent Element width

				// #endregion

				// #region Position Calculation and Setting

				var componentAbovePosition : number = (relativeComponentYPosition - componentHeight); // Set the Component's above position to the relative Component's Y position minus the height of the component we are positioning
				var componentBelowPosition : number = (relativeComponentYPosition + relativeComponentHeight); // Set the Component's below position to the relative Component's Y position plus the height of said Component
				var componentLeftPosition : number = relativeComponentXPosition; // Set the Component's left position to the same as the relative Component's X position, since we are aligning to the left edge of the Components
				var componentRightPosition : number = relativeComponentXPosition; // Initially set componentRightPosition to the relative Component's X position (assume initially that widths are same)

				if (componentWidthDifference > 0){ // If the Component is wider than the relative Component
					componentRightPosition = (relativeComponentXPosition - componentWidthDifference); // Set componentRightPosition to the X position of the relativeComponent minus the difference in width
				} else if (componentWidthDifference < 0){ // If the Component is narrower than the relative Component
					componentRightPosition = (relativeComponentXPosition + Math.abs(componentWidthDifference)); // Set componentRightPosition to the X position + the positive form (using Math.abs) of the negative difference number
				}

				for (var position of positioningList){ // For each position in the positioningList
					var positionValue : number; // Define positionValue as the variable to hold the coordinate of where the componentElement should render

					switch (position) {
						case "above": // If we are positioning the Component above the relativeComponent
							if (componentAbovePosition >= 0){ // If the component will not clip on the top of the page
								positionValue = componentAbovePosition; // Set positionValue to componentAbovePosition
							} else { // If it would clip the top of the page
								positionValue = componentBelowPosition; // Force to position below instead of above
							}

							break;
						case "below": // If we are positioning the Component below the relativeComponent
							if (componentBelowPosition <= (syiro.device.height - componentHeight)){ // If the Component would not be clipping through the bottom of the screen
								positionValue = componentBelowPosition; // Set positionValue to componentBelowPosition
							} else { // If it would clip the bottom of the page
								positionValue = componentAbovePosition; // Force to position above instead of below
							}

							break;
						case "left": // If we are positioning the Component to the left of the relativeComponent
							if ((componentLeftPosition >= 0) && ((componentLeftPosition + componentWidth) < (syiro.device.width - componentWidth))){ // If the left position is greater or equal to zero but doesn't partially clip on right side of page
								positionValue = componentLeftPosition; // Set positionValue to componentLeftPosition
							} else { // If it is less than zero or clips the page
								positionValue = componentRightPosition; // Force to position right instead of left.
							}

							break;
						case "right": // If we are positioning the Component to the right of the relativeComponent
							if (componentRightPosition > 0){ //If the Component will not clip on the left side of the page
								positionValue = componentRightPosition; // Set positionValue to the componentRightPosition
							} else { // If the Component will clip on the left side of the page
								positionValue = componentLeftPosition; // Force to position left instead of right
							}

							break;
						case "center": // If we are positioning the Component centered to the relativeComponent
							if (componentWidthDifference > 0){ // If the Component is wider than the relative Component
								var primaryComponentSideLength = (componentWidthDifference / 2); // Get the amount of pixels that each side of the primaryComponent would have

								if (((relativeComponentXPosition - primaryComponentSideLength) + componentWidth) > syiro.device.width){ // If the X position of the relative Component minus the diff (since Component is wider) plus the total length means it will clip the right side of the page
									positionValue = componentRightPosition; // Force to position right instead of center
								} else if ((relativeComponentXPosition - primaryComponentSideLength) < 0){ // If the relative Component X position minus the side difference means the Component will clip the left side of the page
									positionValue = componentLeftPosition; // Force to position left instead of center
								} else { // If it will not clip on either side
									positionValue = (relativeComponentXPosition - primaryComponentSideLength); // Set positionValue to the centered value
								}
							} else if (componentWidthDifference < 0){ // If the Component is narrower than the relative Component
								positionValue = (relativeComponentXPosition + (Math.abs(componentWidthDifference) / 2)); // Set the positionValue to be the X position of the relative Component plus the positive form of componentWidthDifference (since it is negative) divided by 2
							} else { // If the Component and relative Component widths are equal
								positionValue = relativeComponentXPosition; // Set to the X position of the relative Component
							}

							break;
					}

					if ((position == "above") || (position == "below")){ // If we are setting vertical positioning
						syiro.component.CSS(componentElement, "top", positionValue.toString() + "px"); // Set the top variable to be the Y position + px (ex. 100px)
					} else { // If we are setting horizontal positioning
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

	export function Scale(component : ComponentObject, data ?: Object){
		// #region Variable Setup

		var componentId = component.id; // Get the Component Id of the Component
		var componentElement : Element = syiro.component.Fetch(component); // Fetch the componentElement

		var parentHeight : number = componentElement.parentElement.clientHeight; // Set the parentHeight to the parent Element's clientHeight of the Component Element
		var parentWidth : number = componentElement.parentElement.clientWidth; // Set the parentWidth to the parent Element's clientWidth of the Component Element

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
			} else { // If the initialDimensions.length is now two
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
			var scalingState = syiro.data.Read(componentId + "->scaling->state"); // Get the current scaling state if any

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
				} else { // If the height is not supposed to scale
					componentHeight = initialDimensions[0]; // Set the updatedComponentHeight to the initialDimensions height
				}

				if (ratios[1] !== 0){ // If the width is supposed to scale
					componentWidth = (initialDimensions[0] * (ratios[1] / ratios[0])); // Updated componentWidth is the initialDimensions height * heightToWidthRatio (ratios[1] / ratios[0])
				} else { // If the width is not supposed to scale
					componentWidth = initialDimensions[1]; // Set the width to the initialDimensions width
				}

				scalingState = "scaled";
			} else { // If we have scaled this component and need to set the initialDimensions
				componentHeight = initialDimensions[0]; // Set the componentHeight to the initialDimensions height
				componentWidth = initialDimensions[1]; // Set the componentWidth to the initialDimensions width

				scalingState = "no-scaling"; // Set the scalingState back to no-scaling since we are reverting to initialDimensions
			}

			// #region Component Overflow Prevention

			if (componentWidth > syiro.device.width){ // If the width of the updatedComponentWidth is greater than the horizontal space available to the user
				componentWidth = syiro.device.width; // Initially the updatedComponentWidth to horizontal space available to the user

				if ((ratios !== false) && (ratios[0] !== 0)){ // If we can scale the height of the Component as necessary
					componentHeight = (componentWidth * (initialDimensions[0] / initialDimensions[1])); // Define the updatedComponentHeight as the width times the height-to-width pixel ratio
				}
			}

			// #endregion

			syiro.data.Write(componentId + "->scaling->state", scalingState); // Update the state of the Component
		} else if (fill !== false){ // If fill is defined
			if (fill.length == 1){ // If fill data is defined in scaling data but only one dimension is defined
				fill.push(1.0) // Push 1.0 as the height fill. Currently it is the second argument instead of first.
				fill.reverse(); // Reverse the items so it is once again <height, width>
			}

			if (fill[0] !== 0){ // If the height is supposed to scale with the parent
				componentHeight = (parentHeight * fill[0]); // Define updatedComponentHeight as the height of the parent our fill percentage
			} else { // If the height of the Component is supposed to remain the same
				componentHeight = initialDimensions[0]; // Define updatedComponentHeight as the initialDimensions height
			}

			if (fill[1] !== 0){ // If the width is supposed to scale with the parent
				componentWidth = (parentWidth * fill[1]); // Define updatedComponentWidth as the width of the parent times our fill percentage
			} else { // If the height of the Component is supposed to remain the same
				componentWidth = initialDimensions[1]; // Define updatedComponentWidth as the initialDimensions width
			}
		}

		syiro.component.CSS(componentElement, "height", componentHeight.toString() + "px"); // Set the height to the updated height data
		syiro.component.CSS(componentElement, "width", componentWidth.toString() + "px"); // Set the width to the updated width data

		// #region Children Scaling

		var potentialComponentScalableChildren : any = syiro.data.Read(component.id + "->scaling->children"); // Get any children that need scaling in this Component

		if (potentialComponentScalableChildren !== false){ // If we are scaling child Components or Elements

			// #region Children Component Data Parsing
			// Parses any component data like scaling information passed regarding Children of the Component, sets to own data and changes "children" key / val to point to an array instead

			if (typeof potentialComponentScalableChildren.pop == "undefined"){ // If children key / val is an Object rather than an Array (Array would have .pop)
				var childComponentsArray : Array<Object> = []; // Define childComponents as an array of Objects

				for (var childSelector in potentialComponentScalableChildren){ // For each childSelector in the children section of scaling
					var childElement : Element = componentElement.querySelector(childSelector); // Get the childElement from componentElement based on the querySelector of the componentElement
					var childComponent : Object = syiro.component.FetchComponentObject(childElement); // Fetch the Component Object (or generate one if it doesn't exist already)
					var childScalingData : Object = syiro.data.Read(component.id + "->scaling->children->" + childSelector + "->scaling"); // Get the scalingData for the child

					syiro.data.Write(childComponent["id"] + "->scaling->initialDimensions", childScalingData["iniitalDimensions"]); // Write any initialDimensions that exist
					syiro.data.Write(childComponent["id"] + "->scaling->ratios", childScalingData["ratios"]); // Write any ratios that exist
					syiro.data.Write(childComponent["id"] + "->scaling->fill", childScalingData["fill"]); // Write any fill data that exist

					childComponentsArray.push(childComponent); // Push the childComponent to the childComponentsArray Array of Objects
					syiro.data.Delete(component.id + "->scaling->children->" + childSelector); // Delete the childSelector from scaling children in component
				}

				syiro.data.Write(component.id + "->scaling->children", childComponentsArray); // Set the childComponentsArray to the component->scaling->children via syiro.data.Write
			}

			// #endregion

			var componentChildren : Array<ComponentObject> = syiro.data.Read(component.id + "->scaling->children"); // Define componentChildren as the children in component->scaling->children

			for (var childComponentIndex = 0; childComponentIndex < componentChildren.length; childComponentIndex++){ // For each childComponent in the Children scaling Object
				var childComponentObject : ComponentObject = componentChildren[childComponentIndex]; // Define childComponentObject as the index of the Object from key / val children
				syiro.render.Scale(childComponentObject); // Scale the child Component
			}
		}

		// #endregion
	}

}
