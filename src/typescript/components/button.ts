/*
	This is the namespace for the Syiro Button, Buttongroup, and Toggle Button components.
*/

/// <reference path="../interfaces/button.ts" />
/// <reference path="../component.ts" />
/// <reference path="../style.ts" />
/// <reference path="../utilities.ts" />

namespace syiro.button {

	// New Button
	// Creates a new Button with the applied properties
	export function New(properties : ButtonPropertiesObject) : ComponentObject { // Generate a Button Component and return a Component Object
		if (typeof properties.type == "undefined"){ // If the type is undefined
			properties.type = "basic"; // Default to a basic button

			if (syiro.utilities.TypeOfThing(properties["list"], "ComponentObject") || syiro.utilities.TypeOfThing(properties["items"], "Array")){ // If there is an List or Items provided in properties
				properties.type = "dropdown"; // Set to Dropdown Button
			}
		}

		let componentId : string = syiro.component.IdGen("button"); // Generate a component Id
		let componentElement : HTMLElement; // Define componentElement as an HTMLElement

		let componentData : Object = {
			"data-syiro-component" : "button", // Set data-syiro-component to Button
			"data-syiro-component-id" : componentId,
			"data-syiro-component-type" : properties.type // Be more granular with exactly what type of Button this is
		};

		if (properties.type !== "toggle"){ // If the type is NOT Toggle (so we are making either a Basic Button or Dropdown Button)		
			if (properties.type == "dropdown"){ // If this is a Dropdown Button that is being generated
				componentData["data-syiro-render-icon"] = "menu"; // Default to Menu icon

				let listComponent : ComponentObject = properties.list; // Default listComponent as the Component Object of the List

				if (syiro.utilities.TypeOfThing(properties.items, "Array")){ // If List Items are provided in the properties
					listComponent = syiro.list.New({ "items" : properties.items}); // Simply generate a new List component from the provided list items and set the listComponent Object to the one provided by Generate
				}

				let listComponentElement : Element = syiro.component.Fetch(listComponent); // Fetch the List Component Element
				document.body.appendChild(listComponentElement); // Append the List Element to the end of the document
				listComponentElement.setAttribute("data-syiro-component-owner", componentId); // Set the List's owner to be the Dropdown
				componentData["aria-owns"] = listComponent.id; // Define the aria-owns in componentData, setting it to the List Component to declare for ARIA that the Dropdown Button Component "owns" the List Component

				if (!syiro.utilities.TypeOfThing(properties.position, "Array")){ // If the position information is NOT an Array
					properties.position = ["below", "center"]; // Default to showing the List centered, below the Dropdown
				}

				syiro.data.Write(listComponent.id + "->render", properties.position); // Write to syiro.data.storage, updating / adding render key/val to ListComponent
			}
			
			if ((typeof properties.icon == "string") && (properties.icon !== "")){ // If an icon is defined and it is a non-empty string
				componentData["data-syiro-render-icon"] = properties.icon; // Default to render-icon being the icon property, for things like built-in icons

				if (properties.icon.indexOf(".") !== -1) { // If there is an extension likely being used (contains a .)
					componentData["data-syiro-render-icon"] = "custom"; // Set the data-syiro-render-icon to custom so we don't automatically render the default Dropdown icon or menu icon
					componentData["style"] = 'background-image: url("' + properties.icon + '")'; // Add to the componentData the style attribute with background-image being set
				}
			}

			if (typeof properties.image == "string"){ // If an image (like an avatar) is defined in the properties
				let primaryImage : HTMLElement = syiro.utilities.ElementCreator("img", { "src" : properties.image }); // Create an img Element with the image source
				properties.content = primaryImage.outerHTML + properties.content; // Prepend the HTML of the img tag to the componentData->content
			}

			if (typeof properties.content == "string"){ // If content is defined and it is a string
				componentData["content"] = properties.content; // Set the componentData content of the button
			}
		} else { // If this is a Toggle Button that is being generated
			let buttonToggleAttributes = { "data-syiro-minor-component" : "buttonToggle"}; // Create an Object to hold the attributes we'll pass when creating the buttonToggle

			if (properties.default){ // If a default state for the button is defined and is defined as true (already active)
				buttonToggleAttributes["data-syiro-component-status"] = "true"; // Add the data-syiro-component-status attribute with "true" as the value
			}

			componentData["content"] = syiro.utilities.ElementCreator("div", buttonToggleAttributes); // Set the componentData content to the Button Toggle we generate
		}

		componentElement = syiro.utilities.ElementCreator("div", componentData); // Generate the Component Element with the componentData provided

		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component
		return { "id" : componentId, "type" : "button" }; // Return a Component Object
	}

