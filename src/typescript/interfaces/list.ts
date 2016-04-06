// List & List Item Interfaces

/// <reference path="./core.ts" />

interface ListPropertiesObject extends Object { // Properties object for List Components
	header ?: string; // Content of a List Header
	items : Array<any>; // Array of Lists or List Items
}

interface ListItemPropertiesObject extends Object { // Properties object for List Item Components
	control ?: ComponentObject; // ComponentObject of the Control
	html ?: any; // HTML Element or string content
	image ?: string; // Source of image to use in image generation
	label ?: string; // Label content
	link ?: LinkPropertiesObject; // Link Properties
}