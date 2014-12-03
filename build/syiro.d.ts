interface Object {
    id?: string;
    type: string;
    link: string;
    title: string;
    HTMLElement?: Element;
}
interface Element {
    parentElement: Element;
    offsetTop: number;
    offsetBottom: number;
    offsetLeft: number;
    offsetRight: number;
    offsetHeight: number;
    offsetWidth: number;
}
interface Navigator {
    doNotTrack: string;
}
interface HTMLElement {
    autoplay: boolean;
}
interface Window {
    crypto: any;
}
declare module syiro.plugin.alternativeInit {
    function Init(): void;
    function Wait(): void;
}
declare module syiro.animation {
    function Animate(component: Object, animation: string, postAnimationFunction?: Function): void;
    function FadeIn(component: Object, postAnimationFunction?: Function): void;
    function FadeOut(component: Object, postAnimationFunction?: Function): void;
}
declare module syiro.component {
    var listenerStrings: Object;
    var storedComponents: Object;
    function Define(type: string, selector: string): Object;
    function CSS(component: any, property: string, newValue?: any): any;
    function Fetch(component: Object): any;
    function FetchComponentObject(componentElement: any): Object;
    function FetchDimensionsAndPosition(component: any): Object;
    function Update(componentId: string, componentElement: Element): void;
    function AddListeners(...args: any[]): boolean;
    function RemoveListeners(component: any): boolean;
    function Add(append: boolean, parentComponent: Object, childComponent: any): boolean;
    function Remove(componentsToRemove: any): boolean;
}
declare module syiro.device {
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
    function FetchScreenDetails(): void;
}
declare module syiro.generator {
    var lastUniqueIds: Object;
    function IdGen(type: string): string;
    function ElementCreator(...args: any[]): HTMLElement;
}
declare module syiro.header {
    function Generate(properties: Object): Object;
    function SetLogo(component: Object, image: string): void;
    function RemoveLogo(component: Object): void;
}
declare module syiro.footer {
    function Generate(properties: Object): Object;
    function SetLabel(component: Object, labelText: string): boolean;
    function AddLink(prepend: boolean, component: Object, linkProperties: Object): boolean;
    function RemoveLink(component: Object, linkProperties: Object): boolean;
}
declare module syiro.button {
    function Generate(properties: Object): Object;
    function SetLabel(component: Object, content: string): boolean;
}
declare module syiro.list {
    function Generate(properties: Object): Object;
    var AddItem: typeof component.Add;
    var RemoveItem: typeof component.Remove;
}
declare module syiro.listitem {
    function Generate(properties: Object): Object;
    function SetControl(component: Object, control: Object): boolean;
    function SetImage(component: Object, content: string): boolean;
    function SetLabel(component: Object, content: string): boolean;
}
declare module syiro.dropdown {
    function Generate(properties: Object): Object;
    function Toggle(component?: Object): void;
    function FetchLinkedListComponentObject(component: any): Object;
    function SetText(component: Object, content: any): void;
    function SetImage(component: Object, content: any): void;
    function SetIcon(component: Object, content: string): void;
    function AddItem(component: Object, listItemComponent: Object): void;
    function RemoveItem(component: Object, listItemComponent: Object): void;
}
declare module syiro.utilities {
    function SecondsToTimeFormat(seconds: number): Object;
}
declare module syiro.player {
    function Init(component: Object): void;
    function FetchInnerContentElement(component: Object): HTMLMediaElement;
    function GetPlayerLengthInfo(component: Object): Object;
    function TimeOrVolumeChanger(): void;
    function IsPlaying(component: Object): boolean;
    function PlayOrPause(component: Object, playButtonComponentObject?: Object): void;
    function FetchSources(component: Object): Object[];
    function GenerateSources(type: string, sources: any): HTMLElement[];
    function Reset(component: Object): void;
    function SetSources(component: Object, sources: any): void;
    function SetTime(component: Object, time: number): void;
    function SetVolume(component: Object, volume: number): void;
    function ToggleShareDialog(component?: Object): void;
}
declare module syiro.playercontrol {
    function Generate(properties: Object): Object;
    function TimeLabelUpdater(component: Object, timePart: number, value: any): void;
}
declare module syiro.audioplayer {
    function Generate(properties: Object): Object;
}
declare module syiro.videoplayer {
    function Generate(properties: Object): Object;
}
declare module syiro.searchbox {
    function Generate(properties: Object): Object;
    function SetText(component: Object, placeholderText: any): void;
}
declare module syiro {
    function Init(): void;
    var Define: typeof component.Define;
    var Fetch: typeof component.Fetch;
    var FetchComponentObject: typeof component.FetchComponentObject;
    var FetchDimensionsAndPosition: typeof component.FetchDimensionsAndPosition;
    var Add: typeof component.Add;
    var Remove: typeof component.Remove;
    var Animate: typeof animation.Animate;
    var CSS: typeof component.CSS;
    var AddListeners: typeof component.AddListeners;
    var RemoveListeners: typeof component.RemoveListeners;
}
