import { FamilyProofService } from './family-proof.service';
import { CreateFamilyProofDto } from './dto/create-family-proof.dto';
import { VerificationStatus } from '../common/enums';
export declare class FamilyProofController {
    private familyProofService;
    constructor(familyProofService: FamilyProofService);
    upload(user: any, file: any, dto: CreateFamilyProofDto): Promise<any>;
    findByBooking(bookingId: number): Promise<any>;
    verify(id: number, status: VerificationStatus): Promise<any>;
    link(id: number, participantId: number): Promise<any>;
}
