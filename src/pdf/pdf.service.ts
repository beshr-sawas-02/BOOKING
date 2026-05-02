import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);
  private browser: puppeteer.Browser | null = null;

  /**
   * يحتفظ بنسخة واحدة من المتصفح للأداء الأفضل
   */
  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.logger.log('Launching new puppeteer browser...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });
    }
    return this.browser;
  }

  /**
   * توليد PDF من HTML
   * @param html محتوى HTML كنص
   * @returns Buffer للـ PDF
   */
  async generateFromHtml(html: string): Promise<Buffer> {
    const start = Date.now();
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm',
        },
      });

      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      this.logger.log(`PDF generated in ${elapsed}s`);

      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  /**
   * تنظيف المتصفح عند إيقاف التطبيق
   */
  async onModuleDestroy() {
    if (this.browser) {
      this.logger.log('Closing puppeteer browser...');
      await this.browser.close();
    }
  }
}