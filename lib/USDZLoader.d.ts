import { USDModule } from './USDModule';
import { USDZInstance } from './USDZInstance';
export declare class USDZLoader {
    private usdModule;
    private modelIsLoading;
    private moduleLoadingCompleted;
    /**
     * dependenciesDirectory is the directory where emHdBindings.js, emHdBindings.data, emHdBindings.wasm and emHdBindings.worker.js are located
     * Give the path without the end slash (/). Ex: http://localhost:8080/myWasmBinaries
     * @param dependenciesDirectory
     */
    constructor(dependenciesDirectory?: string);
    /**
     * Initializes the WASM module
     */
    private initialize;
    /**
     * Gathers the module while ensuring it's ready to be used
     * Returns null if the loading was completed with error
     */
    waitForModuleLoadingCompleted(): Promise<USDModule | null>;
    /**
     * Loads a USDZ file into the target ThreeJS Group
     * @param file
     * @param targetGroup
     */
    loadFile(file: File, targetGroup: THREE.Group): Promise<USDZInstance>;
    /**
     * Raw methods that loads the USDZ file array buffer into the target ThreeJS Group
     * @param filename
     * @param usdFile
     * @param targetGroup
     */
    private loadUsdFileFromArrayBuffer;
}
