import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';
import * as http from 'http';

export interface PassportExtraction {
  full_name_en?: string;
  full_name_ar?: string;
  passport_number?: string;
  nationality?: string;
  gender?: string;
  date_of_birth?: string;
  issue_date?: string;
  expiry_date?: string;
  confidence: number;
  needs_review?: boolean;
}

export interface DocumentExtraction {
  father_name?: string;
  mother_name?: string;
  family_members?: string[];
  confidence: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly pythonServiceUrl =
    process.env.AI_SERVICE_URL || 'http://localhost:5000';
  private readonly apiKey = process.env.OCR_API_KEY || '';
  private readonly timeoutMs = 180000; // دقيقة واحدة

  /**
   * استخراج بيانات جواز السفر من URL للصورة
   * @param imageUrl رابط الصورة (Cloudinary, S3, إلخ)
   * @returns البيانات المستخرجة مع درجة ثقة (0-1)
   * @throws يُرجع { confidence: 0 } عند أي فشل بدلاً من رمي خطأ
   */
  async extractPassportData(imageUrl: string): Promise<PassportExtraction> {
    try {
      this.logger.log(`Calling Python AI service for: ${imageUrl}`);
      const result = await this.callPythonService<PassportExtraction>(
        '/extract-passport',
        { image_url: imageUrl },
      );

      if (!result || result.confidence === 0) {
        this.logger.warn('Python service returned confidence 0');
        return { confidence: 0 };
      }

      this.logger.log(`AI extracted with confidence: ${result.confidence}`);
      return result;
    } catch (error: unknown) {
      this.logger.error('Python AI service error:', (error as Error).message);
      return { confidence: 0 };
    }
  }

  /**
   * استخراج بيانات من وثيقة عائلية (اسم الأب، الأم، إلخ)
   * @param imageUrl رابط الصورة
   * @returns البيانات المستخرجة مع درجة ثقة
   */
  async extractFamilyDocument(imageUrl: string): Promise<DocumentExtraction> {
    try {
      const result = await this.callPythonService<DocumentExtraction>(
        '/extract-document',
        { image_url: imageUrl },
      );
      if (!result || result.confidence === 0) return { confidence: 0 };
      return result;
    } catch (error: unknown) {
      this.logger.error('Document extraction error:', (error as Error).message);
      return { confidence: 0 };
    }
  }

  /**
   * استدعاء HTTP للـ Python OCR service
   * @param endpoint المسار (مثل '/extract-passport')
   * @param body محتوى الطلب كـ JSON
   * @returns استجابة الخدمة بالنوع المحدد
   * @throws Error إذا فشل الاتصال أو timeout
   * @throws Error إذا كانت الاستجابة JSON غير صحيح
   */
  private callPythonService<T>(endpoint: string, body: object): Promise<T> {
    return new Promise((resolve, reject) => {
      const bodyStr = JSON.stringify(body);
      const urlObj = new URL(this.pythonServiceUrl + endpoint);
      const isHttps = urlObj.protocol === 'https:';
      const lib = isHttps ? https : http;

      // إعداد headers مع API key إذا كان متوفر
      const headers: Record<string, string | number> = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      };
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname,
        method: 'POST',
        headers,
      };

      const req = lib.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(Buffer.concat(chunks).toString()) as T;
            resolve(parsed);
          } catch {
            reject(new Error('Invalid JSON from Python service'));
          }
        });
      });

      req.on('error', (err: Error) => reject(err));
      req.setTimeout(this.timeoutMs, () => {
        req.destroy();
        reject(new Error(`Python service timeout after ${this.timeoutMs}ms`));
      });
      req.write(bodyStr);
      req.end();
    });
  }
}