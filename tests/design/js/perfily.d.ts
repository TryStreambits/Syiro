declare class Perfily {
    name: string;
    duration: number;
    expecting: any;
    testFunction: Function;
    outputIntoDocument: boolean;
    constructor(benchmarkProperties?: Object);
    SetExpecting(benchmarkExpectedResult: Function): void;
    SetFunction(benchmarkFunction: Function): void;
    SetName(benchmarkName: string): void;
    Run(): void;
}
