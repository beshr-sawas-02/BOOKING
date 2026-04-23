import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { CreateFamilyProofDto } from './dto/create-family-proof.dto';
import { VerificationStatus } from '../common/enums';
import { MulterFile } from '../common/types/multer.type';
export declare class FamilyProofService {
    private prisma;
    private cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    private db;
    upload(userId: number, file: MulterFile, dto: CreateFamilyProofDto): Promise<any>;
    findByBooking(bookingId: number): Promise<any>;
    verify(documentId: number, status: VerificationStatus): Promise<any>;
    linkToParticipant(documentId: number, participantId: number): Promise<any>;
}
