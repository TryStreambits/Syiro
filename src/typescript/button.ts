/*
 This is the namespace for the Syiro Button, Buttongroup, and Toggle Button components.
 */

/// <reference path="component.ts" />
/// <reference path="utilities.ts" />

// #region Syiro Button and Toggle Button Functionality

namespace syiro.button {

	// #region Basic, Dropdown, Toggle Button Generator

	export function New(properties : Object) : ComponentObject { // Generate a Button Component and return a Component Object
		if (typeof properties["type"] == "undefined"){ // If the type is undefined
			properties["type"] = "basic"; // Default to a basic button

			if (syiro.utilities.TypeOfThing(properties["list"], "ComponentObject") || syiro.utilities.TypeOfThing(properties["items"], "Array")){ // If there is an List or Items provided in properties
				properties["type"] = "dropdown"; // Set to Dropdown Button
			}
		}

		var componentId : string = syiro.component.IdGen("button"); // Generate a component Id
		var componentElement : HTMLElement; // Define componentElement as an HTMLElement

		// #region Initial Button Component Data Generation

		var componentData : Object = {
			"data-syiro-component" : "button", // Set data-syiro-component to Button
			"data-syiro-component-id" : componentId,
			"data-syiro-component-type" : properties["type"] // Be more granular with exactly what type of Button this is
		};

		if (properties["type"] !== "toggle"){ // If the type is NOT Toggle (so we are making either a Basic Button or Dropdown Button)
			componentData["content"] = ""; // Default as an empty string

			if (properties["type"] == "dropdown"){ // If this is a Dropdown Button
				componentData["data-syiro-render-icon"] = "menu"; // Default to Menu icon
			}

			if ((typeof properties["icon"] == "string") && (properties["icon"] !== "")){ // If an icon is defined and it is a non-empty string
				componentData["data-syiro-render-icon"] = properties["icon"]; // Default to render-icon being the icon property, for things like built-in icons

				if (properties["icon"].indexOf(".") !== -1) { // If there is an extension likely being used (contains a .)
					componentData["data-syiro-render-icon"] = "custom"; // Set the data-syiro-render-icon to custom so we don't automatically render the default Dropdown icon or menu icon
					componentData["style"] = 'background-image: url("' + properties["icon"] + '")'; // Add to the componentData the style attribute with background-image being set
				}

			}

			delete properties["icon"]; // Remove the "icon" key

			if (typeof properties["image"] == "string"){ // If an image (like an avatar) is defined in the properties
				var primaryImage : HTMLElement = syiro.utilities.ElementCreator("img", { "src" : properties["image"] }); // Create an img Element with the image source
				componentData["content"] = primaryImage.outerHTML + componentData["content"]; // Prepend the HTML of the img tag to the componentData->content
				delete properties["image"]; // Remove the "image" key
			}

			if (typeof properties["content"] == "string"){ // If content is defined and it is a string
				componentData["content"] = properties["content"]; // Set the componentData content of the button
				delete properties["content"]; // Remove the "content" key
			}
		}

		if (properties["type"] == "dropdown"){ // If this is a Dropdown Button that is being generated
			// #region List Creation and Linking

			var listComponent : ComponentObject = properties["list"]; // Default listComponent as the Component Object of the List
			delete properties["list"]; // Delete "list" if it exists

			if (typeof properties["items"] !== "undefined"){ // If List Items are provided in the properties
				listComponent = syiro.list.New({ "items" : properties["items"]}); // Simply generate a new List component from the provided list items and set the listComponent Object to the one provided by Generate
				delete properties["items"]; // Remove the "items" key
			}

			var listComponentElement : Element = syiro.component.Fetch(listComponent); // Fetch the List Component Element
			document.body.appendChild(listComponentElement); // Append the List Element to the end of the document
			listComponentElement.setAttribute("data-syiro-component-owner", componentId); // Set the List's owner to be the Dropdown
			componentData["aria-owns"] = listComponent["id"]; // Define the aria-owns in componentData, setting it to the List Component to declare for ARIA that the Dropdown Button Component "owns" the List Component

			// #endregion

			// #region Dropdown List Position (For the Dropdown toggling of the List)

			if (!syiro.utilities.TypeOfThing(properties["position"], "Array")){ // If the position information is NOT an Array
				properties["position"] = ["below", "center"]; // Default to showing the List centered, below the Dropdown
			}

			syiro.data.Write(listComponent["id"] + "->render", properties["position"]); // Write to syiro.data.storage, updating / adding render key/val to ListComponent
			delete properties["position"]; // Delete "position" from properties

			// #endregion
		} else if (properties["type"] == "toggle"){ // If this is a Toggle Button that is being generated
			var buttonToggleAttributes = { "data-syiro-minor-component" : "buttonToggle"}; // Create an Object to hold the attributes we'll pass when creating the buttonToggle

			if (syiro.utilities.TypeOfThing(properties["default"], "boolean") && properties["default"]){ // If a default state for the button is defined and is defined as true (already active)
				buttonToggleAttributes["data-syiro-component-status"] = "true"; // Add the data-syiro-component-status attribute with "true" as the value
				delete properties["default"]; // Remove the "content" key
			}

			componentData["content"] = syiro.utilities.ElementCreator("div", buttonToggleAttributes); // Set the componentData content to the Button Toggle we generate
		}

		delete properties["type"]; // Remove the "type" key
		componentElement = syiro.utilities.ElementCreator("div", componentData); // Generate the Component Element with the componentData provided

		if (Object.keys(properties).length !== 0){ // If there are items in properties
			for (var propertyKey in properties){ // Recursive go through any other attributes that needs to be set.
				componentElement.setAttribute(propertyKey, properties[propertyKey]); // Treat it like an attribute
			}
		}

		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component
		return { "id" : componentId, "type" : "button" }; // Return a Component Object
	}

