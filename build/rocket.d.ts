interface Object {
    id?: string;
    type: string;
    link: string;
    title: string;
    HTMLElement?: Element;
}
interface Element {
    parentElement: Element;
}
interface Navigator {
    doNotTrack: string;
}
interface Window {
    crypto: any;
}
declare module rocket.component {
    var storedComponents: Object;
    var dropdownToggler: Function;
    function Define(type: string, selector: string): Object;
    function Animate(component: Object, animation: string, postAnimationFunction?: Function): void;
    function CSS(componentObject: Object, property: string, newValue?: any): any;
    function AddListeners(listeners: string, component: Object, handler: Function): boolean;
    function RemoveListeners(listeners: string, component: Object): boolean;
    function Fetch(component: Object): any;
    function Update(componentId: string, componentElement: Element): void;
    function Add(append: boolean, parentComponent: Object, childComponent: any): boolean;
    function Remove(componentsToRemove: any): boolean;
}
declare module rocket.device {
    var DoNotTrack: boolean;
    var HasCryptography: boolean;
    var HasGeolocation: boolean;
    var HasIndexedDB: boolean;
    var HasLocalStorage: boolean;
    var IsOnline: boolean;
    var IsSubHD: boolean;
    var IsHD: boolean;
    var IsFullHDOrAbove: boolean;
    function Detect(): void;
}
declare module rocket.generator {
    var lastUniqueIds: Object;
    function IdGen(type: string): string;
    function ElementCreator(componentId: any, componentType: string, attributes?: Object): HTMLElement;
    function Header(properties: Object): Object;
    function Footer(properties: Object): Object;
    function Button(properties: Object): Object;
    function Dropdown(properties: Object): Object;
    function List(properties: Object): Object;
    function ListItem(properties: Object): Object;
    function Searchbox(properties: Object): Object;
}
declare module rocket.header {
    function SetLogo(component: Object, image: string): void;
    function RemoveLogo(component: Object): void;
}
declare module rocket.footer {
    function SetLabel(component: Object, labelText: string): boolean;
    function AddLink(prepend: boolean, component: Object, linkProperties: Object): boolean;
    function RemoveLink(component: Object, linkProperties: Object): boolean;
}
declare module rocket.button {
    function AddListeners(component: Object, callback: Function): void;
    function SetLabel(component: Object, content: string): boolean;
}
declare module rocket.list {
    var AddItem: typeof component.Add;
    var RemoveItem: typeof component.Remove;
}
declare module rocket.listitem {
    function Set(component: Object, section: string, content: any): boolean;
    function AddListeners(component: Object, callback: Function): boolean;
}
declare module rocket.dropdown {
    function InnerListComponentFetcher(dropdownComponent: any): Object;
    function SetText(component: Object, content: any): void;
    function SetImage(component: Object, content: any): void;
    function SetIcon(component: Object, content: string): void;
    function AddItem(component: Object, listItemComponent: Object): void;
    function RemoveItem(component: Object, listItemComponent: Object): void;
}
declare module rocket.searchbox {
    function SetText(component: Object, placeholderText: any): void;
    function AddListeners(component: Object, callback: Function): boolean;
    function RemoveListeners(component: Object): boolean;
}
declare module rocket {
    function Init(): void;
    var Define: typeof component.Define;
    var generate: {
        Header: typeof generator.Header;
        Footer: typeof generator.Footer;
        Button: typeof generator.Button;
        Dropdown: typeof generator.Dropdown;
        List: typeof generator.List;
        ListItem: typeof generator.ListItem;
        Searchbox: typeof generator.Searchbox;
    };
    var Fetch: typeof component.Fetch;
    var Add: typeof component.Add;
    var Remove: typeof component.Remove;
    var Animate: typeof component.Animate;
    var CSS: typeof component.CSS;
    var AddListeners: typeof component.AddListeners;
    var RemoveListeners: typeof component.RemoveListeners;
}
