"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderDelegateInterface = void 0;
var THREE = require("three");
var TextureRegistry = /** @class */ (function () {
    function TextureRegistry(basename) {
        this.basename = basename;
        this.textures = [];
        this.loader = new THREE.TextureLoader();
    }
    TextureRegistry.prototype.getTexture = function (filename) {
        var _this = this;
        if (this.textures[filename]) {
            return this.textures[filename];
        }
        var textureResolve, textureReject;
        this.textures[filename] = new Promise(function (resolve, reject) {
            textureResolve = resolve;
            textureReject = reject;
        });
        var resourcePath = filename;
        if (filename[0] !== "/") {
            resourcePath = this.basename + "[" + filename + "]";
        }
        var filetype = undefined;
        if (filename.indexOf(".png") >= filename.length - 5) {
            filetype = "image/png";
        }
        else if (filename.indexOf(".jpg") >= filename.length - 5) {
            filetype = "image/jpeg";
        }
        else if (filename.indexOf(".jpeg") >= filename.length - 5) {
            filetype = "image/jpeg";
        }
        else {
            throw new Error("Unknown filetype");
        }
        window.driver.getFile(resourcePath, function (loadedFile) {
            if (!loadedFile) {
                textureReject(new Error("Unknown file: " + resourcePath));
                return;
            }
            var blob = new Blob([loadedFile.slice(0)], { type: filetype });
            var blobUrl = URL.createObjectURL(blob);
            // Load the texture
            _this.loader.load(
            // resource URL
            blobUrl, 
            // onLoad callback
            function (texture) {
                textureResolve(texture);
            }, 
            // onProgress callback currently not used
            undefined, 
            // onError callback
            function (err) {
                textureReject(err);
            });
        });
        return this.textures[filename];
    };
    return TextureRegistry;
}());
var HydraMesh = /** @class */ (function () {
    function HydraMesh(id, hydraInterface) {
        this._geometry = new THREE.BufferGeometry();
        this._id = id;
        this._interface = hydraInterface;
        this._points = undefined;
        this._normals = undefined;
        this._colors = undefined;
        this._uvs = undefined;
        this._indices = undefined;
        var material = new THREE.MeshPhysicalMaterial({
            side: THREE.DoubleSide,
            color: new THREE.Color(0x00ff00), // a green color to indicate a missing material
        });
        this._mesh = new THREE.Mesh(this._geometry, material);
        this._mesh.castShadow = true;
        this._mesh.receiveShadow = true;
        window.usdRoot.add(this._mesh); // FIXME
    }
    HydraMesh.prototype.updateOrder = function (attribute, attributeName, dimension) {
        if (dimension === void 0) { dimension = 3; }
        if (attribute && this._indices) {
            var values = [];
            for (var i = 0; i < this._indices.length; i++) {
                var index = this._indices[i];
                for (var j = 0; j < dimension; ++j) {
                    values.push(attribute[dimension * index + j]);
                }
            }
            this._geometry.setAttribute(attributeName, new THREE.Float32BufferAttribute(values, dimension));
        }
    };
    HydraMesh.prototype.updateIndices = function (indices) {
        this._indices = [];
        for (var i = 0; i < indices.length; i++) {
            this._indices.push(indices[i]);
        }
        //this._geometry.setIndex( indicesArray );
        this.updateOrder(this._points, "position");
        this.updateOrder(this._normals, "normal");
        if (this._colors) {
            this.updateOrder(this._colors, "color");
        }
        if (this._uvs) {
            this.updateOrder(this._uvs, "uv", 2);
            this._geometry.attributes.uv2 = this._geometry.attributes.uv;
        }
    };
    HydraMesh.prototype.setTransform = function (matrix) {
        var _a;
        (_a = this._mesh.matrix).set.apply(_a, matrix);
        this._mesh.matrix.transpose();
        this._mesh.matrixAutoUpdate = false;
    };
    HydraMesh.prototype.updateNormals = function (normals) {
        this._normals = normals.slice(0);
        this.updateOrder(this._normals, "normal");
    };
    // This is always called before prims are updated
    HydraMesh.prototype.setMaterial = function (materialId) {
        //console.log("Material: " + materialId);
        if (this._interface.materials[materialId]) {
            this._mesh.material = this._interface.materials[materialId]._material;
        }
    };
    HydraMesh.prototype.setDisplayColor = function (data, interpolation) {
        var wasDefaultMaterial = false;
        if (this._mesh.material === defaultMaterial) {
            this._mesh.material = this._mesh.material.clone();
            wasDefaultMaterial = true;
        }
        this._colors = null;
        if (interpolation === "constant") {
            this._mesh.material.color = new THREE.Color().fromArray(data);
        }
        else if (interpolation === "vertex") {
            // Per-vertex buffer attribute
            this._mesh.material.vertexColors = true;
            if (wasDefaultMaterial) {
                // Reset the pink debugging color
                this._mesh.material.color = new THREE.Color(0xffffff);
            }
            this._colors = data.slice(0);
            this.updateOrder(this._colors, "color");
        }
        else {
            //console.warn(
            // `Unsupported displayColor interpolation type '${interpolation}'.`
            //);
        }
    };
    HydraMesh.prototype.setUV = function (data, dimension, interpolation) {
        // TODO: Support multiple UVs. For now, we simply set uv = uv2, which is required when a material has an aoMap.
        this._uvs = null;
        if (interpolation === "facevarying") {
            // The UV buffer has already been prepared on the C++ side, so we just set it
            this._geometry.setAttribute("uv", new THREE.Float32BufferAttribute(data, dimension));
        }
        else if (interpolation === "vertex") {
            // We have per-vertex UVs, so we need to sort them accordingly
            this._uvs = data.slice(0);
            this.updateOrder(this._uvs, "uv", 2);
        }
        this._geometry.attributes.uv2 = this._geometry.attributes.uv;
    };
    HydraMesh.prototype.updatePrimvar = function (name, data, dimension, interpolation) {
        if (name === "points" || name === "normals") {
            // Points and normals are set separately
            return;
        }
        //console.log("Setting PrimVar: " + name);
        // TODO: Support multiple UVs. For now, we simply set uv = uv2, which is required when a material has an aoMap.
        if (name.startsWith("st")) {
            name = "uv";
        }
        switch (name) {
            case "displayColor":
                this.setDisplayColor(data, interpolation);
                break;
            case "uv":
                this.setUV(data, dimension, interpolation);
                break;
            default:
            //console.warn("Unsupported primvar", name);
        }
    };
    HydraMesh.prototype.updatePoints = function (points) {
        this._points = points.slice(0);
        this.updateOrder(this._points, "position");
    };
    HydraMesh.prototype.commit = function () {
        // Nothing to do here. All Three.js resources are already updated during the sync phase.
    };
    return HydraMesh;
}());
var defaultMaterial;
var HydraMaterial = /** @class */ (function () {
    function HydraMaterial(id, hydraInterface) {
        this._id = id;
        this._nodes = {};
        this._interface = hydraInterface;
        if (!defaultMaterial) {
            defaultMaterial = new THREE.MeshPhysicalMaterial({
                side: THREE.DoubleSide,
                color: new THREE.Color(0xff2997),
                envMap: window.envMap,
            });
        }
        this._material = defaultMaterial;
    }
    HydraMaterial.prototype.updateNode = function (networkId, path, parameters) {
        //console.log("Updating Material Node: " + networkId + " " + path);
        this._nodes[path] = parameters;
    };
    HydraMaterial.prototype.assignTexture = function (mainMaterial, parameterName) {
        var _this = this;
        var materialParameterMapName = HydraMaterial.usdPreviewToMeshPhysicalTextureMap[parameterName];
        if (materialParameterMapName === undefined) {
            //console.warn(
            //  `Unsupported material texture parameter '${parameterName}'.`
            //);
            return;
        }
        if (mainMaterial[parameterName] && mainMaterial[parameterName].nodeIn) {
            var textureFileName_1 = mainMaterial[parameterName].nodeIn.file;
            var channel_1 = mainMaterial[parameterName].inputName;
            // For debugging
            var matName = Object.keys(this._nodes).find(function (key) { return _this._nodes[key] === mainMaterial; });
            //console.log(
            //  `Setting texture '${materialParameterMapName}' (${textureFileName}) of material '${matName}'...`
            //);
            this._interface.registry.getTexture(textureFileName_1).then(function (texture) {
                var _a, _b;
                if (materialParameterMapName === "alphaMap") {
                    // If this is an opacity map, check if it's using the alpha channel of the diffuse map.
                    // If so, simply change the format of that diffuse map to RGBA and make the material transparent.
                    // If not, we need to copy the alpha channel into a new texture's green channel, because that's what Three.js
                    // expects for alpha maps (not supported at the moment).
                    // NOTE that this only works if diffuse maps are always set before opacity maps, so the order of
                    // 'assingTexture' calls for a material matters.
                    if (textureFileName_1 === ((_b = (_a = mainMaterial.diffuseColor) === null || _a === void 0 ? void 0 : _a.nodeIn) === null || _b === void 0 ? void 0 : _b.file) &&
                        channel_1 === "a") {
                        _this._material.map.format = THREE.RGBAFormat;
                    }
                    else {
                        // TODO: Extract the alpha channel into a new RGB texture.
                    }
                    _this._material.transparent = true;
                    _this._material.needsUpdate = true;
                    return;
                }
                else if (materialParameterMapName === "metalnessMap") {
                    _this._material.metalness = 1.0;
                }
                else if (materialParameterMapName === "emissiveMap") {
                    _this._material.emissive = new THREE.Color(0xffffff);
                }
                else if (!HydraMaterial.channelMap[channel_1]) {
                    //console.warn(`Unsupported texture channel '${channel}'!`);
                    return;
                }
                // Clone texture and set the correct format.
                var clonedTexture = texture.clone();
                clonedTexture.format = HydraMaterial.channelMap[channel_1];
                clonedTexture.needsUpdate = true;
                clonedTexture.wrapS = THREE.RepeatWrapping;
                clonedTexture.wrapT = THREE.RepeatWrapping;
                _this._material[materialParameterMapName] = clonedTexture;
                _this._material.needsUpdate = true;
            });
        }
        else {
            this._material[materialParameterMapName] = undefined;
        }
    };
    HydraMaterial.prototype.assignProperty = function (mainMaterial, parameterName) {
        var materialParameterName = HydraMaterial.usdPreviewToMeshPhysicalMap[parameterName];
        if (materialParameterName === undefined) {
            //console.warn(`Unsupported material parameter '${parameterName}'.`);
            return;
        }
        if (mainMaterial[parameterName] !== undefined &&
            !mainMaterial[parameterName].nodeIn) {
            //console.log(
            //  `Assigning property ${parameterName}: ${mainMaterial[parameterName]}`
            //);
            if (Array.isArray(mainMaterial[parameterName])) {
                this._material[materialParameterName] = new THREE.Color().fromArray(mainMaterial[parameterName]);
            }
            else {
                this._material[materialParameterName] = mainMaterial[parameterName];
                if (materialParameterName === "opacity" &&
                    mainMaterial[parameterName] < 1.0) {
                    this._material.transparent = true;
                }
            }
        }
    };
    HydraMaterial.prototype.updateFinished = function (type, relationships) {
        for (var _i = 0, relationships_1 = relationships; _i < relationships_1.length; _i++) {
            var relationship = relationships_1[_i];
            relationship.nodeIn = this._nodes[relationship.inputId];
            relationship.nodeOut = this._nodes[relationship.outputId];
            relationship.nodeIn[relationship.inputName] = relationship;
            relationship.nodeOut[relationship.outputName] = relationship;
        }
        //console.log("Finalizing Material: " + this._id);
        // find the main material node
        var mainMaterialNode = undefined;
        for (var _a = 0, _b = Object.values(this._nodes); _a < _b.length; _a++) {
            var node = _b[_a];
            if (node.diffuseColor) {
                mainMaterialNode = node;
                break;
            }
        }
        if (!mainMaterialNode) {
            this._material = defaultMaterial;
            return;
        }
        // TODO: Ideally, we don't recreate the material on every update.
        // Creating a new one requires to also update any meshes that reference it. So we're relying on the C++ side to
        // call this before also calling `setMaterial` on the affected meshes.
        //console.log("Creating Material: " + this._id);
        this._material = new THREE.MeshPhysicalMaterial({});
        // Assign textures
        for (var key in HydraMaterial.usdPreviewToMeshPhysicalTextureMap) {
            this.assignTexture(mainMaterialNode, key);
        }
        // Assign material properties
        for (var key in HydraMaterial.usdPreviewToMeshPhysicalMap) {
            this.assignProperty(mainMaterialNode, key);
        }
        if (window.envMap) {
            this._material.envMap = window.envMap;
        }
        //console.log(this._material);
    };
    // Maps USD preview material texture names to Three.js MeshPhysicalMaterial names
    HydraMaterial.usdPreviewToMeshPhysicalTextureMap = {
        diffuseColor: "map",
        clearcoat: "clearcoatMap",
        clearcoatRoughness: "clearcoatRoughnessMap",
        emissiveColor: "emissiveMap",
        occlusion: "aoMap",
        roughness: "roughnessMap",
        metallic: "metalnessMap",
        normal: "normalMap",
        opacity: "alphaMap",
    };
    HydraMaterial.channelMap = {
        // Three.js expects many 8bit values such as roughness or metallness in a specific RGB texture channel.
        // We could write code to combine multiple 8bit texture files into different channels of one RGB texture where it
        // makes sense, but that would complicate this loader a lot. Most Three.js loaders don't seem to do it either.
        // Instead, we simply provide the 8bit image as an RGB texture, even though this might be less efficient.
        r: THREE.RGBAFormat,
        rgb: THREE.RGBAFormat,
        rgba: THREE.RGBAFormat,
    };
    // Maps USD preview material property names to Three.js MeshPhysicalMaterial names
    HydraMaterial.usdPreviewToMeshPhysicalMap = {
        clearcoat: "clearcoat",
        clearcoatRoughness: "clearcoatRoughness",
        diffuseColor: "color",
        emissiveColor: "emissive",
        ior: "ior",
        metallic: "metalness",
        opacity: "opacity",
        roughness: "roughness",
    };
    return HydraMaterial;
}());
var RenderDelegateInterface = /** @class */ (function () {
    function RenderDelegateInterface(filename, usdRoot) {
        this.registry = new TextureRegistry(filename);
        this.materials = {};
        this.meshes = {};
        window.usdRoot = usdRoot;
    }
    RenderDelegateInterface.prototype.createRPrim = function (typeId, id, instancerId) {
        //console.log("Creating RPrim: " + typeId + " " + id);
        var mesh = new HydraMesh(id, this);
        this.meshes[id] = mesh;
        return mesh;
    };
    RenderDelegateInterface.prototype.createBPrim = function (typeId, id) {
        //console.log("Creating BPrim: " + typeId + " " + id);
        /*let mesh = new HydraMesh(id, this);
        this.meshes[id] = mesh;
        return mesh;*/
    };
    RenderDelegateInterface.prototype.createSPrim = function (typeId, id) {
        //console.log("Creating SPrim: " + typeId + " " + id);
        if (typeId === "material") {
            var material = new HydraMaterial(id, this);
            this.materials[id] = material;
            return material;
        }
        else {
            return undefined;
        }
    };
    RenderDelegateInterface.prototype.setDriver = function (driver) {
        window.driver = driver;
    };
    RenderDelegateInterface.prototype.CommitResources = function () {
        for (var id in this.meshes) {
            var hydraMesh = this.meshes[id];
            hydraMesh.commit();
        }
    };
    return RenderDelegateInterface;
}());
exports.RenderDelegateInterface = RenderDelegateInterface;
