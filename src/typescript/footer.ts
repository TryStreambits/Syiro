/*
 This is the module for Syiro Header component.
*/

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

module syiro.footer {

	// #region Footer Generation

	export function Generate(properties : Object) : Object { // Generate a Footer Component and return a Component Object
		var componentId : string = syiro.generator.IdGen("footer"); // Generate a component Id
		var componentElement : HTMLElement = syiro.generator.ElementCreator(componentId, "footer"); // Generate a Footer Element

		if (typeof properties["items"] !== "undefined"){ // If we are adding items to the Footer
			for (var individualItem in properties["items"]){ // For each individualItem in navigationItems Object array
				var individualItem : any = properties["items"][individualItem]; // Get the individualItem

				if (syiro.component.IsComponentObject(individualItem) == false){ // If we are adding a link
					var generatedElement : HTMLElement; // Define generatedElement as the element we will be appending

					if (typeof individualItem.nodeType == "undefined"){ // If a nodeType is not defined, meaning it is not an element
						generatedElement = syiro.generator.ElementCreator("a", // Generate a generic link element
							{
								"href" : individualItem["href"], // Set the href (link)
								"title" : individualItem["title"], // Also set title of the <a> tag to title provided
								"content" : individualItem["title"] // Also set the inner content of the <a> tag to title
							}
						);
					}
					else{ // If a nodeType is defined meaning it is an Element
						generatedElement = individualItem; // Define generatedElement as individualItem
					}

					componentElement.appendChild(generatedElement); // Append the component to the parent component element
				}
			}
		}

		if (typeof properties["content"] !== "undefined"){ // If we are adding a Footer label
			var generatedElement : HTMLElement = syiro.generator.ElementCreator("label", { "content" : properties["content"] }); // Generate a generic label element
			componentElement.insertBefore(generatedElement, componentElement.firstChild); // Prepend the label to the footer
		}

		syiro.data.Write(componentId + "->HTMLElement", componentElement); // Add the componentElement to the HTMLElement key/val of the component
		return { "id" : componentId, "type" : "footer" }; // Return a Component Object
	}

	// #endregion

	// #region Function to set the Footer label (typically something like a Copyright notice)

	export function SetLabel(component : Object, labelText : string) : boolean{ // Set the label text of the footer component to the labelText defined
		if ((typeof component !== "undefined") && (typeof labelText !== "undefined")){ // If the component and labelText is defined
			var parentElement = syiro.component.Fetch(component); // Get the Element of the footer component
			var labelComponent : Element = parentElement.querySelector("pre"); // Fetch the labelComponent if it exists

			if (labelComponent == null){ // If the labelComponent does not exist
				labelComponent = syiro.generator.ElementCreator("pre", { "content" : labelText }); // Create a label Element with the content set to labelText
				parentElement.insertBefore(labelComponent, parentElement.firstChild); // Pre-emptively insert the empty label
			}
			else{ // If the labelComponent does exist
				labelComponent.textContent = labelText; // Set the labelComponent textContent to the labelText defined
			}

			syiro.component.Update(component["id"], parentElement); // Update the storedComponent HTMLElement if necessary
			return true; // Return a success boolean
		}
		else{ // If the component is NOT defined
			return false; // Return a failure boolean
		}
	}

	// #endregion

	// #region Function to add a link to the Footer based on properties of that link

	export function AddLink(append : boolean, component : Object, elementOrProperties : any) : boolean { // Returns boolean if it was successful or not
		var componentAddingSucceeded : boolean = false; // Variable to store the determination of success (default to false)
		var generatedElement : HTMLElement; // Define generatedElement as the element we will be appending

		if (typeof elementOrProperties.nodeType == "undefined"){ // If a nodeType is not defined, meaning it is not an element
			generatedElement = syiro.generator.ElementCreator("a", // Generate a generic link element
				{
					"href" : elementOrProperties["href"], // Set the href (link)
					"title" : elementOrProperties["title"], // Also set title of the <a> tag to title provided
					"content" : elementOrProperties["title"] // Also set the inner content of the <a> tag to title
				}
			);
		}
		else if ((typeof elementOrProperties.nodeType !== "undefined") && (elementOrProperties.nodeName.toLowerCase() == "a")){ // If a nodeType is defined meaning it is a link Element
			generatedElement = elementOrProperties; // Define generatedElement as elementOrProperties
		}

		if (typeof generatedElement !== "undefined"){ // If the generatedElement is not undefined
			componentAddingSucceeded = true; // Set to true
			syiro.component.Add(append, component, generatedElement); // Prepend or append the component to the parent component element
		}

		return componentAddingSucceeded;
	}

	// #endregion

	// #region Function to remove a link from the Footer based on the properties of that link

	export function RemoveLink(component : Object, elementOrProperties : any) : boolean { // Return boolean if it was successful or not
		var componentRemovingSucceed : boolean = false; // Variable to store the determination of success
		var footerElement : Element = syiro.component.Fetch(component); // Get the Element of the Footer component
		var potentialLinkElement : Element; // Get the potential link element.

		if (typeof elementOrProperties.nodeType == "undefined"){ // If a nodeType is not defined, meaning it is not an element
			potentialLinkElement =  footerElement.querySelector('a[href="' + elementOrProperties["link"] + '"][title="' + elementOrProperties["title"] + '"]'); // Get the potential link element.
		}
		else if ((typeof elementOrProperties.nodeType !== "undefined") && (elementOrProperties.nodeName.toLowerCase() == "a")){ // If a nodeType is defined meaning it is a link Element
			potentialLinkElement = elementOrProperties; // Define potentialLinkElement as elementOrProperties
		}

		if (typeof potentialLinkElement !== "undefined"){ // If the potentialLinkElement is not undefined
			componentRemovingSucceed = true; // Set to true
			footerElement.removeChild(potentialLinkElement); // Remove the element
			syiro.component.Update(component["id"], footerElement); // Update the storedComponent HTMLElement if necessary
		}

		return componentRemovingSucceed;
	}

	// #endregion

}
