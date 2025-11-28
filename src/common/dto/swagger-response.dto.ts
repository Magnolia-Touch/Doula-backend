// src/common/dto/swagger-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SwaggerResponseDto {
    @ApiProperty({ example: 'success' })
    status: string;

    @ApiProperty({
        description: 'Actual payload (varies by endpoint)',
        type: Object, // ⬅ Fix here
    })
    data: any;

    @ApiProperty({ example: 'Request successful' })
    message: string;
}
