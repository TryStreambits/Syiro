// Picture Interfaces

/// <reference path="./core.ts" />

interface PicturePropertiesObject extends Object { // Properties object for Picture Components
	default : string; // Default source to use for the picture
	sources ?: QuerySource[]; // List of QuerySource(s)
	
	// Dimensions
	height ?: string | number; // Height of the Picture Component
	width ?: string | number; // Width of the Picture Component
}

interface QuerySource { // QuerySource interface
	mediaQuery : string; // Media query we should match against
	source : string; // Source we should use if the media query matches
}