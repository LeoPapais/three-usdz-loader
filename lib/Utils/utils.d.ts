export declare class USDZLoaderUtils {
    /**
     * Read a file async and returns an array buffer
     * @param file
     * @returns
     */
    static readFileAsync(file: File): Promise<string | ArrayBuffer | null>;
    /**
     * Generate random string GUID
     */
    static getRandomGuid(): string;
    /**
     * Given a file name / path, returns the file extension
     * @param filePath
     * @returns
     */
    static getFileExtension(filePath: string): string;
}
