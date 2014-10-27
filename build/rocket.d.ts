interface Object {
    id?: string;
    type: string;
    HTMLElement?: Element;
}
interface Element {
    parentElement: Element;
}
declare module rocket.component {
    var storedComponents: Object;
    var lastUniqueId: number;
    var dropdownToggler: Function;
    function Define(type: string, selector: string): Object;
    function Animate(component: Object, animation: string, postAnimationFunction?: Function): void;
    function CSS(componentObject: Object, property: string, newValue?: any): any;
    function AddListeners(listeners: string, component: Object, handler: Function): boolean;
    function RemoveListeners(listeners: string, component: Object): boolean;
    function Fetch(component: Object): any;
    function Update(componentId: string, componentElement: Element): void;
    function Add(append: boolean, parentComponent: Object, childComponent: any): boolean;
    function Remove(parentComponent: Object, childComponent?: any): boolean;
}
declare module rocket.generator {
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
interface linkPropertiesInterface {
    link: string;
    title: string;
}
declare module rocket.footer {
    function SetLabel(component: Object, labelText: string): boolean;
    function AddLink(prepend: boolean, component: Object, linkProperties: linkPropertiesInterface): boolean;
    function RemoveLink(component: Object, linkProperties: linkPropertiesInterface): boolean;
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
    function InternalListComponentFetcher(dropdownComponent: any): Object;
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
    var Get: typeof component.Fetch;
    var Add: typeof component.Add;
    var Remove: typeof component.Remove;
    var Animate: typeof component.Animate;
    var CSS: typeof component.CSS;
    var AddListeners: typeof component.AddListeners;
    var RemoveListeners: typeof component.RemoveListeners;
}
