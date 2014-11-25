/*
 This is the module for Rocket Header component.
 */

/// <reference path="component.ts" />
/// <reference path="generator.ts" />

module rocket.header {

	// #region Header Generation

	export function Generate(properties : Object) : Object { // Generate a Header Component and return a Component Object
		var componentId : string = rocket.generator.IdGen("header"); // Generate a component Id
		var componentElement : HTMLElement = rocket.generator.ElementCreator(componentId, "header"); // Generate a Header Element

		for (var propertyKey in properties){ // Recursive go through each propertyKey
			if (propertyKey == "items"){ // If we are adding items to the Header
				for (var individualItem in properties["items"]){ // For each individualItem in navigationItems Object array
					if (properties["items"][individualItem]["type"] == "dropdown"){ // If the individualItem type is a Dropdown
						var dropdownComponent : Object = properties["items"][individualItem]["component"]; // Get the embedded component object
						componentElement.appendChild(rocket.component.Fetch(dropdownComponent)); // Append the HTMLElement fetched from rocket.component.Fetch(dropdownComponent)

						delete rocket.component.storedComponents[dropdownComponent["id"]]; // Delete the Component from the storedComponents
					}
					else if (properties["items"][individualItem]["type"] == "link"){ // If we are adding a link
						var generatedElement : HTMLElement = rocket.generator.ElementCreator("a", // Generate a generic link element
							{
								"href" : properties["items"][individualItem]["link"], // Set the href (link)
								"content" : properties["items"][individualItem]["content"] // Also set the inner content of the <a> tag to title
							}
						);

						componentElement.appendChild(generatedElement); // Append the component to the parent component element
					}
				}
			}
			else if (propertyKey == "logo"){ // If we are adding a Logo to the Header
				var generatedElement : HTMLElement = rocket.generator.ElementCreator("img",
					{
						"data-rocket-minor-component" : "logo", // Set the minor component to logo
						"src" : properties["logo"] // Set the src to the one provided as the value of "logo"
					}
				);

				componentElement.appendChild(generatedElement); // Append the logo to the header
			}
		}

		rocket.component.storedComponents[componentId] = componentElement; // Add the component to the storedComponents

		return { "id" : componentId, "type" : "header" }; // Return a Component Object
	}

	// #endregion

	// #region Function for setting the header's logo

	export function SetLogo(component : Object, image : string){ // Requires the component object and string of the image URL
		var headerElement : Element = rocket.component.Fetch(component); // Get the HTMLElement with Get()
		var imageElement : Element = headerElement.querySelector('img[data-rocket-minor-component="logo"]'); // Set imageElement as the IMG element we will either fetch or generate

		if (imageElement == null){ // If there is NOT already a logo in the header component
			imageElement = rocket.generator.ElementCreator("img", { "data-rocket-minor-component" : "logo", "src" : image }); // Create an imageElement

			headerElement.insertBefore(imageElement, headerElement.firstChild); // Prepend the logo component
		}
		else{ // If the image element is already defined
			imageElement.setAttribute("src", image); // Set the image source
		}

		rocket.component.Update(component["id"], headerElement); // Update the storedComponent HTMLElement if necessary
	}

	// #endregion

	// #region Function for removing the header's logo

	export function RemoveLogo(component : Object){ // Requires only the component object
		var headerElement : Element = rocket.component.Fetch(component); // Get the HTMLElement with Get()

		if (headerElement.querySelectorAll('img[data-rocket-minor-component="logo"]').length > 0){ // If the headerElement has a logo
			headerElement.removeChild(headerElement.firstChild); // Remove the image element (which has to be the first child in the Header component)
			rocket.component.Update(component["id"], headerElement); // Update the storedComponent HTMLElement if necessary
		}
	}

	// #endregion

}
