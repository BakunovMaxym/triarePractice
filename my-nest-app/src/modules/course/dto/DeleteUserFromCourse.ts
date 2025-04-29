import { UUIDFieldOptional } from "../../../decorators/field.decorators";

export class DeleteUserFromCourse {
    @UUIDFieldOptional()
    userId!: Uuid;
  }
  