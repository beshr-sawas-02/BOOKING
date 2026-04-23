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
  private readonly pythonServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';

  // ─────────────────────────────────────────────────────────
  // Passport extraction — يستدعي Python OCR service
  // ─────────────────────────────────────────────────────────
  async extractPassportDataFromBuffer(buffer: Buffer, mimetype: string): Promise<PassportExtraction> {
    // غير مستخدمة — OCR يعمل من URL
    return { confidence: 0 };
  }

  async extractPassportData(imageUrl: string): Promise<PassportExtraction> {
    try {
      this.logger.log(`Calling Python AI service for: ${imageUrl}`);
      const result = await this.callPythonService('/extract-passport', { image_url: imageUrl });

      if (!result || result.confidence === 0) {
        this.logger.warn('Python service returned confidence 0');
        return { confidence: 0 };
      }

      this.logger.log(`AI extracted with confidence: ${result.confidence}`);
      return result as PassportExtraction;

    } catch (error: unknown) {
      this.logger.error('Python AI service error:', (error as Error).message);
      // لا mock — نرجع confidence 0 فقط
      return { confidence: 0 };
    }
  }

  // ─────────────────────────────────────────────────────────
  // Document extraction
  // ─────────────────────────────────────────────────────────
  async extractFamilyDocument(imageUrl: string): Promise<DocumentExtraction> {
    try {
      const result = await this.callPythonService('/extract-document', { image_url: imageUrl });
      if (!result || result.confidence === 0) return { confidence: 0 };
      return result as DocumentExtraction;
    } catch (error: unknown) {
      this.logger.error('Document extraction error:', (error as Error).message);
      return { confidence: 0 };
    }
  }

  // ─────────────────────────────────────────────────────────
  // HTTP call للـ Python service
  // ─────────────────────────────────────────────────────────
  private callPythonService(endpoint: string, body: object): Promise<any> {
    return new Promise((resolve, reject) => {
      const bodyStr = JSON.stringify(body);
      const urlObj = new URL(this.pythonServiceUrl + endpoint);
      const isHttps = urlObj.protocol === 'https:';
      const lib = isHttps ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      };

      const req = lib.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString()));
          } catch (e: unknown) {
            reject(new Error('Invalid JSON from Python service'));
          }
        });
      });

      req.on('error', (err: Error) => reject(err));
      req.setTimeout(120000, () => {
        req.destroy();
        reject(new Error('Python service timeout'));
      });
      req.write(bodyStr);
      req.end();
    });
  }
}