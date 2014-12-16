/*
	These are interface extensions so Typescript doesn't freak out.
*/

interface Object { // As ComponentObject is inherently an Object, extend the Object interface / type
	id ?: string; // Unique Component ID. Marked as Optional since it only applies for returned Component Objects, syiro.core.componentData stores the key / val differently.
	type : string; // Component Type (ex. header)
	link : string; // Used for Link Properties in the Footer
	title : string; // Used for Link Properties in the Footer
	listeners ?: Array<string>; // Define listeners as an array of strings
	handlers ?: Array<Function>; // Define handlers as an array of functions
	HTMLElement ?: Element; // HTMLElement that is really an Element. Only applies in syiro.core.componentData when the component is newly generated.
}

interface Element { // Implementation of valid spec not found in lib.d.ts
	parentElement : Element; // Element's parentElement
	offsetTop: number;
	offsetBottom: number;
	offsetLeft : number;
	offsetRight : number;
	offsetHeight : number;
	offsetWidth : number;
}

interface Navigator { // Implementation of valid spec not found in lib.d.ts
	doNotTrack : string; // Define doNotTrack as a string
}

interface HTMLElement { // Implementation of HTMLElement
	autoplay : boolean; // Technically not in spec except for HTMLAudioElement and HTMLVideoElement
}

interface Window { // Implementation of valid spec not found in lib.d.ts
	crypto : any; // Define crypto as any
	ontouchend : any; // Define ontouchend as any
}

// #region Official Plugins

declare module syiro.plugin.alternativeInit {
	function Init(): void;
	function Wait(): void;
}

// #endregion
