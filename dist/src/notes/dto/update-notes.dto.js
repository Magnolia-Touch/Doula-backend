"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNoteDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_notes_dto_1 = require("./create-notes.dto");
class UpdateNoteDto extends (0, mapped_types_1.PartialType)(create_notes_dto_1.CreateNoteDto) {
}
exports.UpdateNoteDto = UpdateNoteDto;
//# sourceMappingURL=update-notes.dto.js.map