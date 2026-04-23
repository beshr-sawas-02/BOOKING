export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE"
}
export declare enum RelationType {
    PRIMARY = "PRIMARY",
    SPOUSE = "SPOUSE",
    SON = "SON",
    DAUGHTER = "DAUGHTER",
    MOTHER = "MOTHER",
    FATHER = "FATHER",
    SIBLING = "SIBLING",
    SON_WIFE = "SON_WIFE",
    DAUGHTER_HUSBAND = "DAUGHTER_HUSBAND",
    GRANDSON = "GRANDSON",
    GRANDDAUGHTER = "GRANDDAUGHTER",
    BROTHER = "BROTHER",
    SISTER = "SISTER",
    NEPHEW = "NEPHEW",
    NIECE = "NIECE",
    BROTHER_WIFE = "BROTHER_WIFE",
    SISTER_HUSBAND = "SISTER_HUSBAND"
}
export interface Participant {
    relation_type: string;
    gender: Gender;
    age?: number;
}
export interface Primary {
    gender: Gender;
    age?: number;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare function calcAge(dateOfBirth: string | Date): number;
export declare class MahramValidator {
    validate(primary: Primary, companions: Participant[]): ValidationResult;
    private validateCompanion;
    isForbiddenCombination(primary: Primary, companions: Participant[]): boolean;
}
