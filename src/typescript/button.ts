/*
 This is the module for Rocket Button components.
*/

/// <reference path="core.ts" />

module rocket.button {

	// #region Button Listener

	export function Listen(component : Object, primaryCallback : Function, secondaryCallback ?: Function){
		var buttonElement : Element = rocket.core.Get(component);
		var handlersArray : Array<Function> = []; // Define handlersArray as an array of functions

		handlersArray.push(primaryCallback); // Push the primaryCallback to the handlersArray

		if (secondaryCallback !== undefined){ // If a secondary function is defined
			handlersArray.push(secondaryCallback); // Push the secondaryCallback to the handlersArray
		}

		rocket.core.storedComponents[component["id"]]["handlers"] = handlersArray; // Set the handlers for this particular component in the storedComponents to handlersArray

		var buttonEventListener = function(){ // Define buttonEventHandler as a binding to a function called handler that passes the component object
			var componentObject = arguments[0]; // Set the componentsObject to the first argument (since bind forces the data to be the first arg)
			var componentElement : Element = rocket.core.Get(componentObject); // Get the component element

			var handlersArray : Array<Function> = rocket.core.storedComponents[componentObject["id"]]["handlers"]; // Fetch the handlers and assign it to the handlersArray

			var primaryFunction : Function = handlersArray[0];
			var secondaryFunction : Function = handlersArray[1];


			if (componentElement.getAttribute("data-rocket-component-type") == "toggle"){
				var toggleValue : string = componentElement.getAttribute("data-rocket-component-status");
				var newToggleValue : any;

				if (toggleValue == "false"){ // If the CURRENT toggle value is FALSE
					newToggleValue = "true"; // Set the NEW toggle value to TRUE
				}
				else{ // If the CURRENT toggle value is TRUE
					newToggleValue = "false"; // Set the NEW toggle value to FALSE
				}

				componentElement.setAttribute("data-rocket-component-status", newToggleValue); // Update the status

				newToggleValue = Boolean(newToggleValue); // Convert from string to Boolean for function call

				if (secondaryFunction !== undefined){ // If the secondary function is defined
					secondaryFunction(); // Call the secondary function
				}
				else{ // If the secondary function is NOT defined
					primaryFunction(newToggleValue); // Call the primary function
				}
			}
			else{ // If the component is a basic button
				primaryFunction(); // Call the primary function
			}

		}.bind(this, component);

		buttonElement.addEventListener( // Add the event listener
			"click touchend MSPointerUp",
			buttonEventListener
		)
	}

	// #endregion
}