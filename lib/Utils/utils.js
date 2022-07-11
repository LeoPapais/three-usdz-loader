"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USDZLoaderUtils = void 0;
var USDZLoaderUtils = /** @class */ (function () {
    function USDZLoaderUtils() {
    }
    /**
     * Read a file async and returns an array buffer
     * @param file
     * @returns
     */
    USDZLoaderUtils.readFileAsync = function (file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };
    /**
     * Generate random string GUID
     */
    USDZLoaderUtils.getRandomGuid = function () {
        return (Math.random() + 1).toString(36).substring(7);
    };
    /**
     * Given a file name / path, returns the file extension
     * @param filePath
     * @returns
     */
    USDZLoaderUtils.getFileExtension = function (filePath) {
        var extension = filePath.split('.').pop();
        if (extension == undefined) {
            throw 'Cannot determine extension';
        }
        extension = extension.split('?')[0];
        return extension;
    };
    return USDZLoaderUtils;
}());
exports.USDZLoaderUtils = USDZLoaderUtils;
