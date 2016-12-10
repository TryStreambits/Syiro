// Toast Interfaces

/// <reference path="./core.ts" />

interface ToastPropertiesObject extends Object { // Properties object for Toast Components
	buttons?: Array<ToastButtonPropertiesObject>; // Array of buttons
	message: string; // Required message in the Toast
	title?: string; // Title of the Toast
}

interface ToastButtonPropertiesObject extends Object { // Properties of Buttons used in Toasts
	action?: "affirm" | "deny"; // Affirm or Deny action
	content?: string; // Content of the button
	function?: Function; // Function used when clicking the Button
}