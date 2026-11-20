import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RbacGuard } from '../guards/rbac.guard';
import { DataStoreService } from '../services/data-store.service';

@Controller('campus')
@UseGuards(RbacGuard)
export class CampusController {
  constructor(private readonly dataStore: DataStoreService) {}

  /**
   * Sección 9.2: Panel Mi IINICIA adaptado al rol autenticado.
   */
  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.dataStore.getPersonalizedDashboard(req.userContext);
  }

  /**
   * Sección 11: Genera acceso seguro SSO al Campus Moodle para un curso autorizado.
   */
  @Post('launch/:courseMappingId')
  launchCourse(
    @Req() req: any,
    @Param('courseMappingId') courseMappingId: string,
  ) {
    return this.dataStore.generateCourseLaunchForUser(
      req.userContext,
      courseMappingId,
    );
  }

  /**
   * Consulta el libro de calificaciones de un curso en Moodle según el rol (Profesor vs Estudiante).
   */
  @Get('grades')
  getGrades(@Req() req: any, @Query('courseId') courseId?: string) {
    return this.dataStore.getCourseGradesForUser(
      req.userContext,
      Number(courseId || 101),
    );
  }

  /**
   * Permite al Profesor (Teacher) calificar y retroalimentar a un alumno en Moodle (CA-13).
   */
  @Post('grades')
  saveGrade(@Req() req: any, @Body() body: any) {
    return this.dataStore.updateStudentGradeByTeacher(req.userContext, body);
  }
}
