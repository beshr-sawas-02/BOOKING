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
export declare class AiService {
    private readonly logger;
    private readonly pythonServiceUrl;
    private readonly apiKey;
    private readonly timeoutMs;
    extractPassportData(imageUrl: string): Promise<PassportExtraction>;
    extractFamilyDocument(imageUrl: string): Promise<DocumentExtraction>;
    private callPythonService;
}
