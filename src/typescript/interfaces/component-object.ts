/*
	This is an interface for Component Objects.
*/

interface Object { // As ComponentObject is inherently an Object, extend the Object interface / type
	id ?: string; // Unique Component ID. Marked as Optional since it only applies for returned Component Objects, rocket.core.storedComponents stores the key / val differently.
	type : string; // Component Type (ex. header)
	HTMLElement ?: Element; // HTMLElement that is really an Element. Only applies in rocket.core.storedComponents when the component is newly generated.
}