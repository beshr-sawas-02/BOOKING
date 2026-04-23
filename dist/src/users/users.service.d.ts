import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    private db;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateUserDto): Promise<any>;
    getProfile(userId: number): Promise<any>;
}
