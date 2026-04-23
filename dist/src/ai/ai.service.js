"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const https = __importStar(require("https"));
const http = __importStar(require("http"));
let AiService = AiService_1 = class AiService {
    logger = new common_1.Logger(AiService_1.name);
    pythonServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
    async extractPassportDataFromBuffer(buffer, mimetype) {
        return { confidence: 0 };
    }
    async extractPassportData(imageUrl) {
        try {
            this.logger.log(`Calling Python AI service for: ${imageUrl}`);
            const result = await this.callPythonService('/extract-passport', { image_url: imageUrl });
            if (!result || result.confidence === 0) {
                this.logger.warn('Python service returned confidence 0');
                return { confidence: 0 };
            }
            this.logger.log(`AI extracted with confidence: ${result.confidence}`);
            return result;
        }
        catch (error) {
            this.logger.error('Python AI service error:', error.message);
            return { confidence: 0 };
        }
    }
    async extractFamilyDocument(imageUrl) {
        try {
            const result = await this.callPythonService('/extract-document', { image_url: imageUrl });
            if (!result || result.confidence === 0)
                return { confidence: 0 };
            return result;
        }
        catch (error) {
            this.logger.error('Document extraction error:', error.message);
            return { confidence: 0 };
        }
    }
    callPythonService(endpoint, body) {
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
                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(Buffer.concat(chunks).toString()));
                    }
                    catch (e) {
                        reject(new Error('Invalid JSON from Python service'));
                    }
                });
            });
            req.on('error', (err) => reject(err));
            req.setTimeout(120000, () => {
                req.destroy();
                reject(new Error('Python service timeout'));
            });
            req.write(bodyStr);
            req.end();
        });
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map