import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
export declare class PackagesController {
    private packagesService;
    constructor(packagesService: PackagesService);
    findAll(type?: string): Promise<any>;
    findOne(id: number): Promise<any>;
    create(dto: CreatePackageDto): Promise<any>;
    update(id: number, dto: UpdatePackageDto): Promise<any>;
    remove(id: number): Promise<any>;
    addHotel(id: number, hotelId: number): Promise<any>;
    removeHotel(id: number, hotelId: number): Promise<any>;
}
