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
exports.FamilyProofController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const family_proof_service_1 = require("./family-proof.service");
const create_family_proof_dto_1 = require("./dto/create-family-proof.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const enums_1 = require("../common/enums");
const multer_config_1 = require("../upload/multer.config");
let FamilyProofController = class FamilyProofController {
    familyProofService;
    constructor(familyProofService) {
        this.familyProofService = familyProofService;
    }
    upload(user, file, dto) {
        return this.familyProofService.upload(Number(user.user_id), file, dto);
    }
    findByBooking(bookingId) {
        return this.familyProofService.findByBooking(bookingId);
    }
    verify(id, status) {
        return this.familyProofService.verify(id, status);
    }
    link(id, participantId) {
        return this.familyProofService.linkToParticipant(id, participantId);
    }
};
exports.FamilyProofController = FamilyProofController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('user'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document', multer_config_1.documentUploadOptions)),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_family_proof_dto_1.CreateFamilyProofDto]),
    __metadata("design:returntype", void 0)
], FamilyProofController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FamilyProofController.prototype, "findByBooking", null);
__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], FamilyProofController.prototype, "verify", null);
__decorate([
    (0, common_1.Patch)(':id/link/:participantId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('participantId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], FamilyProofController.prototype, "link", null);
exports.FamilyProofController = FamilyProofController = __decorate([
    (0, common_1.Controller)('family-proof'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [family_proof_service_1.FamilyProofService])
], FamilyProofController);
//# sourceMappingURL=family-proof.controller.js.map