/*
 This is the namespace for Syiro Grid component and it's sub-component, Grid Item
 */

/// <reference path="component.ts" />
/// <reference path="utilities.ts" />

// #region Syiro Grid Component

module syiro.grid {

	// #region New Grid Component

	export function New(properties : Object) : ComponentObject {
		var component : ComponentObject = { "id" : syiro.component.IdGen("grid"), "type" : "grid" }; // Define componentObject as a new ComponentObject with a newly generated Id and type set to grid
		var renderItems : string;

		if (syiro.utilities.TypeOfThing(properties["columns"], "number")){ // If the horizontal amount (columns) of grid items allowed is a number
			renderItems = properties["columns"].toString(); // Set renderitems to the string of columns
		} else { // If renderItems is not a number
			renderItems = "dynamic"; // Set to dynamically set column amount
		}

		var componentElement : HTMLElement = syiro.utilities.ElementCreator("div", { "data-syiro-component-id" : component.id, "data-syiro-component" : "grid", "data-syiro-render-columns" : renderItems }); // Generate the Grid container

		if (syiro.utilities.TypeOfThing(properties["items"], "Array")){ // If there are items defined
			for (var gridItemProperties of properties["items"]){ // For each item
				var gridItem : ComponentObject = syiro.griditem.New(gridItemProperties); // Create a Grid Item Component based on the gridItemProperties
				var gridItemElement : HTMLElement = syiro.component.Fetch(gridItem); // Fetch the Grid item Element
				componentElement.appendChild(gridItemElement); // Append the gridItemElement
			}
		}

		syiro.data.Write(component.id + "->HTMLElement", componentElement); // Set the HTMLElement of the Component as componentElement
		return component;
	}

	// #endregion

	// #region Scale Grid and inner Grid Items

	export function Scale(component : ComponentObject){
		if ((syiro.utilities.TypeOfThing(component, "ComponentObject")) && (component.type == "grid")){ // If this is a Grid Component
			var componentElement : HTMLElement = syiro.component.Fetch(component); // Fetch the componentElement of this Grid Component
			var componentDimensions : Object = syiro.component.FetchDimensionsAndPosition(componentElement); // Get the dimensions of the componentElement

			var componentWidth : number = componentDimensions["width"]; // Get the width of the componentElement and set to componentWidth
			var gridItemWidth : number; // Define gridItemWIdth as the width of the individual Grid Items we'll be setting
			var renderColumns : any = componentElement.getAttribute("data-syiro-render-columns"); // Get the render-columns value

			var firstGridItem : Element = componentElement.querySelector('div[data-syiro-component="grid-item"]:first-of-type'); // Get the first Grid Item
			var hasInnerGridItems : boolean= (firstGridItem !== null); // Set hasInnerGridItems to the comparison between our grid-item query and null

			if (hasInnerGridItems){ // If there are Grid Items
				if (renderColumns !== "dynamic") { // If renderColumns is NOT set to dynamic
					renderColumns = Number(renderColumns); // Change renderColumns to a Number
					var innerGridItems : NodeList = componentElement.querySelectorAll('div[data-syiro-component="grid-item"]'); // Get all the inner Grid Items

					var gridItemPaddingCalculation = (componentWidth * 0.03); // Set gridItemPaddingCalculation to the width of the Grid * 3% (padding left and right are 1.5% each)
					gridItemWidth = ((componentWidth / renderColumns) - gridItemPaddingCalculation); // Set gridItemWidth as the componentWidth / renderColumns, minus gridItemPaddingCalculation

					for (var innerGridItemIndex = 0; innerGridItemIndex < innerGridItems.length; innerGridItemIndex++){
						var gridItem : any = innerGridItems[innerGridItemIndex]; // Get this gridItem
						syiro.component.CSS(gridItem, "width", gridItemWidth.toString() + "px"); // Set the width of this gridItem
					}
				}
			}
		}
	}

	// #endregion

}

// #endregion

// #region Syiro Grid Item Component

module syiro.griditem {

	// #region New Grid Item Component

	export function New(properties : Object) : ComponentObject {
		var gridItemComponent : ComponentObject;

		if ((syiro.utilities.TypeOfThing(properties["html"], "Element")) || (syiro.utilities.TypeOfThing(properties["html"], "string"))){ // If the only valid property, HTML, is defined, as an Element or string
			var gridItemComponent : ComponentObject = { "id" : syiro.component.IdGen("grid-item"), "type" : "grid-item" }; // Define componentObject as the generated ComponentObject with the unique Id as well as type to grid-item
			var componentElement : HTMLElement = syiro.utilities.ElementCreator("div", { "data-syiro-component-id" : gridItemComponent.id, "data-syiro-component" : "grid-item" }); // Create the Grid Item container

			properties["html"] = syiro.utilities.SanitizeHTML(properties["html"]); // Sanitize the HTML, whether it be a string or an Element of some sort

			if (syiro.utilities.TypeOfThing(properties["html"], "Element")){ // If it is an Element
				componentElement.appendChild(properties["html"]); // Append the HTMLElement
			} else { // If it is a string
				componentElement.innerHTML = properties["html"]; // Set the innerHTML of the componentElement to the HTML
			}

			syiro.data.Write(gridItemComponent.id + "->HTMLElement", componentElement); // Write the Grid Item HTMLELement
		}

		return gridItemComponent;
	}

	// #endregion
}

// #endregion
