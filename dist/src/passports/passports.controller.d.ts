import { PassportsService } from './passports.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { VerifyPassportDto } from './dto/verify-passport.dto';
import { ImageType } from '../common/enums';
export declare class PassportsController {
    private passportsService;
    constructor(passportsService: PassportsService);
    create(user: any, dto: CreatePassportDto): Promise<any>;
    findAll(): Promise<any>;
    findPending(): Promise<any>;
    findByBooking(bookingId: number): Promise<any>;
    findOne(id: number): Promise<any>;
    uploadImage(id: number, file: any, imageType: ImageType | undefined, user: any): Promise<{
        image: any;
        passport: any;
        message: string;
    }>;
    verify(id: number, dto: VerifyPassportDto): Promise<any>;
    sendToEmbassy(id: number): Promise<any>;
}