	export var Generate = New; // Define Generate as backwards-compatible call to New(). DEPRECATE AROUND 2.0

	// #endregion

	// #region Function for setting the icon of a Button

	export function SetIcon(component : ComponentObject, content : string) : boolean { // Returns boolean value in relation to success
		var setSucceeded : boolean = false; // Define setSucceded as the boolean we return in relation to whether we successfully set the button label

		var componentElement = syiro.component.Fetch(component); // Get the componentElement

		if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") !== "toggle")){ // If the button exists in syiro.data.storage or DOM AND Button is NOT a Toggle Button
			if (content !== ""){ // If we are not removing the icon from the Button
				syiro.component.CSS(componentElement, "background-image", 'url("' + content + '")'); // Set the backgroundImage to the content specified
				componentElement.setAttribute("data-syiro-render-icon", "custom"); // Specify not to render &:after icons
			} else {
				syiro.component.CSS(componentElement, "background-image", ""); // Remove the background-image
				componentElement.removeAttribute("data-syiro-render-icon"); // Remove the render-icon property
			}

			syiro.component.Update(component.id + "->HTMLElement", componentElement); // Update the storedComponent (if necessary)
			setSucceeded = true; // Define setSucceeded as true
		}

		return setSucceeded; // Return the boolean value
	}

	// #endregion

	// #region Function for setting the image of a Dropdown Button

	export function SetImage(component : ComponentObject, content : string) : boolean {
		var setSucceeded : boolean = false; // Define setSucceded as the boolean we return in relation to whether we successfully set the button label
		var componentElement = syiro.component.Fetch(component); // Get the componentElement

		if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") !== "toggle")){ // If the button exists in syiro.data.storage or DOM AND type is not a Toggle Button
			var innerImage : Element = componentElement.querySelector("img"); // Get the image from the Button

			if (content !== ""){ // If the content is not an empty string
				if (innerImage == null){ // If the image element does not exist
					innerImage = document.createElement("img"); // Create an image
					componentElement.insertBefore(innerImage, componentElement.firstChild); // Prepend the img in the Button
				}

				innerImage.setAttribute("src", content); // Set the Button image source
				syiro.component.Update(component.id, componentElement); // Update the storedComponent (if necessary)
			} else if ((content == "") && (innerImage !== null)){ // If the content is set to an empty string and innerImage exists
				syiro.component.Remove(innerImage); // Remove the image
			}

			setSucceeded = true; // Define setSucceeded as true
		}

		return setSucceeded; // Return the boolean value
	}

	// #endregion

	// #region Function for setting the label of a Basic or Dropdown Button

	export function SetText(component : ComponentObject, content : string) : boolean { // Returns boolean value in relation to success
		var setSucceeded : boolean = false; // Define setSucceded as the boolean we return in relation to whether we successfully set the button label
		var componentElement = syiro.component.Fetch(component); // Get the componentElement

		if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") !== "toggle")){ // If the button exists in syiro.data.storage or DOM AND button is "basic" rather than toggle
			componentElement.textContent = content; // Set the button component textContent
			syiro.component.Update(component.id, componentElement); // Update the storedComponent (if necessary)
			setSucceeded = true; // Define setSucceeded as true
		}

		return setSucceeded; // Return the boolean value
	}

	export var SetLabel : Function = syiro.button.SetText; // Define SetLabel as meta-function for SetText

	// #endregion

	// #region Function for toggling either a Dropdown Button or Toggle Button

	export function Toggle(component ?: ComponentObject, active ?: boolean){ // Function that will handle toggling the Dropdown
		var component : ComponentObject = arguments[0]; // Get the component that was passed to this function as a bound argument
		var componentElement : any = syiro.component.Fetch(component); // Get the componentElement based on the component Object

		if (componentElement.getAttribute("data-syiro-component-type") == "dropdown"){ // If this is a Dropdown Button
			var linkedListComponentObject : ComponentObject = syiro.component.FetchLinkedListComponentObject(component); // Get the linked List Component Object of the Dropdown Button
			var linkedListComponentElement : Element = syiro.component.Fetch(linkedListComponentObject); // Get the List Component's Element

			if (syiro.component.CSS(linkedListComponentElement, "visibility") !== ""){ // If the CSS of the linked List Component is stating the List is active (visibility is visible)
				componentElement.removeAttribute("active"); // Remove the "active" attribute
				syiro.component.CSS(linkedListComponentElement, "visibility", ""); // Remove the visibility attribute and hide the List
			} else { // If the linked List is not active / showing
				var linkedListComponentElementWidth : number = componentElement.clientWidth; // Define linkedListComponentELementWidth as a number, defaulting to the Dropdown width

				if (linkedListComponentElementWidth < 200){ // If the List is not at least 200px
					linkedListComponentElementWidth = 200; // Set to 200(px)
				}

				syiro.component.CSS(linkedListComponentElement, "width", linkedListComponentElementWidth + "px"); // Ensure the Linked List is the same width of the Dropdown Button

				var positionInformation : Array<string> = syiro.data.Read(linkedListComponentObject["id"] + "->render"); // Get the position information on where we should render the List
				syiro.render.Position(positionInformation, linkedListComponentObject, component); // Set the position of the List according to the position information for the Dropdown Button

				componentElement.setAttribute("active", ""); // Set the "active" attribute
				syiro.component.CSS(linkedListComponentElement, "visibility", "visible !important"); // Show the List
			}
		} else if (componentElement.getAttribute("data-syiro-component-type") == "toggle"){ // If this a Toggle Button
			if (typeof active == "undefined"){ // If is not provided
				active = componentElement.hasAttribute("active"); // Define active as the boolean provided by hasAttribute
			} else { // If active is provided, flip the logic since the expected action is the FORCE the active provided
				active = !active; // Reverse the boolean
			}

			if (active){ // If the status is currently active
				syiro.animation.Reset(component); // Eliminate the animation property
				componentElement.removeAttribute("active"); // Remove the active attribute
			} else { // If the status is NOT active
				syiro.animation.Slide(component);
				componentElement.setAttribute("active", "true"); // Set to active
			}
		}
	};

	// #endregion

}

