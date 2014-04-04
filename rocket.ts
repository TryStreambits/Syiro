class Rocket{
	thisClass : any;
	thisPage = document.getElementsByTagName("body")[0]; // Define thisPage as the body tag

	constructor(){
		this.thisClass = this;
	}

	// #region Component Animations



	// #endregion

	// #region Component Meta Functions

	componentExistsCheck(parentElement : HTMLElement, component : any){ // Check if a Rocket component (or tag) exists within the parentElement
		if (typeof component !== "string"){ // If the component is NOT a string (a.k.a not a tag)
			if (parentElement.innerHTML.indexOf(component.outerHTML) !== 1){ // If the parentElement has the component (validated by checking HTML)
				return true;
			}
			else{ // If it does NOT contain the component
				return false;
			}
		}
		else{ // If the component type IS a string
			if ((typeof parentElement.getElementsByTagName(component)) !== "object"){ // If the type of the returned getElementsByTagName is NOT an object (most likely NodeList)
				return true;
			}
			else{
				return false;
			}
		}
	}

	addComponent(prependOrAppend : string, parentElement : HTMLElement, component : Element){ // This function adds a component to the parent element
		if (prependOrAppend == "prepend"){ // If we are prepending the component
			parentElement.insertBefore(component, parentElement.firstChild); // Insert before the first component
		}
		else{ // If we are appending the component
			parentElement.appendChild(component); // Append
		}
	}

	removeComponent(parentElement : HTMLElement, component : any){ // This function removes a component from a parent element
		if (typeof component !== "string"){ // If the component is NOT a string, meaning it is an HTML element
			parentElement.removeChild(component);
		}
		else{ // If it is a string, meaning it is a tag
			parentElement.removeChild(parentElement.getElementsByTagName(component)[0]); // Remove the first component (tag)
		}
	}

	// #endregion

	// #region Rocket Header Main Component

	Header(options ?: Object){ // Generates (or selects an existing) footer based on the options provided.
		var rocketElement = this.thisPage.getElementsByTagName("header")[0]; // Assign rocketElement as the potential header

		function setLogo(src : string){ // Sets the header logo
			var headerLogoElement : HTMLElement; // Define headerLogoElement as an HTMLElement

			if (rocketElement.querySelector('img [data-rocket-minor-component="logo"') == null){ // If it could not find an img element with the logo component
				headerLogoElement = document.createElement("img"); // Create a new HTML Element
				this.addComponent("prepend", rocketElement, headerLogoElement); // Prepend the logo to the start of the header
			}

			headerLogoElement.setAttribute("data-rocket-component", "logo"); // Set
			headerLogoElement.setAttribute("src", src); // Set the src of the header logo img
		}

		var removeLogo : Function = this.removeComponent.bind(this.thisClass, rocketElement, rocketElement.querySelector('img [data-rocket-minor-component="logo"')); // removeLogo is a new function based on removeComponent

		function addList(rocketList : HTMLElement){ // Add a list to the header
			 this.addComponent("append", rocketElement, rocketList);
		}

		function removeList(rocketList : HTMLElement){ // Remove a list item from the header
			this.removeComponent( rocketElement, rocketList);
		}

		function setSearchBar(searchBar : HTMLElement){ // Add a search bar to the header
			this.addComponent("append", rocketElement, searchBar);
		}

		function removeSearchBar(searchBar ?: Element){ // Remove the search bar (if none defined, remove initial)
			if (searchBar == undefined){ // If the searchBar is NOT defined
				searchBar = document.querySelector('div:first-child [data-rocket-component="search"'); // Get the first searchBar component
			}

			this.removeComponent(rocketElement, searchBar); // Remove the component
		}

		if (this.componentExistsCheck(this.thisPage, "header") == false){ // If the header component does NOT exist
			rocketElement = document.createElement("header"); // Create a new header tag

			if (options["logo"] !== undefined){ // If a logo was defined in the options
				setLogo(options["logo"]); // Set the logo
			}

			options["logo"] == null; // Set the logo option to null for sanity check

			for (var rocketComponent in options){ // For every component that is being added to the header
				if (rocketComponent !== null){ // If the rocketComponent is null (like in the case of the logo)
					if ((typeof rocketComponent).indexOf("Element")){ // If the string value of the type of the component contains Element (HTMLElement or Element)
						rocketElement.append(rocketComponent); // Set the component
					}
				}
			}

			this.thisPage.insertBefore(rocketElement, this.thisPage.firstChild);
		}

	}

	// #endregion

	// #region Rocket Footer Main Component

	Footer(options ?: any){ // Generates (or selects an existing) footer based on the options provided.
		var rocketElement = document.getElementsByTagName("footer")[0]; // Assign rocketElement as the potential header

		function addText(text : string){ // Set the "Light Text" of the Footer
			var textTag : HTMLElement; // Define textTag as an HTML Element

			if (rocketElement.querySelector("pre") == null){ // If the footer does NOT have the text tag
				textTag = document.createElement("pre"); // Create a new HTML Element (pre) and set it to the textTag
				this.addComponent("prepend", rocketElement, textTag); // Prepend the text tag to the footer
			}
			else{
				textTag = rocketElement.getElementsByTagName("pre")[0]; // Get the text tag
			}

			textTag.innerText = text; // Set the text of the pre tag
		}

		function removeText(){ // Remove the "Light Text" from the Footer
			this.removeComponent(rocketElement, "pre");
		}

		function addLink(text : string, link : string, target ?: string){
			if (target == undefined){ // If the target is undefined
				target = "_blank"; // Set the link to open in a new tab
			}

			var newLink : HTMLElement = document.createElement("a"); // Create a new link a tag
			newLink.setAttribute("href", link); // Set the href to the link URL
			newLink.setAttribute("target", target); // Set the target to the defined target
			newLink.innerText = text; // Set the text of the element

			this.addComponent("append", rocketElement, newLink); // Add the new link
		}

		function removeLink(link : HTMLElement){ // Remove a link from the footer
			this.removeComponent(rocketElement, link); // Remove the link
		}
	}

	// #endregion

	// #region Rocket Button Main Component

	Button(options ?: any){ // Generates (or selects an existing) button based on the options provided
		var listenerElement : HTMLElement; // Define listenerElement as the HTML Element that an event is attached to

		function listen(callbackFunction : Function, secondaryFunction ?: Function){ // Set callbacks that gets triggered when a basic or toggle button value changes
			listenerElement.addEventListener("click touchend MSPointerUp",  // Add the event listener for mouse click / touch
				function(listenerElement){
					var buttonType = listenerElement.getAttribute("data-rocket-component-type"); // Get the button type
					var toggleValue : boolean; // Set toggleValue as boolean

					if (buttonType == "toggle"){ // If the button is a toggle button
						toggleValue = Boolean(listenerElement.getAttribute("data-rocket-component-status")); // Get the string form of the toggle value and convert to boolean

						if (toggleValue == false){ // If the toggle is currently set to false before we've changed it.
							toggleValue = true;
						}
						else{
							toggleValue = false;
						}

						listenerElement.setAttribute("data-rocket-component-status", toggleValue.toString()); // Save the new status in the button data
					}
					else{ // If the button is NOT toggle
						toggleValue = null; // Set to null, as it not relevant
					}

					if ((buttonType == "basic") || ((buttonType == "toggle") && (secondaryFunction == undefined))){ // If the button is basic or it is toggle with no secondaryFunction
						callbackFunction(toggleValue);
					}
					else{ // If the button is toggle AND there is a secondaryFunction
						if (toggleValue == false){ // If the toggleValue is false
							callbackFunction(toggleValue); // Send false to the callbackFunction
						}
						else{ // If the toggleValue is true
							secondaryFunction(toggleValue); // Send true to the secondaryFunction
						}
					}
				}
			, true);
		}

		if (options !== undefined){ // If options are defined, meaning we are creating a new button (basic or toggle)
			var newButton = this.thisPage.createElement("div"); // Create a new div element
			newButton.setAttribute("data-rocket-component", "button"); //Set the component type to button

			if (options["type"] == undefined){ // If the options type is undefined
				listenerElement = newButton; // Define the listenerElement as the button

				newButton.setAttribute("data-rocket-component-type", "basic"); // Set the new Rocket button component type to "basic"
				newButton.innerText = options["text"]; // Set the inner text
			}
			else{ // If the type is defined
				newButton.setAttribute("data-rocket-component-type", "toggle"); // Set the new Rocket button component type as "toggle"

				var newToggle = this.thisPage.createElement("div"); // Create a new toggle button
				listenerElement = newToggle; // Define the listenerElement as the toggle button

				newToggle.setAttribute("data-rocket-minor-component", "buttonToggle"); // Create a minor component called "buttonToggle"
			}
		}
	}

	// #endregion

	// #region Rocket List Main Component

	List(options ?: any){ // Generates (or selects an existing) list based on the options provided
		function addItem(){ // Add an item to the List

		}

		function removeItem(){ // Remove an item from the List

		}

		function callback(callbackFunction : Function){ // Set a callback that gets triggered when a basic list option changes

		}
	}

	// #endregion

	// #region Rocket Search Bar Main Component

	SearchBar(options ?: any){ // Generates (or selects an existing) search bar

	}

	// #endregion
}