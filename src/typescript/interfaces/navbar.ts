// Navbar Interfaces

/// <reference path="./core.ts" />

interface NavbarPropertiesObject extends Object { // Properties object for Navbar Components
	// Bottom-position Navbar properties
	content ?: string; // Content, usually a Copyright section

	// Top-position Navbar properties
	logo ?: string; // Source of the logo to use in the Navbar

	fixed ?: boolean; // Should we have a fixed position
	items : Array<any>; // Items to add to the Navbar
	position ?: "top" | "bottom"; // Position of the Navbar (top or bottom)
}