// #endregion

// #region Syiro Buttongroup Component

namespace syiro.buttongroup {

	// #region Buttongroup Generator

	export function New(properties : Object) : ComponentObject {
		var buttongroupComponentObject : ComponentObject;

		if (typeof properties["items"] !== "undefined"){ // If items is defined
			if (properties["items"].length >= 2){ // If the length of items is equal to or greater than 2
				var componentId : string = syiro.component.IdGen("buttongroup"); // Generate a component Id
				var componentElement : HTMLElement = syiro.utilities.ElementCreator("div", { "data-syiro-component" : "buttongroup", "data-syiro-component-id" : componentId } );

				for (var buttonItem of properties["items"]){
					var typeOfButton : string = syiro.utilities.TypeOfThing(buttonItem); // Get the type of the buttonItem

					if (typeOfButton == "Object"){ // If the buttonItem provided is an Object, just not a Syiro Object
						buttonItem = syiro.button.New(buttonItem); // Redefine buttonItem as the provided Button Component Object when we use generate a Syiro Button with the buttonItem current content
					}

					var buttonElement : Element = syiro.component.Fetch(buttonItem); // Define buttonElement as the fetched Button Element of the Button Component

					if (buttonElement.getAttribute("data-syiro-component-type") == "basic"){ // Ensure this is a Basic Button
						componentElement.appendChild(buttonElement); // Append the buttonElement
					}
				}

				componentElement = syiro.buttongroup.CalculateInnerButtonWidth(componentElement); // Update componentElement with the inner Button width calculations

				if ((typeof properties["active"] == "number") && (properties["active"]  <= properties["items"].length)){ // If the active Number is provided and it is less than or equal to the max amount of buttons in this Buttongroup
					var defaultActiveButton = componentElement.querySelector('div[data-syiro-component="button"]:nth-of-type(' + properties["active"] + ')');
					var activeButtonComponent = syiro.component.FetchComponentObject(defaultActiveButton); // Get this button's component so we can update any HTMLElement stored in Syiro's data system
					defaultActiveButton.setAttribute("active", ""); // Set active attribute
					syiro.component.Update(activeButtonComponent["id"], defaultActiveButton); // Update the default active button HTMLElement
				}

				syiro.data.Write(componentId + "->HTMLElement", componentElement); // Write the HTMLElement to the Syiro Data System
				buttongroupComponentObject = { "id" : componentId, "type" : "buttongroup" }; // Set buttongroupComponentObject to a new Object
			}
		}

		return buttongroupComponentObject;
	}

