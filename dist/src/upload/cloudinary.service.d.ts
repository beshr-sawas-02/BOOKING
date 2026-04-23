import { MulterFile } from '../common/types/multer.type';
export declare class CloudinaryService {
    uploadFile(file: MulterFile, folder: string): Promise<string>;
    deleteFile(publicId: string): Promise<void>;
}
