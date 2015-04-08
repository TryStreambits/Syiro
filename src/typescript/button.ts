/*
 This is the module for the Syiro Button, Buttongroup, and Toggle Button components.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

// #region Syiro Button and Toggle Button Functionality

module syiro.button {

	// #region Basic and Toggle Button Generator

	export function Generate(properties : Object) : Object { // Generate a Button Component and return a Component Object
		if (properties["type"] == undefined){ // If the type is undefined
			properties["type"] = "basic"; // Default to a basic button
		}

		var componentId : string = syiro.generator.IdGen("button"); // Generate a component Id
		var componentElement : HTMLElement; // Define componentElement as an HTMLElement

		// #region Initial Button Component Data Generation

		var componentData : Object = {
			"data-syiro-component" : "button", // Set data-syiro-component to Button
			"data-syiro-component-type" : properties["type"], // Be more granular with exactly what type of Button this is
			"role" : "button" // Define the ARIA role as button
		};

		if (properties["type"] == "basic"){ // If this is a Basic Button that is being generated
			if (typeof properties["icon"] == "string"){ // If an icon is defined and it is a string
				syiro.component.CSS(componentElement, "background-image", 'url("' + properties["icon"] + '")'); // Set the backgroundImage to the icon URL specified
				delete properties["icon"]; // Remove the "icon" key
			}

			if (typeof properties["content"] == "string"){ // If content is defined and it is a string
				componentData["content"] = properties["content"]; // Set the componentData content of the button
				delete properties["content"]; // Remove the "content" key
			}
		}
		else{ // If this is a Toggle Button that is being generated
			var buttonToggleAttributes = { "data-syiro-minor-component" : "buttonToggle"}; // Create an Object to hold the attributes we'll pass when creating the buttonToggle

			if ((typeof properties["default"] == "boolean") && (properties["default"] == true)){ // If a default state for the button is defined and is defined as true (already active)
				buttonToggleAttributes["data-syiro-component-status"] = "true"; // Add the data-syiro-component-status attribute with "true" as the value
				delete properties["default"]; // Remove the "content" key
			}

			componentData["content"] = syiro.generator.ElementCreator("div", buttonToggleAttributes); // Set the componentData content to the Button Toggle we generate
		}

		delete properties["type"]; // Remove the "type" key

		componentElement = syiro.generator.ElementCreator(componentId, "div", componentData); // Generate the Component Element with the componentData provided

		for (var propertyKey in properties){ // Recursive go through any other attributes that needs to be set.
			componentElement.setAttribute(propertyKey, properties[propertyKey]); // Treat it like an attribute
		}

		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component
		return { "id" : componentId, "type" : "button" }; // Return a Component Object
	}

	// #endregion

	// #region Function for setting the icon of a Button

	export function SetIcon(component : Object, content : string) : boolean { // Returns boolean value in relation to success
		var setSucceeded : boolean; // Define setSucceded as the boolean we return in relation to whether we successfully set the button label

		var componentElement = syiro.component.Fetch(component); // Get the componentElement

		if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") == "basic")){ // If the button exists in syiro.data.storage or DOM AND button is "basic" rather than toggle
			syiro.component.CSS(componentElement, "background-image", 'url("' + content + '")'); // Set the backgroundImage to the content specified
			syiro.component.Update(component["id"] + "->HTMLElement", componentElement); // Update the storedComponent (if necessary)
			setSucceeded = true; // Define setSucceeded as true
		}
		else{ // If it is NOT a basic button
			setSucceeded = false; // Define setSucceeded as false
		}

		return setSucceeded; // Return the boolean value
	}

	// #endregion

	// #region Function for setting the label of a Button

	export function SetLabel(component : Object, content : string) : boolean { // Returns boolean value in relation to success
		var setSucceeded : boolean; // Define setSucceded as the boolean we return in relation to whether we successfully set the button label

		var componentElement = syiro.component.Fetch(component); // Get the componentElement

		if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") == "basic")){ // If the button exists in syiro.data.storage or DOM AND button is "basic" rather than toggle
			componentElement.textContent = content; // Set the button component textContent
			syiro.component.Update(component["id"], componentElement); // Update the storedComponent (if necessary)
			setSucceeded = true; // Define setSucceeded as true
		}
		else{ // If it is NOT a basic button
			setSucceeded = false; // Define setSucceeded as false
		}

		return setSucceeded; // Return the boolean value
	}

	// #endregion

}

// #endregion

// #region Syiro Buttongroup Component

module syiro.buttongroup {

	// #region Buttongroup Generator

	export function Generate(properties : Object){
		if (typeof properties["items"] !== "undefined"){ // If items is defined
			if (properties["items"].length >= 2){ // If the length of items is equal to or greater than 2
				var componentId : string = syiro.generator.IdGen("buttongroup"); // Generate a component Id
				var componentElement : HTMLElement = syiro.generator.ElementCreator("div", { "data-syiro-component" : "buttongroup", "data-syiro-component-id" : componentId } );

				for (var buttonItemIndex in properties["items"]){
					var buttonItem : Object = properties["items"][buttonItemIndex];

					if (syiro.component.IsComponentObject(buttonItem) == false){ // If the buttonItem provided is NOT Syiro Component Object
						buttonItem = syiro.button.Generate(buttonItem); // Redefine buttonItem as the provided Button Component Object when we use generate a Syiro Button with the buttonItem current content
					}

					var buttonElement : Element = syiro.component.Fetch(buttonItem); // Define buttonElement as the fetched Button Element of the Button Component
					componentElement.appendChild(buttonElement); // Append the buttonElement
					syiro.data.Delete(buttonItem["id"] + "->HTMLElement"); // Delete the Button HTMLElement from storage to eliminate unnecessary calls with the MutationObserver
				}

				componentElement = syiro.buttongroup.CalculateInnerButtonWidth(componentElement); // Update componentElement with the inner Button width calculations

				if ((typeof properties["active"] == "number") && (properties["active"]  <= properties["items"].length)){ // If the active Number is provided and it is less than or equal to the max amount of buttons in this Buttongroup
					var defaultActiveButton = componentElement.querySelector('div[data-syiro-component="button"]:nth-of-type(' + properties["active"] + ')');
					var activeButtonComponent = syiro.component.FetchComponentObject(defaultActiveButton); // Get this button's component so we can update any HTMLElement stored in Syiro's data system
					defaultActiveButton.setAttribute("active", ""); // Set active attribute
					syiro.component.Update(activeButtonComponent["id"], defaultActiveButton); // Update the default active button HTMLElement
				}

				syiro.data.Write(componentId + "->HTMLElement", componentElement); // Write the HTMLElement to the Syiro Data System
				return { "id" : componentId, "type" : "buttongroup" }; // Return a Component Object
			}
		}
	}

	// #endregion

	// #region Buttongroup - Inner Button Width Calculation

	export function CalculateInnerButtonWidth(component : any){
		var componentElement : HTMLElement; // Define componentElement as the Element of the Component Object and/or is the component passed

		if (syiro.component.IsComponentObject(component)){ // If this is a Component Object
			if (component["type"] == "buttongroup"){ // If this is a Buttongroup Component
				componentElement = syiro.component.Fetch(component); // Fetch the Component Element
			}
		}
		else if (typeof component.nodeType !== "undefined"){ // If this is an Element (has a nodeType)
			componentElement = component; // Define componentElement as the component provided
		}

		if ((typeof componentElement !== "undefined") && (typeof componentElement.nodeType !== "undefined")){ // If componentElement is defined as an actual Element
			var innerButtonElements = componentElement.querySelectorAll('div[data-syiro-component="button"]'); // Get all the inner Buttons
			var hasOddNumberOfButtons : boolean = false; // Define hasOddNumberOfButtons as a boolean defaulting to false
			var middleButtonNumber : number = 0; // Define middleButtonNumber as the INT-th position in innerButtonElements to declare as the middle number (if there is one) - Just default to 0

			if (parseInt((innerButtonElements.length / 2).toFixed()) !== (innerButtonElements.length / 2)){ // If the divided lengths are not equal (one using toFixed() to remove floating points)
				hasOddNumberOfButtons = true; // Odd number
				middleButtonNumber = Math.round(innerButtonElements.length / 2); // Define middleButtonNumber as the rounded-up int of innerButtonElements.length / 2 (ex. 5 / 2 = 2.5 -> 3)
			}

			for (var innerButtonElementsIndex = 0; innerButtonElementsIndex < innerButtonElements.length; innerButtonElementsIndex++){ // For each button
				var buttonElement = innerButtonElements[innerButtonElementsIndex];
				var widthValue : string = "calc(100% / " + innerButtonElements.length + ") !important"; // Define widthValue as a string (since we'll be apply it via CSS and letting CSS dynamically calc width). Default to 100% / num of button Elements

				if (hasOddNumberOfButtons && (innerButtonElementsIndex == middleButtonNumber)){ // If this is the middle button Element
					widthValue = "calc(100% / " + innerButtonElements.length + " - 2px) !important"; // Define widthValue as 100% / 2 minus 2px (bordering)
				}
				else if (innerButtonElementsIndex == (innerButtonElements.length - 1)){ // If this is the last button Element
					widthValue = "calc(100% / " + innerButtonElements.length + " - " + (innerButtonElements.length - 1) + "px) !important"; // Define widthValue as 100% / 2 minus N - 1px (for each button aside from the last, account for the bordering)
				}

				syiro.component.CSS(buttonElement, "width", widthValue); // Set the width to be 100% / number of button Elements
			}

			return componentElement; // Return the modified Component Element
		}
	}

	// #region Buttongroup Active Button Toggling

	export function Toggle(buttonComponent ?: Object){
		var buttonComponent : Object = arguments[0]; // Define buttonComponent as the first argument passed
		var buttonElement : Element = syiro.component.Fetch(buttonComponent); // Fetch the buttonElement

		var parentButtongroup = buttonElement.parentElement; // Define parentButtongroup as the parent of this buttonElement
		var potentialActiveButton = parentButtongroup.querySelector('div[data-syiro-component="button"][active]'); // Get any potential button that is active in the Buttongroup already

		if (potentialActiveButton !== null){ // If there is an already active Buttongroup
			potentialActiveButton.removeAttribute("active"); // Remove the active attribute
		}

		buttonElement.setAttribute("active", ""); // Set the buttonElement that was clicked to active
	}

	// #endregion

}

// #endregion
