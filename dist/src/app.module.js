"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const admins_module_1 = require("./admins/admins.module");
const packages_module_1 = require("./packages/packages.module");
const hotels_module_1 = require("./hotels/hotels.module");
const bookings_module_1 = require("./bookings/bookings.module");
const passports_module_1 = require("./passports/passports.module");
const embassy_module_1 = require("./embassy/embassy.module");
const reviews_module_1 = require("./reviews/reviews.module");
const upload_module_1 = require("./upload/upload.module");
const ai_module_1 = require("./ai/ai.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            admins_module_1.AdminsModule,
            packages_module_1.PackagesModule,
            hotels_module_1.HotelsModule,
            bookings_module_1.BookingsModule,
            passports_module_1.PassportsModule,
            embassy_module_1.EmbassyModule,
            reviews_module_1.ReviewsModule,
            upload_module_1.UploadModule,
            ai_module_1.AiModule,
        ],
        providers: [{ provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map