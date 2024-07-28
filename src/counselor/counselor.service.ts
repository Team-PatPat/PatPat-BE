import { Injectable } from '@nestjs/common';
import { Counselor } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';

/**
 * @author oognuyh
 */
@Injectable()
export class CounselorService {
  constructor(private readonly prismaService: PrismaService) {}
  /**
   * Finds counselors.
   *
   * @returns Counselors
   */
  async findCounselors(): Promise<Counselor[]> {
    return this.prismaService.counselor.findMany({
      orderBy: {
        order: 'asc',
      },
    });
  }

  /**
   * Finds a counselor by the given identifier.
   *
   * @param counselorId A counselor identifier to find.
   * @returns A counselor or null.
   */
  findCounselorByCounselorId(counselorId: string): Promise<Counselor> {
    return this.prismaService.counselor.findUnique({
      where: {
        id: counselorId,
      },
    });
  }
}
