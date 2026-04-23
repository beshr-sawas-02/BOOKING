export declare const imageUploadOptions: {
    storage: import("multer").StorageEngine;
    limits: {
        fileSize: number;
    };
    fileFilter: (_req: any, file: any, cb: any) => any;
};
export declare const documentUploadOptions: {
    storage: import("multer").StorageEngine;
    limits: {
        fileSize: number;
    };
    fileFilter: (_req: any, file: any, cb: any) => any;
};
