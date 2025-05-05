import { Injectable } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { client_email, private_key } from '../../../apikeys.json';
import type { MimeTypes } from 'constants/GoogleMimes';

// const apikeys = {
//     "type": "service_account",
//     "project_id": "lms-458907",
//     "private_key_id": "c43243d606fe90851de6044d28b9c120ddcda401",
//     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDtSOvg4XrrNboI\nqurF/k1LulP5ECzEmCgey1rMqs3G70b8NAZ6xChxs4qnhLuGc6Qyv0lh0vUBs2I3\nbc/DheHl26uXANNE3mNvSX1/hNgQYtwDDc0tC40oIS9q6kjBSGryJ2gFKgKLbenU\nTGxgcrgQT8V/hct7t+1sTq8YeVuPG9bCfIp/fsV4sLanyHGSu1h7Y06Z+5lTs4gY\npwnouOG7XgzEOmIZXNoL3tVSkRtbkYprJkwivj+QD38E7Gf7mAnplAYpeaw037Mh\nCGRb/zeTDsww1UxTb5snAeWtaoHADMdrtIRIUyTYCcKwcUnCzel8cZ520oQZSkCz\nc+xW8eb5AgMBAAECggEAHtwbAUuR5uvn3p9hRTrGPBERlr90cw+u4sJjyWEgE2f5\n0sHEDfdbozNMgcOQzUhWPzCtjzFrzTrSjTmU3xhBwYPePxdLuBXhgg8ME/znn3Sb\n/zGuUNYYbPL+mGhmlJdMgWMqnhv76hJIv47o5r+aEf+t7zXWuae5aG/wnxLkG3+t\nQ7j2IdYneitKHvh5b4KX02LsMo858uu0a6uxXtuExHXsc8pg+41buJlwtFSLGlr0\n5dJJeBy89kFibo2A4Bo5qQShr6Z0BS0WEfqx6xWguZGnIib8IWPRxAX7g3aAyzZg\n/Zxuphb3vYYmW5x4etvPW5WuJU03r6/mTD541KoLeQKBgQD5YQ/zHMmNo5fu2ZpN\nzUw9LXSL6u8XjMF11VMAP+PMzbI4LfJt1Mk0Pm4byxQLGQmxmJxgl0Nbs4i5rSsj\niZFHKeEV0wZLNSSvG5tKHFDnVgw3GDG3Gl144QZtVDtepwp5KHDf/i0D+xOHHlIN\nBkQGe/x2Vk81fQigy/PLS2QCtwKBgQDzlaibJWMuu2dYBs8JPZgN+CtxrzTRpXTs\nqFz/OxO59mF0tAfvmr9cVnIv9HVzm/5jZsbkkI9NQVBtM43xwqXasxhvx1Gb9Yuf\nbm0gKYxwgA6s7hXojKFY1496OirTCEtTP7emYF3RmHHhko7D5R4S6oVS4z1+4TrG\n7PvcoYDzzwKBgE8nsepW3trobFdSFppPab2Zaf7naVCuStHeDmRr4yCkwcb3PpYC\nDoNYtZZ41TnYjq0iZbB7EtROnj1ha+nxxn0yG9HTk5HXonc6agYSCtQDCgmK0mzu\nH3E469NUAyw+FSLz5TAT+7HhxgcDZsPfk0QDotTk/Gtb7psrYYzLt0jtAoGAbX3h\nW1P0AGam7o+o8ttoBSd/x8tc77vzEgogO24/0MCqT/447wBdclE9ZMb7IKuHLwFc\n+BLvB2gLkfqxnHHFgcgtfNlYmsVGLLVDgkiK42r8rckbufu07y1+Rg/tfgzlZxdm\nIviAU5212xK479+GpDQdGAQjeWwespqGIEfMoksCgYBh4WtDr7M809F1p3rfgujF\n28cIvEErJ9c3+Vsr8YKhwiogPmKbcXaAwgKAr++A0CXB/VlWegrtly/AKkZKuBkn\nS+3k1W7qoCKSgPy3v2dTRaeJe1wyNvUJ/3wojo9/qe9Wn5gg1/KYnj8zr+MMnCwl\nWvhk1kfEvzhQ+NNp70zOIA==\n-----END PRIVATE KEY-----\n",
//     "client_email": "lms-95@lms-458907.iam.gserviceaccount.com",
//     "client_id": "116231152012285455111",
//     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//     "token_uri": "https://oauth2.googleapis.com/token",
//     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/lms-95%40lms-458907.iam.gserviceaccount.com",
//     "universe_domain": "googleapis.com"
// }

@Injectable()
export class GoogleDriveService {
    private readonly SCOPE = ['https://www.googleapis.com/auth/drive'];
    private async authorize() {
        console.log(process.env.GOOGLE_DRIVE_CLIENT_EMAIL)
        console.log(process.env.GOOGLE_DRIVE_PRIVATE_KEY)
        const jwtClient = new google.auth.JWT(
            process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            undefined,
            process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            this.SCOPE
        );


        await jwtClient.authorize();
        return jwtClient;
    }

    async uploadFile(file: NodeJS.ReadableStream, fileName: string, folderId: string, mimeType: string): Promise<drive_v3.Schema$File> {
        // const mimeType = fileName.replace('.', '').toUpperCase() as keyof typeof MimeTypes;
        const authClient = await this.authorize();
        const drive = google.drive({ version: 'v3', auth: authClient });

        const fileMetadata = {
            name: fileName,
            parents: [folderId],
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

        return response.data;
    }
}
