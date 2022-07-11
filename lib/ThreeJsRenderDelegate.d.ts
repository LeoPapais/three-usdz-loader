export class RenderDelegateInterface {
    constructor(filename: any, usdRoot: any);
    registry: TextureRegistry;
    materials: {};
    meshes: {};
    createRPrim(typeId: any, id: any, instancerId: any): HydraMesh;
    createBPrim(typeId: any, id: any): void;
    createSPrim(typeId: any, id: any): HydraMaterial | undefined;
    setDriver(driver: any): void;
    CommitResources(): void;
}
declare class TextureRegistry {
    constructor(basename: any);
    basename: any;
    textures: any[];
    loader: THREE.TextureLoader;
    getTexture(filename: any): any;
}
declare class HydraMesh {
    constructor(id: any, hydraInterface: any);
    _geometry: THREE.BufferGeometry;
    _id: any;
    _interface: any;
    _points: any;
    _normals: any;
    _colors: any;
    _uvs: any;
    _indices: any[] | undefined;
    _mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
    updateOrder(attribute: any, attributeName: any, dimension?: number): void;
    updateIndices(indices: any): void;
    setTransform(matrix: any): void;
    updateNormals(normals: any): void;
    setMaterial(materialId: any): void;
    setDisplayColor(data: any, interpolation: any): void;
    setUV(data: any, dimension: any, interpolation: any): void;
    updatePrimvar(name: any, data: any, dimension: any, interpolation: any): void;
    updatePoints(points: any): void;
    commit(): void;
}
declare class HydraMaterial {
    static usdPreviewToMeshPhysicalTextureMap: {
        diffuseColor: string;
        clearcoat: string;
        clearcoatRoughness: string;
        emissiveColor: string;
        occlusion: string;
        roughness: string;
        metallic: string;
        normal: string;
        opacity: string;
    };
    static channelMap: {
        r: THREE.PixelFormat;
        rgb: THREE.PixelFormat;
        rgba: THREE.PixelFormat;
    };
    static usdPreviewToMeshPhysicalMap: {
        clearcoat: string;
        clearcoatRoughness: string;
        diffuseColor: string;
        emissiveColor: string;
        ior: string;
        metallic: string;
        opacity: string;
        roughness: string;
    };
    constructor(id: any, hydraInterface: any);
    _id: any;
    _nodes: {};
    _interface: any;
    _material: any;
    updateNode(networkId: any, path: any, parameters: any): void;
    assignTexture(mainMaterial: any, parameterName: any): void;
    assignProperty(mainMaterial: any, parameterName: any): void;
    updateFinished(type: any, relationships: any): void;
}
import * as THREE from "three";
export {};
