import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({
    summary: 'API Health Check',
    description: 'Simple health check endpoint to verify the API is running.',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      example: 'Welcome to Doulas API!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
