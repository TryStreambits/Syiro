// Sidepane Interfaces

/// <reference path="./core.ts" />

interface SidepanePropertiesObject extends Object { // Properties object for Sidepane Components
	items ?: Array<any>; // Array of Items
	logo ?: any; // Source of the logo to use in the Sidepane
	searchbox ?: ComponentObject; // Searchbox Component Object
}
