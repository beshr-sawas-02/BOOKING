import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<any>;
    updateProfile(user: any, dto: UpdateUserDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
}
