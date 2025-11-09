import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

interface MailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    context?: Record<string, any>;
    template?: string;
}

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly resend: Resend;
    private readonly defaultFrom: string;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.defaultFrom =
            process.env.EMAIL_FROM || 'Learning Management System <noreply@resend.dev>';
    }

    async sendMail(options: MailOptions): Promise<void> {
        try {
            const toArray = Array.isArray(options.to) ? options.to : [options.to];

            const { data, error } = await this.resend.emails.send({
                from: options.from || this.defaultFrom,
                to: toArray,
                subject: options.subject,
                html: options.html || this.renderTemplate(options.template, options.context),
                text: options.text,
            });

            if (error) {
                this.logger.error(`❌ Email failed: ${error.message}`);
                throw new Error(error.message);
            }

            this.logger.log(`✅ Email sent to ${toArray.join(', ')} (id: ${data?.id})`);
        } catch (err: any) {
            this.logger.error(`❌ Email send error: ${err.message}`);
            throw err;
        }
    }

    private renderTemplate(template?: string, context?: Record<string, any>): string {
        if (!template) return '';
        if (!context) return `<p>${template}</p>`;

        let html = template;
        for (const [key, value] of Object.entries(context)) {
            html = html.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
        }
        return html;
    }
}
