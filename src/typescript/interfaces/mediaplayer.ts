// Media Player Interfaces

/// <reference path="./core.ts" />

interface MediaPlayerPropertiesObject extends Object { // Properties object for Media Player Components
	// Audio-type Media Player properties
	artist ?: string; // Artist of media content (used in Audio-type Media Control)
	title ?: string; // Title of media content (used in Audio-type Media Control)
	generateContentInfo ?: boolean; // If we should generate content information

	// Dimensions
	height ?: number; // Height of the Media Player
	width ?: number; // Width of the Media Player

	art ?: string; // Artwork to use in the Media Player
	ForceLiveUX ?: boolean; // Should we force the Live UX or not
	menu ?: ComponentObject; // List ComponentObject
	sources : Array<string>; // Define sources as an array of URLs (strings)
	type ?: "audio" | "video"; // Type of the Media Player
	UsingExternalLibrary ?: boolean; // Use an external library
}