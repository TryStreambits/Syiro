/// <reference path="jquery.d.ts" />
declare class Rocket {
    public thisClass: any;
    public thisPage: HTMLBodyElement;
    constructor();
    public init(): void;
    public rocketCallbacks: Object;
    public addCallback(componentRegister: string, componentElement: HTMLElement, componentFunction: Function, secondaryFunction?: Function): void;
    public removeCallback(componentRegister: string): void;
    public componentExistsCheck(parentElement: HTMLElement, component: any): boolean;
    public addComponent(prependOrAppend: string, parentElement: HTMLElement, component: Element): void;
    public removeComponent(parentElement: HTMLElement, component: any): void;
    public Header(rocketComponent: HTMLElement): void;
    public Footer(rocketComponent: HTMLElement): void;
    public Button(rocketComponent: HTMLElement): void;
    public List(rocketComponent: HTMLElement): void;
}
