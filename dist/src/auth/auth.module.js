"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("../admin/admin.service");
const prisma_module_1 = require("../prisma/prisma.module");
const zone_manager_module_1 = require("../zone_manager/zone_manager.module");
const client_module_1 = require("../client/client.module");
const doula_module_1 = require("../doula/doula.module");
const zone_manager_service_1 = require("../zone_manager/zone_manager.service");
const doula_service_1 = require("../doula/doula.service");
const client_service_1 = require("../client/client.service");
const admin_module_1 = require("../admin/admin.module");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const jwt_strategy_1 = require("../common/strategies/jwt.strategy");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule, admin_module_1.AdminModule, zone_manager_module_1.ZoneManagerModule, client_module_1.ClientModule, doula_module_1.DoulaModule,
            config_1.ConfigModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'super-secret-key',
                signOptions: { expiresIn: '7d' },
            }),
        ],
        providers: [auth_service_1.AuthService, prisma_service_1.PrismaService, zone_manager_service_1.ZoneManagerService, doula_service_1.DoulaService, client_service_1.ClientsService, admin_service_1.AdminService, jwt_strategy_1.JwtStrategy],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map