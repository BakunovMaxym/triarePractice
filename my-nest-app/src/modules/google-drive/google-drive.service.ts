import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { CreateTaskFileDto } from '../../modules/task-file/dto/create-task-file.dto';

@Injectable()
export class GoogleDriveService {
    private readonly SCOPE = ['https://www.googleapis.com/auth/drive'];
    private async authorize() {
        const jwtClient = new google.auth.JWT(
            process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            undefined,
            process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            this.SCOPE
        );


        await jwtClient.authorize();
        return jwtClient;
    }

    async uploadFile(
        file: NodeJS.ReadableStream,
        fileName: string,
        // folderId: string,
        mimeType: string
    ): Promise<{ fileId: string; fileName: string; fileUrl: string }> {
        const authClient = await this.authorize();
        const drive = google.drive({ version: 'v3', auth: authClient });

        const fileMetadata = {
            name: fileName,
            parents: ["1U3U7U3fSJte9l_iTmVmSfdHVHtB8BeBe"],
        };

        const media = {
            mimeType,
            body: file,
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media,
            fields: 'id, name, mimeType',
        });

        const fileId = response.data.id!;
        await this.makeFilePublic(fileId);

        const fileDto = new CreateTaskFileDto({
            fileId: fileId,
            fileName: response.data.name!,
            fileUrl: this.getPublicUrl(fileId),
        });

        return fileDto;
    }


    async makeFilePublic(fileId: string): Promise<void> {
        const authClient = await this.authorize();
        const drive = google.drive({ version: 'v3', auth: authClient });

        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
    }

    getPublicUrl(fileId: string): string {
        return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    }

    async deleteFile(fileId: string) {
        const authClient = await this.authorize();
        const drive = google.drive({ version: 'v3', auth: authClient });


        const responce = await drive.files.delete({
            fileId: fileId,
            supportsAllDrives: true
        })

        return responce
    }

}