	// SetIcon
	// Set the icon of a Button
	export function SetIcon(component : ComponentObject, content : string) : boolean { // Returns boolean value in relation to success
		let setSucceeded : boolean = false; // Define setSucceded as the boolean we return in relation to whether we successfully set the button label

		let componentElement = syiro.component.Fetch(component); // Get the componentElement

		if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") !== "toggle")){ // If the button exists in syiro.data.storage or DOM AND Button is NOT a Toggle Button
			if (content !== ""){ // If we are not removing the icon from the Button
				syiro.style.Set(componentElement, "background-image", 'url("' + content + '")'); // Set the backgroundImage to the content specified
				componentElement.setAttribute("data-syiro-render-icon", "custom"); // Specify not to render &:after icons
			} else {
				syiro.style.Set(componentElement, "background-image", ""); // Remove the background-image
				componentElement.removeAttribute("data-syiro-render-icon"); // Remove the render-icon property
			}

			syiro.component.Update(component.id + "->HTMLElement", componentElement); // Update the storedComponent (if necessary)
			setSucceeded = true; // Define setSucceeded as true
		}

		return setSucceeded; // Return the boolean value
	}

	// SetImage
	// Set the image of a Dropdown Button
	export function SetImage(component : ComponentObject, content : string) : boolean {
		let setSucceeded : boolean = false; // Define setSucceded as the boolean we return in relation to whether we successfully set the button label
		let componentElement = syiro.component.Fetch(component); // Get the componentElement

		if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") !== "toggle")){ // If the button exists in syiro.data.storage or DOM AND type is not a Toggle Button
			let innerImage : Element = componentElement.querySelector("img"); // Get the image from the Button

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

	// SetText
	// Set the label of a Basic or Dropdown Button
	export function SetText(component : ComponentObject, content : string) : boolean { // Returns boolean value in relation to success
		let setSucceeded : boolean = false; // Define setSucceded as the boolean we return in relation to whether we successfully set the button label
		let componentElement = syiro.component.Fetch(component); // Get the componentElement

		if ((componentElement !== null) && (componentElement.getAttribute("data-syiro-component-type") !== "toggle")){ // If the button exists in syiro.data.storage or DOM AND button is "basic" rather than toggle
			componentElement.textContent = content; // Set the button component textContent
			syiro.component.Update(component.id, componentElement); // Update the storedComponent (if necessary)
			setSucceeded = true; // Define setSucceeded as true
		}

		return setSucceeded; // Return the boolean value
	}

	// Toggle
	// Toggle a Dropdown Button or Toggle Button state
	export function Toggle(component : ComponentObject, active ?: boolean){ // Function that will handle toggling the Dropdown
		let componentElement : Element = syiro.component.Fetch(component); // Get the componentElement based on the component Object

		if (componentElement.getAttribute("data-syiro-component-type") == "dropdown"){ // If this is a Dropdown Button
			let linkedListComponentObject : ComponentObject = syiro.component.FetchLinkedListComponentObject(component); // Get the linked List Component Object of the Dropdown Button
			let linkedListComponentElement : Element = syiro.component.Fetch(linkedListComponentObject); // Get the List Component's Element

			if (syiro.style.Get(linkedListComponentElement, "visibility") !== ""){ // If the CSS of the linked List Component is stating the List is active (visibility is visible)
				componentElement.removeAttribute("active"); // Remove the "active" attribute
				syiro.style.Set(linkedListComponentElement, "visibility", ""); // Remove the visibility attribute and hide the List
			} else { // If the linked List is not active / showing
				let positionInformation : Array<string> = syiro.data.Read(linkedListComponentObject.id + "->render"); // Get the position information on where we should render the List
				syiro.render.Position(positionInformation, linkedListComponentObject, component); // Set the position of the List according to the position information for the Dropdown Button

				componentElement.setAttribute("active", ""); // Set the "active" attribute
				syiro.style.Set(linkedListComponentElement, "visibility", "visible"); // Show the List
			}
		} else if (componentElement.getAttribute("data-syiro-component-type") == "toggle"){ // If this a Toggle Button
			if (syiro.utilities.TypeOfThing(active, "MouseEvent")){ // If is not provided (a MouseEvent Object is passed from syiro.events.Trigger)
				active = componentElement.hasAttribute("active"); // Define active as the boolean provided by hasAttribute
			}

			if (!active) { // If the status is not currently active
				syiro.animation.Slide(component);
				componentElement.setAttribute("active", "true"); // Set to active
			} else { // If the status is active
				syiro.animation.Reset(component); // Eliminate the animation property
				componentElement.removeAttribute("active"); // Remove the active attribute
			}
		}
	};
}

namespace syiro.buttongroup {

