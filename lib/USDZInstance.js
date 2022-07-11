"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USDZInstance = void 0;
/**
 * Represents a model loaded by the USDZLoader and handles its lifecycle in the THREE context
 */
var USDZInstance = /** @class */ (function () {
    function USDZInstance(fileName, usdModule, driver, renderInterface, targetGroup) {
        // Animations
        this.timeout = 40;
        this.endTimecode = 1;
        this.driver = driver;
        this.targetGroup = targetGroup;
        this.usdModule = usdModule;
        this.renderInterface = renderInterface;
        this.fileName = fileName;
        var stage = this.driver.GetStage();
        this.endTimecode = stage.GetEndTimeCode();
        this.timeout = 1000 / stage.GetTimeCodesPerSecond();
    }
    /**
     * Returns the USDz instance container
     */
    USDZInstance.prototype.getGroup = function () {
        return this.targetGroup;
    };
    /**
     * If there are some animations on this model, call this function to call the update loop of the animation
     * A time that evolves must be given for the animation to update
     */
    USDZInstance.prototype.update = function (seconds) {
        var time = (seconds * (1000 / this.timeout)) % this.endTimecode;
        this.driver.SetTime(time);
        this.driver.Draw();
    };
    /**
     * Destroys the associated THREE.Group and unlink the data from the usd module driver
     */
    USDZInstance.prototype.clear = function () {
        this.targetGroup.clear();
        this.usdModule.FS.unlink(this.fileName);
    };
    return USDZInstance;
}());
exports.USDZInstance = USDZInstance;
