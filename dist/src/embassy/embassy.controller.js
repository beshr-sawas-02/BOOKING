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
exports.EmbassyController = void 0;
const common_1 = require("@nestjs/common");
const embassy_service_1 = require("./embassy.service");
const update_embassy_result_dto_1 = require("./dto/update-embassy-result.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enums_1 = require("../common/enums");
let EmbassyController = class EmbassyController {
    embassyService;
    constructor(embassyService) {
        this.embassyService = embassyService;
    }
    getStats() { return this.embassyService.getStats(); }
    findAll(status) { return this.embassyService.findAll(status); }
    findByBooking(bookingId) {
        return this.embassyService.findByBooking(bookingId);
    }
    submitToEmbassy(bookingId) {
        return this.embassyService.submitBookingToEmbassy(bookingId);
    }
    updateResult(resultId, dto) {
        return this.embassyService.updateResult(resultId, dto);
    }
};
exports.EmbassyController = EmbassyController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmbassyController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmbassyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmbassyController.prototype, "findByBooking", null);
__decorate([
    (0, common_1.Post)('submit/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmbassyController.prototype, "submitToEmbassy", null);
__decorate([
    (0, common_1.Patch)('results/:resultId'),
    __param(0, (0, common_1.Param)('resultId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_embassy_result_dto_1.UpdateEmbassyResultDto]),
    __metadata("design:returntype", void 0)
], EmbassyController.prototype, "updateResult", null);
exports.EmbassyController = EmbassyController = __decorate([
    (0, common_1.Controller)('embassy'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [embassy_service_1.EmbassyService])
], EmbassyController);
//# sourceMappingURL=embassy.controller.js.map