	// New
	// Create a Buttongroup
	export function New(properties : Object) : ComponentObject {
		let buttongroupComponentObject : ComponentObject;

		if (syiro.utilities.TypeOfThing(properties["items"], "Array")){ // If items is defined as an Array
			if (properties["items"].length > 1){ // If the length of items is equal to or greater than 2
				let componentId : string = syiro.component.IdGen("buttongroup"); // Generate a component Id
				let componentElement : Element = syiro.utilities.ElementCreator("div", { "data-syiro-component" : "buttongroup", "data-syiro-component-id" : componentId } );

				for (let buttonItem of properties["items"]){
					let typeOfButton : string = syiro.utilities.TypeOfThing(buttonItem); // Get the type of the buttonItem

					if (typeOfButton == "Object"){ // If the buttonItem provided is an Object, just not a Syiro Object
						buttonItem = syiro.button.New(buttonItem); // Redefine buttonItem as the provided Button Component Object when we use generate a Syiro Button with the buttonItem current content
					}

					let buttonElement : Element = syiro.component.Fetch(buttonItem); // Define buttonElement as the fetched Button Element of the Button Component

					if (buttonElement.getAttribute("data-syiro-component-type") == "basic"){ // Ensure this is a Basic Button
						componentElement.appendChild(buttonElement); // Append the buttonElement
					}
				}

				componentElement = syiro.buttongroup.CalculateInnerButtonWidth(componentElement); // Update componentElement with the inner Button width calculations

				if ((typeof properties["active"] == "number") && (properties["active"]  <= properties["items"].length)){ // If the active Number is provided and it is less than or equal to the max amount of buttons in this Buttongroup
					let defaultActiveButton = componentElement.querySelector('div[data-syiro-component="button"]:nth-of-type(' + properties["active"] + ')');
					let activeButtonComponent = syiro.component.FetchComponentObject(defaultActiveButton); // Get this button's component so we can update any HTMLElement stored in Syiro's data system
					defaultActiveButton.setAttribute("active", ""); // Set active attribute
					syiro.component.Update(activeButtonComponent.id, defaultActiveButton); // Update the default active button HTMLElement
				}

				syiro.data.Write(componentId + "->HTMLElement", componentElement); // Write the HTMLElement to the Syiro Data System
				buttongroupComponentObject = { "id" : componentId, "type" : "buttongroup" }; // Set buttongroupComponentObject to a new Object
			}
		}

		return buttongroupComponentObject;
	}

	// CalculateInnerButtonWidth
	export function CalculateInnerButtonWidth(componentProvided : any) : Element {
		let component : ComponentObject = syiro.component.FetchComponentObject(componentProvided), componentElement : Element = syiro.component.Fetch(componentProvided); // Get the Component Object and Element of the componentProvided

		if (componentElement !== null){ // If componentElement is defined as an actual Element
			let innerButtonElements : NodeList = componentElement.querySelectorAll('div[data-syiro-component="button"]'); // Get all the inner Buttons
			let hasOddNumberOfButtons : boolean = (Number((innerButtonElements.length / 2).toFixed()) !== (innerButtonElements.length / 2)); // Define hasOddNumberOfButtons as the bool of whether or not the toFixed of the divided num == non-fixed
			let middleButtonNumber : number = 0; // Define middleButtonNumber as the INT-th position in innerButtonElements to declare as the middle number (if there is one) - Just default to 0

			if (hasOddNumberOfButtons){ // If the divided lengths are not equal (one using toFixed() to remove floating points)
				middleButtonNumber = Math.round(innerButtonElements.length / 2); // Define middleButtonNumber as the rounded-up int of innerButtonElements.length / 2 (ex. 5 / 2 = 2.5 -> 3)
			}

			for (let innerButtonElementsIndex = 0; innerButtonElementsIndex < innerButtonElements.length; innerButtonElementsIndex++){ // For each button
				let buttonElement = innerButtonElements[innerButtonElementsIndex];
				let widthValue : string = "calc(100% / " + innerButtonElements.length + ")"; // Define widthValue as a string (since we'll be apply it via CSS and letting CSS dynamically calc width). Default to 100% / num of button Elements

				if (hasOddNumberOfButtons && (innerButtonElementsIndex == middleButtonNumber)){ // If this is the middle button Element
					widthValue = "calc(100% / " + innerButtonElements.length + " - 2px)"; // Define widthValue as 100% / 2 minus 2px (bordering)
				} else if (innerButtonElementsIndex == (innerButtonElements.length - 1)){ // If this is the last button Element
					widthValue = "calc(100% / " + innerButtonElements.length + " - " + (innerButtonElements.length - 1) + "px)"; // Define widthValue as 100% / 2 minus N - 1px (for each button aside from the last, account for the bordering)
				}

				syiro.style.Set(buttonElement, "width", widthValue); // Set the width to be 100% / number of button Elements
			}
		}

		return componentElement; // Return the modified Component Element
	}

	// Toggle
	// Buttongroup Active Button Toggling
	export function Toggle(buttonComponent : ComponentObject){
		let buttonElement : Element = syiro.component.Fetch(buttonComponent); // Fetch the buttonElement

		let parentButtongroup = buttonElement.parentElement; // Define parentButtongroup as the parent of this buttonElement
		let parentButtongroupComponentObject : ComponentObject = syiro.component.FetchComponentObject(parentButtongroup); // Fetch the ComponentObject of the parent Buttongroup
		let potentialActiveButton = parentButtongroup.querySelector('div[data-syiro-component="button"][active]'); // Get any potential button that is active in the Buttongroup already

		if (potentialActiveButton !== null){ // If there is an already active Buttongroup
			potentialActiveButton.removeAttribute("active"); // Remove the active attribute
		}

		buttonElement.setAttribute("active", ""); // Set the buttonElement that was clicked to active

		syiro.component.Update(parentButtongroupComponentObject.id, parentButtongroup); // Update the parentButtongroup if necessary
	}
}