	export var Generate = New; // Define Generate as backwards-compatible call to New(). DEPRECATE AROUND 2.0

	// #endregion

	// #region Buttongroup - Inner Button Width Calculation

	export function CalculateInnerButtonWidth(component : any) : HTMLElement {
		var typeOfComponent = syiro.utilities.TypeOfThing(component); // Get the type of the variable passed
		var componentElement : HTMLElement; // Define componentElement as the Element of the Component Object and/or is the component passed

		if (typeOfComponent == "ComponentObject"){ // If it is a Component Object
			if (component.type == "buttongroup"){ // If it is a Buttongroup Component
				componentElement = syiro.component.Fetch(component); // Fetch the Component Element
			}
		} else if (typeOfComponent == "Element"){ // If it is an Element
			componentElement = component; // Define componentElement as the component provided
		}

		if (componentElement !== null){ // If componentElement is defined as an actual Element
			var innerButtonElements : NodeList = componentElement.querySelectorAll('div[data-syiro-component="button"]'); // Get all the inner Buttons
			var hasOddNumberOfButtons : boolean = (Number((innerButtonElements.length / 2).toFixed()) !== (innerButtonElements.length / 2)); // Define hasOddNumberOfButtons as the bool of whether or not the toFixed of the divided num == non-fixed
			var middleButtonNumber : number = 0; // Define middleButtonNumber as the INT-th position in innerButtonElements to declare as the middle number (if there is one) - Just default to 0

			if (hasOddNumberOfButtons){ // If the divided lengths are not equal (one using toFixed() to remove floating points)
				middleButtonNumber = Math.round(innerButtonElements.length / 2); // Define middleButtonNumber as the rounded-up int of innerButtonElements.length / 2 (ex. 5 / 2 = 2.5 -> 3)
			}

			for (var innerButtonElementsIndex in innerButtonElements){ // For each button
				var index : number = Number(innerButtonElementsIndex);
				var buttonElement = innerButtonElements[innerButtonElementsIndex];
				var widthValue : string = "calc(100% / " + innerButtonElements.length + ") !important"; // Define widthValue as a string (since we'll be apply it via CSS and letting CSS dynamically calc width). Default to 100% / num of button Elements

				if (hasOddNumberOfButtons && (index == middleButtonNumber)){ // If this is the middle button Element
					widthValue = "calc(100% / " + innerButtonElements.length + " - 2px) !important"; // Define widthValue as 100% / 2 minus 2px (bordering)
				} else if (index == (innerButtonElements.length - 1)){ // If this is the last button Element
					widthValue = "calc(100% / " + innerButtonElements.length + " - " + (innerButtonElements.length - 1) + "px) !important"; // Define widthValue as 100% / 2 minus N - 1px (for each button aside from the last, account for the bordering)
				}

				syiro.component.CSS(buttonElement, "width", widthValue); // Set the width to be 100% / number of button Elements
			}
		}

		return componentElement; // Return the modified Component Element
	}

	// #region Buttongroup Active Button Toggling

	export function Toggle(buttonComponent : ComponentObject){
		var buttonElement : Element = syiro.component.Fetch(buttonComponent); // Fetch the buttonElement

		var parentButtongroup = buttonElement.parentElement; // Define parentButtongroup as the parent of this buttonElement
		var parentButtongroupComponentObject : ComponentObject = syiro.component.FetchComponentObject(parentButtongroup); // Fetch the ComponentObject of the parent Buttongroup
		var potentialActiveButton = parentButtongroup.querySelector('div[data-syiro-component="button"][active]'); // Get any potential button that is active in the Buttongroup already

		if (potentialActiveButton !== null){ // If there is an already active Buttongroup
			potentialActiveButton.removeAttribute("active"); // Remove the active attribute
		}

		buttonElement.setAttribute("active", ""); // Set the buttonElement that was clicked to active

		syiro.component.Update(parentButtongroupComponentObject["id"], parentButtongroup); // Update the parentButtongroup if necessary
	}

	// #endregion

}

// #endregion
