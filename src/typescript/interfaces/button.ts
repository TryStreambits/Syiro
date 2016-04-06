// Button Interfaces

/// <reference path="./core.ts" />

interface ButtonPropertiesObject extends Object { // Properties Object for Button Component
	content ?: string; // Content of Basic and Dropdown type Buttons
	default ?: boolean; // Default state of Toggle type Button
	icon ?: string; // Custom icon that can be used in Basic and Dropdown type Buttons
	image ?: string; // Source of image to use in Basic and Dropdown type Buttons
	items ?: Array<any>; // Define items as an Array
	list ?: ComponentObject; // List ComponentObject
	position ?: Array<string>; // Position of Dropdown type Buttons
	type ?: string; // Type of the Button
}