import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, Role, StatusRack } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async generateRackCode() {
    const racks = await this.prisma.rack.findMany({
      select: {
        kode_rack: true,
      },
      orderBy: {
        kode_rack: 'asc',
      },
    });

    const usedNumbers = racks
      .map((rack) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const match = rack.kode_rack.match(/\d+/);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        return match ? parseInt(match[0], 10) : null;
      })
      .filter((n): n is number => n !== null)
      .sort((a, b) => a - b);

    let nextNumber = 1;

    for (const num of usedNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }

    return `RACK-${nextNumber.toString().padStart(3, '0')}`;
  }

  async registerUser(dto: RegisterUserDto) {
    const exist = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (exist) {
      throw new BadRequestException('Email sudah digunakan');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashedPassword,

        role: dto.role === 'super admin' ? Role.admin_rack : Role.user,
      },
    });

    return this.generateToken(user);
  }

  async registerAdmin(dto: RegisterAdminDto) {
    const exist = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (exist) {
      throw new BadRequestException('Email sudah digunakan');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const kode_rack = await this.generateRackCode();

    await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashedPassword,

        role: Role.admin_rack,

        racks: {
          create: {
            kode_rack,
            divisi: dto.divisi,
            status: StatusRack.pending,
          },
        },
      },
    });

    return {
      message: 'Pendaftaran berhasil, tunggu persetujuan super admin',
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.trim(),
      },

      include: {
        racks: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isMatch = await bcrypt.compare(password.trim(), user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Password salah');
    }

    if (user.role === Role.admin_rack) {
      const hasActiveRack = user.racks.some(
        (rack) => rack.status === StatusRack.active,
      );

      if (!hasActiveRack) {
        throw new UnauthorizedException(
          'Rack belum disetujui oleh super admin',
        );
      }
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    return {
      message: 'Berhasil',

      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
