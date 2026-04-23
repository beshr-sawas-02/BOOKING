"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassportsModule = void 0;
const common_1 = require("@nestjs/common");
const passports_service_1 = require("./passports.service");
const passports_controller_1 = require("./passports.controller");
const upload_module_1 = require("../upload/upload.module");
const ai_module_1 = require("../ai/ai.module");
let PassportsModule = class PassportsModule {
};
exports.PassportsModule = PassportsModule;
exports.PassportsModule = PassportsModule = __decorate([
    (0, common_1.Module)({
        imports: [upload_module_1.UploadModule, ai_module_1.AiModule],
        controllers: [passports_controller_1.PassportsController],
        providers: [passports_service_1.PassportsService],
        exports: [passports_service_1.PassportsService],
    })
], PassportsModule);
//# sourceMappingURL=passports.module.js.map