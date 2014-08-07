/*
 This is the module for Rocket Button components.
*/

/// <reference path="core.ts" />
/// <reference path="definitions/jquery.d.ts" />

module rocket.button {

	// #region Button Listener

	export function Listen(component : Object, primaryCallback : Function, secondaryCallback ?: Function){
		var buttonElement : Element = rocket.core.Get(component);

		$(buttonElement).on("click touchend MSPointerUp", { primaryFunction : primaryCallback, secondaryFunction : secondaryCallback},
			function(e : JQueryEventObject){
				var $rocketComponent = e.currentTarget; // Define $rocketComponent as the component that has been triggered

				var primaryFunction : Function = e.data["primaryFunction"];
				var secondaryFunction : Function = e.data["secondaryFunction"];

				if ($($rocketComponent).attr("data-rocket-component-type") == "toggle"){
					var toggleValue : string = $($rocketComponent).attr("data-rocket-component-status");
					var newToggleValue : string;

					if (toggleValue == "false"){ // If the CURRENT toggle value is FALSE
						newToggleValue = "true"; // Set the NEW toggle value to TRUE

						if (secondaryFunction !== undefined){ // If the secondary function is defined
							secondaryFunction(new Boolean(newToggleValue)); // Call the secondary function
						}
						else{ // If the secondary function is NOT defined
							primaryFunction(new Boolean(newToggleValue)); // Call the primary function
						}
					}
					else{ // If the CURRENT toggle value is TRUE
						newToggleValue = "false"; // Set the NEW toggle value to FALSE
						primaryFunction(newToggleValue);
					}

					$($rocketComponent).attr("data-rocket-component-status", newToggleValue); // Update the status
				}
				else{ // If the component is a basic button
					primaryFunction(); // Call the primary function
				}
			}
		);
	}

	// #endregion
}