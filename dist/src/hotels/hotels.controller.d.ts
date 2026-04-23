import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
export declare class HotelsController {
    private hotelsService;
    constructor(hotelsService: HotelsService);
    findAll(location?: string): Promise<any>;
    findOne(id: number): Promise<any>;
    create(dto: CreateHotelDto): Promise<any>;
    update(id: number, dto: UpdateHotelDto): Promise<any>;
    remove(id: number): Promise<any>;
    uploadImage(id: number, file: any, order?: string): Promise<any>;
    deleteImage(imageId: number): Promise<any>;
}
