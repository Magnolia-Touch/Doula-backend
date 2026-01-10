import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateContactFormDto {
  @ApiProperty({
    description: 'Name of the person submitting the contact form',
    example: 'Rahul Verma',
  })
  @IsString()
  @IsNotEmpty()
  Name: string;

  @ApiProperty({
    description: 'Email address of the sender',
    example: 'rahul.verma@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Message submitted via the contact form',
    example: 'I would like to know more about your services.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
