"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassportsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const passports_service_1 = require("./passports.service");
const create_passport_dto_1 = require("./dto/create-passport.dto");
const verify_passport_dto_1 = require("./dto/verify-passport.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const enums_1 = require("../common/enums");
const multer_config_1 = require("../upload/multer.config");
let PassportsController = class PassportsController {
    passportsService;
    constructor(passportsService) {
        this.passportsService = passportsService;
    }
    create(user, dto) {
        return this.passportsService.create(Number(user.user_id), dto);
    }
    findAll() { return this.passportsService.findAll(); }
    findPending() { return this.passportsService.findPendingVerification(); }
    findByBooking(bookingId) {
        return this.passportsService.findByBooking(bookingId);
    }
    findOne(id) {
        return this.passportsService.findOne(id);
    }
    uploadImage(id, file, imageType = enums_1.ImageType.FRONT, user) {
        const isAdmin = user.role === 'admin';
        const userId = isAdmin ? user.admin_id : user.user_id;
        return this.passportsService.uploadImage(id, Number(userId), file, imageType, isAdmin);
    }
    verify(id, dto) {
        return this.passportsService.verifyPassport(id, dto);
    }
    sendToEmbassy(id) {
        return this.passportsService.markSentToEmbassy(id);
    }
};
exports.PassportsController = PassportsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('user'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_passport_dto_1.CreatePassportDto]),
    __metadata("design:returntype", void 0)
], PassportsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PassportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PassportsController.prototype, "findPending", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PassportsController.prototype, "findByBooking", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PassportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multer_config_1.imageUploadOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String, Object]),
    __metadata("design:returntype", void 0)
], PassportsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, verify_passport_dto_1.VerifyPassportDto]),
    __metadata("design:returntype", void 0)
], PassportsController.prototype, "verify", null);
__decorate([
    (0, common_1.Patch)(':id/send-to-embassy'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PassportsController.prototype, "sendToEmbassy", null);
exports.PassportsController = PassportsController = __decorate([
    (0, common_1.Controller)('passports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [passports_service_1.PassportsService])
], PassportsController);
//# sourceMappingURL=passports.controller.js.map