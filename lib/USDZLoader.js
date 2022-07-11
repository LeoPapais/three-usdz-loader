"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USDZLoader = void 0;
var ThreeJsRenderDelegate_1 = require("./ThreeJsRenderDelegate");
var USDZInstance_1 = require("./USDZInstance");
var utils_1 = require("./Utils/utils");
var USDZLoader = /** @class */ (function () {
    /**
     * dependenciesDirectory is the directory where emHdBindings.js, emHdBindings.data, emHdBindings.wasm and emHdBindings.worker.js are located
     * Give the path without the end slash (/). Ex: http://localhost:8080/myWasmBinaries
     * @param dependenciesDirectory
     */
    function USDZLoader(dependenciesDirectory) {
        if (dependenciesDirectory === void 0) { dependenciesDirectory = ''; }
        // The USD module from AutoDesk. Only one should be there at a the time.
        this.usdModule = null;
        // Tells if a model is currently loading
        this.modelIsLoading = false;
        // Tells if the module loading completed (with success or not)
        this.moduleLoadingCompleted = false;
        this.initialize(dependenciesDirectory);
    }
    /**
     * Initializes the WASM module
     */
    USDZLoader.prototype.initialize = function (depDirectory) {
        return __awaiter(this, void 0, void 0, function () {
            var usdBindingsTag;
            var _this = this;
            return __generator(this, function (_a) {
                usdBindingsTag = document.createElement('script');
                usdBindingsTag.onload = function () { return __awaiter(_this, void 0, void 0, function () {
                    var isIOS, maxMemory, module, moduleReady, e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                                maxMemory = undefined;
                                if (isIOS) {
                                    maxMemory = 838860800;
                                    console.log('iOS device detected, reducing maximum memory to ' + maxMemory);
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 4, 5, 6]);
                                return [4 /*yield*/, window.getUsdModule(undefined, depDirectory, maxMemory)];
                            case 2:
                                module = _a.sent();
                                return [4 /*yield*/, module.ready];
                            case 3:
                                moduleReady = _a.sent();
                                if (moduleReady) {
                                    this.usdModule = module;
                                }
                                return [3 /*break*/, 6];
                            case 4:
                                e_1 = _a.sent();
                                console.error('USDZ module could not initialize, error: ' + e_1);
                                return [3 /*break*/, 6];
                            case 5:
                                this.moduleLoadingCompleted = true;
                                return [7 /*endfinally*/];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); };
                document.head.appendChild(usdBindingsTag);
                usdBindingsTag.setAttribute('src', depDirectory + '/emHdBindings.js');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Gathers the module while ensuring it's ready to be used
     * Returns null if the loading was completed with error
     */
    USDZLoader.prototype.waitForModuleLoadingCompleted = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.moduleLoadingCompleted) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/, this.usdModule];
                }
            });
        });
    };
    /**
     * Loads a USDZ file into the target ThreeJS Group
     * @param file
     * @param targetGroup
     */
    USDZLoader.prototype.load = function (file, targetGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var result, instance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.modelIsLoading) {
                            this.modelIsLoading = false;
                            throw 'A model is already loading. Please wait.';
                        }
                        // Wait for module to be ready
                        return [4 /*yield*/, this.waitForModuleLoadingCompleted()];
                    case 1:
                        // Wait for module to be ready
                        _a.sent();
                        // Make sure module is ready
                        if (this.usdModule == null) {
                            this.modelIsLoading = false;
                            throw 'Cannot load file. The module could not be loaded properly.';
                        }
                        // Notice start of loading
                        this.modelIsLoading = true;
                        return [4 /*yield*/, utils_1.USDZLoaderUtils.readFileAsync(file)];
                    case 2:
                        result = _a.sent();
                        // Load the raw data with the module
                        try {
                            instance = this.loadUsdFileFromArrayBuffer(this.usdModule, file.name, result, targetGroup);
                            // Notice end of loading
                            this.modelIsLoading = false;
                            return [2 /*return*/, instance];
                        }
                        catch (e) {
                            this.modelIsLoading = false;
                            throw e;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Raw methods that loads the USDZ file array buffer into the target ThreeJS Group
     * @param filename
     * @param usdFile
     * @param targetGroup
     */
    USDZLoader.prototype.loadUsdFileFromArrayBuffer = function (usdModule, filename, usdFile, targetGroup) {
        // Generate random filename to avoid conflict when opening a file multiple times
        var extension = utils_1.USDZLoaderUtils.getFileExtension(filename);
        var randomFileName = utils_1.USDZLoaderUtils.getRandomGuid();
        var inputFileName = randomFileName + '.' + extension;
        // Give the RAW data to the USD module
        usdModule.FS.createDataFile('/', inputFileName, new Uint8Array(usdFile), true, true, true);
        // Create Render Interface / Driver
        var renderInterface = new ThreeJsRenderDelegate_1.RenderDelegateInterface(inputFileName, targetGroup);
        var driver = new usdModule.HdWebSyncDriver(renderInterface, inputFileName);
        renderInterface.setDriver(driver);
        driver.Draw();
        // Returns an object of with all of this that can be manipulated later
        var instance = new USDZInstance_1.USDZInstance(inputFileName, usdModule, driver, renderInterface, targetGroup);
        return instance;
    };
    return USDZLoader;
}());
exports.USDZLoader = USDZLoader;
