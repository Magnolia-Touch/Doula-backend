// import { Controller, Post, Get, Patch, Delete, Body, Param, Query } from '@nestjs/common';
// import { NotesService } from './notes.service';
// import { CreateNoteDto } from './dto/create-notes.dto';
// import { UpdateNoteDto } from './dto/update-notes.dto';
// import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

// @Controller({
//     path: 'notes',
//     version: '1',
// })
// export class NotesController {
//     constructor(private readonly notesService: NotesService) { }

//     // ✅ POST /notes
//     @Post()
//     create(@Body() dto: CreateNoteDto) {
//         return this.notesService.create(dto);
//     }

//     // ✅ GET /notes?page=1&limit=10
//     @Get()
//     findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
//         return this.notesService.findAll(Number(page), Number(limit));
//     }

//     // ✅ GET /notes/:id
//     @Get(':id')
//     findById(@Param('id') id: string) {
//         return this.notesService.findById(id);
//     }

//     // ✅ PATCH /notes/:id
//     @Patch(':id')
//     update(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
//         return this.notesService.update(id, dto);
//     }

//     // ✅ DELETE /notes/:id
//     @Delete(':id')
//     remove(@Param('id') id: string) {
//         return this.notesService.remove(id);
//     }
// }
