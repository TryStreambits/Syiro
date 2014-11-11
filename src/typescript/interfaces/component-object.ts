/*
	This is an interface for Component Objects.
*/

interface Object { // As ComponentObject is inherently an Object, extend the Object interface / type
	id ?: string; // Unique Component ID. Marked as Optional since it only applies for returned Component Objects, rocket.core.storedComponents stores the key / val differently.
	type : string; // Component Type (ex. header)
	link : string; // Used for Link Properties in the Footer
	title : string; // Used for Link Properties in the Footer
	HTMLElement ?: Element; // HTMLElement that is really an Element. Only applies in rocket.core.storedComponents when the component is newly generated.
}

interface Element { // Implementation of valid spec not found in lib.d.ts
	parentElement : Element; // Element's parentElement
}

interface Navigator { // Implementation of valid spec not found in lib.d.ts
	doNotTrack : string; // Define doNotTrack as a string
}

interface Window { // Implementation of valid spec not found in lib.d.ts
	crypto : any; // Define crypto as any
}
