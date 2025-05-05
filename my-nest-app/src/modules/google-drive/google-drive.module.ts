import { Module } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';

@Module({
    providers: [GoogleDriveService],
    exports: [GoogleDriveService], // So other modules/services can use it
})
export class GoogleDriveModule { }
