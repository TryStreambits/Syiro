declare var WebKitMutationObserver: any;
interface Document {
    msFullscreenElement: Element;
    msExitFullscreen: Function;
    mozFullScreenElement: Element;
    mozCancelFullScreen: Function;
    SyiroFullscreenElement: Element;
}
interface ComponentObject extends Object {
}
interface Console {
    profileEnd(profile?: string): any;
}
interface Element {
    msRequestFullscreen: Function;
    mozRequestFullScreen: Function;
}
interface ComponentObject extends Object {
    id: string;
    type: string;
}
interface LinkPropertiesObject extends Object {
    link: string;
    title: string;
}
interface MutationObserver {
    observe(target: HTMLElement, options: MutationObserverInit): void;
}
interface Navigator {
    doNotTrack: string;
}
interface Node {
    appendChild(newChild: (Element | HTMLElement)): Node;
    insertBefore(newChild: (Element | HTMLElement), refChild?: (Element | HTMLElement | Node)): Node;
    removeChild(newChild: (Element | HTMLElement)): Node;
}
interface Screen {
    orientation: any;
    mozOrientation: any;
    onorientationchange: any;
    onmozorientationchange: any;
}
declare module syiro.data {
    var storage: Object;
    function Manage(modificationType: string, keyList: string, data?: any): any;
    function Read(keyList: string): any;
    function Write(keyList: string, data: any): any;
    function Delete(keyList: string): any;
}
declare module syiro.animation {
    function Animate(component: any, properties: Object): void;
    function Reset(component: any): void;
    function FadeIn(component: any, postAnimationFunction?: Function): void;
    function FadeOut(component: any, postAnimationFunction?: Function): void;
    function Slide(component: any, postAnimationFunction?: Function): void;
}
declare module syiro.utilities {
    function ElementCreator(type: string, attributes: Object): any;
    function SanitizeHTML(content: any): any;
    function SecondsToTimeFormat(seconds: number): Object;
    function TypeOfThing(thing: any, checkAgainstType?: string): any;
}
declare module syiro.generator {
    var ElementCreator: typeof utilities.ElementCreator;
}
declare module syiro.events {
    var eventStrings: Object;
    function Handler(): void;
    function Trigger(eventType: string, component: any, eventData?: Event): void;
    function Add(listeners: any, component: any, listenerCallback: Function): boolean;
    function Remove(...args: any[]): boolean;
}
declare module syiro.render {
    function Position(positioningList: (string | Array<string>), componentObject: any, relativeComponentObject: any): boolean;
    function Scale(component: ComponentObject, data?: Object): void;
}
declare module syiro.component {
    var lastUniqueIds: Object;
    function CSS(component: any, property: string, newValue?: (string | boolean)): any;
    function Fetch(component: ComponentObject): any;
    function FetchComponentObject(...args: any[]): ComponentObject;
    function FetchDimensionsAndPosition(component: any): Object;
    function FetchLinkedListComponentObject(component: any): ComponentObject;
    function IdGen(type: string): string;
    function IsComponentObject(component: any): boolean;
    function Update(componentId: string, componentElement: Element): void;
    function Add(appendOrPrepend: any, parentComponent: any, childComponent: any): boolean;
    function Remove(componentsToRemove: any): void;
}
declare module syiro.init {
    function Parser(componentElement: Element): void;
    function createContentOverlay(purpose: string): Element;
    function Buttongroup(component: ComponentObject): void;
    function List(component: ComponentObject): void;
    function Player(component: ComponentObject): void;
    function PlayerControl(componentObject: ComponentObject, playerControlComponentObject: ComponentObject): void;
    function Searchbox(component: ComponentObject): void;
    function Sidepane(component: ComponentObject): void;
    function Toast(component: ComponentObject): void;
}
declare module syiro.device {
    var DoNotTrack: boolean;
    var HasCryptography: boolean;
    var HasGeolocation: boolean;
    var HasIndexedDB: boolean;
    var HasLocalStorage: boolean;
    var IsOnline: boolean;
    var OperatingSystem: string;
    var SupportsMutationObserver: boolean;
    var SupportsTouch: boolean;
    var IsSubHD: boolean;
    var IsHD: boolean;
    var IsFullHDOrAbove: boolean;
    var Orientation: string;
    var OrientationObject: any;
    var height: number;
    var width: number;
    function Detect(): void;
    function FetchOperatingSystem(): string;
    function FetchScreenDetails(): void;
    function FetchScreenOrientation(): string;
}
declare module syiro.navbar {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function AddLink(append: boolean, component: ComponentObject, elementOrProperties: any): boolean;
    function RemoveLink(component: ComponentObject, elementOrProperties: any): boolean;
    function SetLogo(component: ComponentObject, content: string): boolean;
    function SetLabel(component: ComponentObject, content: string): boolean;
}
declare module syiro.button {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function SetIcon(component: ComponentObject, content: string): boolean;
    function SetImage(component: ComponentObject, content: string): boolean;
    function SetText(component: ComponentObject, content: string): boolean;
    var SetLabel: Function;
    function Toggle(component?: ComponentObject, active?: boolean): void;
}
declare module syiro.buttongroup {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function CalculateInnerButtonWidth(component: any): HTMLElement;
    function Toggle(buttonComponent?: ComponentObject): void;
}
declare module syiro.list {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function SetHeader(component: ComponentObject, content: any): void;
    function Toggle(component: any): void;
    var AddItem: typeof component.Add;
    var RemoveItem: typeof component.Remove;
}
declare module syiro.listitem {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function SetControl(component: ComponentObject, control: ComponentObject): boolean;
    function SetImage(component: ComponentObject, content: string): boolean;
    function SetLabel(component: ComponentObject, content: string): boolean;
    function SetLink(component: ComponentObject, properties: any): boolean;
}
declare module syiro.dropdown {
    var FetchLinkedListComponentObject: Function;
    function Generate(properties: Object): any;
    var Toggle: Function;
    function SetText(component: ComponentObject, content: any): boolean;
    var SetIcon: Function;
    function SetImage(component: ComponentObject, content: any): boolean;
    function AddItem(component: ComponentObject, listItemComponent: ComponentObject): void;
    function RemoveItem(component: ComponentObject, listItemComponent: ComponentObject): void;
}
declare module syiro.player {
    function DurationChange(component: ComponentObject): void;
    function FetchInnerContentElement(component: ComponentObject): HTMLMediaElement;
    function FetchSources(component: ComponentObject): Array<Object>;
    function GetPlayerLengthInfo(component: ComponentObject): Object;
    function IsPlayable(component: ComponentObject): boolean;
    function IsPlaying(component: ComponentObject): boolean;
    function IsStreamable(component: ComponentObject): boolean;
    function GenerateSources(type: string, sources: Array<string>): Array<HTMLElement>;
    function PlayOrPause(component: ComponentObject, playButtonObjectOrElement?: any): void;
    function Reset(component: ComponentObject): void;
    function SetSources(component: ComponentObject, sources: any): void;
    function SetTime(...args: any[]): void;
    function SetVolume(component: ComponentObject, volume: number, fromEvent?: string): void;
    function ToggleFullscreen(component: ComponentObject): void;
    function ToggleMenuDialog(component: ComponentObject): void;
}
declare module syiro.playercontrol {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function ShowVolumeSlider(playerControlComponent: ComponentObject, volumeButtonComponent: ComponentObject): void;
    function TimeLabelUpdater(component: ComponentObject, timePart: number, value: any): void;
    function Toggle(component: ComponentObject, forceShow?: boolean): void;
}
declare module syiro.audioplayer {
    function New(properties: Object): any;
    var Generate: typeof New;
    function CenterInformation(component: ComponentObject): void;
}
declare module syiro.videoplayer {
    function New(properties: Object): any;
    var Generate: typeof New;
}
declare module syiro.searchbox {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function Suggestions(...args: any[]): void;
    function SetText(component: ComponentObject, content: any): void;
}
declare module syiro.sidepane {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function GestureInit(): void;
    function Drag(): void;
    function Release(): void;
    function Toggle(component: ComponentObject, eventData?: any): void;
}
declare module syiro.toast {
    function New(properties: Object): ComponentObject;
    var Generate: typeof New;
    function Clear(component: ComponentObject): void;
    function ClearAll(): void;
    function Toggle(component: ComponentObject, action?: string): void;
}
declare module syiro {
    var backgroundColor: string;
    var primaryColor: string;
    var secondaryColor: string;
    var legacyDimensionsDetection: boolean;
    function Init(): void;
    var CSS: typeof component.CSS;
    var Fetch: typeof component.Fetch;
    var FetchComponentObject: typeof component.FetchComponentObject;
    var FetchDimensionsAndPosition: typeof component.FetchDimensionsAndPosition;
    var FetchLinkedListComponentObject: typeof component.FetchLinkedListComponentObject;
    var IsComponentObject: typeof component.IsComponentObject;
    var Add: typeof component.Add;
    var Remove: typeof component.Remove;
    var Position: typeof render.Position;
    var Scale: typeof render.Scale;
}
