import { Module } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ZoneManagerModule } from 'src/zone_manager/zone_manager.module';
import { ClientModule } from 'src/client/client.module';
import { DoulaModule } from 'src/doula/doula.module';
import { ZoneManagerService } from 'src/zone_manager/zone_manager.service';
import { DoulaService } from 'src/doula/doula.service';
import { ClientsService } from 'src/client/client.service';
import { AdminModule } from 'src/admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';

@Module({
    imports: [
        PrismaModule, AdminModule, ZoneManagerModule, ClientModule, DoulaModule,
        ConfigModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'super-secret-key',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    providers: [AuthService, PrismaService, ZoneManagerService, DoulaService, ClientsService, AdminService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
