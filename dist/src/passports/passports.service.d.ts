import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { AiService } from '../ai/ai.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { VerifyPassportDto } from './dto/verify-passport.dto';
import { ImageType } from '../common/enums';
import { MulterFile } from '../common/types/multer.type';
export declare class PassportsService {
    private prisma;
    private cloudinary;
    private aiService;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService, aiService: AiService);
    private db;
    create(userId: number, dto: CreatePassportDto): Promise<any>;
    findByBooking(bookingId: number): Promise<any>;
    findAll(): Promise<any>;
    findPendingVerification(): Promise<any>;
    findOne(id: number): Promise<any>;
    uploadImage(passportId: number, userId: number, file: MulterFile, imageType: ImageType, isAdmin: boolean): Promise<{
        image: any;
        passport: any;
        message: string;
    }>;
    private runAiExtraction;
    verifyPassport(id: number, dto: VerifyPassportDto): Promise<any>;
    markSentToEmbassy(id: number): Promise<any>;
    saveAiExtraction(id: number, extractedData: Partial<CreatePassportDto>, confidence: number): Promise<any>;
    private runAiExtractionFromBuffer;
}
