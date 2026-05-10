import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, Role, StatusRack, Divisi } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ✅ Fix: filter per divisi supaya tiap divisi mulai dari RACK-001 sendiri
  private async generateRackCode(divisi: Divisi): Promise<string> {
    const racks = await this.prisma.rack.findMany({
      where: { divisi },
      select: { kode_rack: true },
    });

    const usedNumbers = new Set<number>();

    for (const rack of racks) {
      const match = rack.kode_rack.match(/(\d+)$/);
      if (match) {
        usedNumbers.add(parseInt(match[0], 10));
      }
    }

    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) {
      nextNumber++;
    }

    return `RACK-${String(nextNumber).padStart(3, '0')}`;
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

    // ✅ Fix: pass dto.divisi ke generateRackCode
    const kode_rack = await this.generateRackCode(dto.divisi);

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
