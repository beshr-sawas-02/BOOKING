import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { CreateFamilyProofDto } from './dto/create-family-proof.dto';
import { VerificationStatus } from '../common/enums';
import { MulterFile } from '../common/types/multer.type';

@Injectable()
export class FamilyProofService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  private db(): any {
    return this.prisma as any;
  }

  async upload(userId: number, file: MulterFile, dto: CreateFamilyProofDto) {
    const booking = await this.db().booking.findUnique({
      where: { booking_id: BigInt(dto.booking_id) },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user_id.toString() !== userId.toString())
      throw new ForbiddenException('Access denied');

    // 1. ارفع الوثيقة على Cloudinary
    const url = await this.cloudinary.uploadFile(file, 'family-proof');

    // 2. احفظ في قاعدة البيانات
    const doc = await this.db().familyProofDocument.create({
      data: {
        uploaded_by: BigInt(userId),
        booking_id: BigInt(dto.booking_id),
        document_url: url,
        document_type: dto.document_type,
        father_name: dto.father_name,
        mother_name: dto.mother_name,
      },
    });

    return { ...doc, message: 'تم رفع الوثيقة بنجاح، بانتظار مراجعة الأدمن' };
  }

  async findByBooking(bookingId: number) {
    return this.db().familyProofDocument.findMany({
      where: { booking_id: BigInt(bookingId) },
      include: { uploader: { select: { full_name: true, email: true } } },
    });
  }

  async verify(documentId: number, status: VerificationStatus) {
    const doc = await this.db().familyProofDocument.findUnique({
      where: { document_id: BigInt(documentId) },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return this.db().familyProofDocument.update({
      where: { document_id: BigInt(documentId) },
      data: { verification_status: status },
    });
  }

  async linkToParticipant(documentId: number, participantId: number) {
    return this.db().bookingParticipant.update({
      where: { participant_id: BigInt(participantId) },
      data: { family_proof_id: BigInt(documentId) },
    });
  }
}
