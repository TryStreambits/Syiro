// Searchbox Interfaces

/// <reference path="./core.ts" />

interface SearchboxPropertiesObject extends Object { // Properties object for Searchbox Components
	content ?: string; // Content of the Searchbox
	DisableInputTrigger ?: boolean; // Disable triggering suggestions on input
	handler ?: Function; // Handler for getting suggestions
	listItemHandler ?: Function; // Function to call when we click List Items from suggestions
	preseed ?: Array<string>; // Preseeded suggestions
	suggestions ?: boolean; // Enabling suggestions
}