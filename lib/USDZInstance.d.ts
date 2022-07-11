import { RenderDelegateInterface } from './ThreeJsRenderDelegate';
import { USDModule } from './USDModule';
/**
 * Represents a model loaded by the USDZLoader and handles its lifecycle in the THREE context
 */
export declare class USDZInstance {
    driver: USDModule.HdWebSyncDriver;
    renderInterface: RenderDelegateInterface;
    fileName: string;
    usdModule: USDModule;
    targetGroup: THREE.Group;
    private timeout;
    private endTimecode;
    constructor(fileName: string, usdModule: USDModule, driver: USDModule.HdWebSyncDriver, renderInterface: RenderDelegateInterface, targetGroup: THREE.Group);
    /**
     * Returns the USDz instance container
     */
    getGroup(): THREE.Group;
    /**
     * If there are some animations on this model, call this function to call the update loop of the animation
     * A time that evolves must be given for the animation to update
     */
    update(seconds: number): void;
    /**
     * Destroys the associated THREE.Group and unlink the data from the usd module driver
     */
    clear(): void;
}
