// Grid Interfaces

/// <reference path="./core.ts" />

interface GridPropertiesObject extends Object { // Properties Object for Grid Components
	columns ?: number; // Fixed columns of a Grid (otherwise is dynamic)
	items : Array<GridItemPropertiesObject>; // Array of GridItemPropertiesObject
}

interface GridItemPropertiesObject extends Object { // Properties Object for Grid Item Components
	html ?: any; // HTML content of Grid Item, can be an Element or string
}