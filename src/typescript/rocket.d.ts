interface Object {
    id?: string;
    handlers: Function[];
    type: string;
    HTMLElement?: Element;
}
declare module rocket.core {
    var storedComponents: Object;
    var lastUniqueId: number;
    function IdGen(type: string): string;
    function Define(type: string, selector: string): Object;
    function Generate(type: string, properties: Object): Object;
    function Get(component: Object): Element;
    function UpdateStoredComponent(componentId: string, componentElement: Element): void;
    function AddComponent(append: boolean, parentComponent: Object, childComponent: any): boolean;
    function RemoveComponent(parentComponent: Object, childComponent: any): boolean;
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
    function Listen(component: Object, primaryCallback: Function, secondaryCallback?: Function): void;
}
declare module rocket {
    function Init(): void;
    function Define(type: string, properties: any): Object;
    function Generate(componentType: string, componentProperties: Object): Object;
    function AddComponent(prepend: boolean, parentComponent: Object, component: Object): Object;
    function RemoveComponent(parentComponent: Object, childComponent: any): boolean;
}
