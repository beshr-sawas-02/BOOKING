"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MahramValidator = exports.RelationType = exports.Gender = void 0;
exports.calcAge = calcAge;
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
})(Gender || (exports.Gender = Gender = {}));
var RelationType;
(function (RelationType) {
    RelationType["PRIMARY"] = "PRIMARY";
    RelationType["SPOUSE"] = "SPOUSE";
    RelationType["SON"] = "SON";
    RelationType["DAUGHTER"] = "DAUGHTER";
    RelationType["MOTHER"] = "MOTHER";
    RelationType["FATHER"] = "FATHER";
    RelationType["SIBLING"] = "SIBLING";
    RelationType["SON_WIFE"] = "SON_WIFE";
    RelationType["DAUGHTER_HUSBAND"] = "DAUGHTER_HUSBAND";
    RelationType["GRANDSON"] = "GRANDSON";
    RelationType["GRANDDAUGHTER"] = "GRANDDAUGHTER";
    RelationType["BROTHER"] = "BROTHER";
    RelationType["SISTER"] = "SISTER";
    RelationType["NEPHEW"] = "NEPHEW";
    RelationType["NIECE"] = "NIECE";
    RelationType["BROTHER_WIFE"] = "BROTHER_WIFE";
    RelationType["SISTER_HUSBAND"] = "SISTER_HUSBAND";
})(RelationType || (exports.RelationType = RelationType = {}));
function calcAge(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate()))
        age--;
    return age;
}
class MahramValidator {
    validate(primary, companions) {
        const errors = [];
        const warnings = [];
        if (companions.length === 0) {
            return { valid: true, errors: [], warnings: [] };
        }
        if (companions.length > 2) {
            errors.push('لا يمكن إضافة أكثر من مرافقين اثنين لكل صاحب طلب');
        }
        const relationTypes = companions.map(c => c.relation_type);
        const hasSpouse = relationTypes.includes('SPOUSE');
        const hasSon = relationTypes.includes('SON');
        const hasDaughter = relationTypes.includes('DAUGHTER');
        const hasBrother = relationTypes.includes('BROTHER');
        const hasSister = relationTypes.includes('SISTER');
        for (const companion of companions) {
            const result = this.validateCompanion(primary, companion, companions, { hasSpouse, hasSon, hasDaughter, hasBrother, hasSister });
            errors.push(...result.errors);
            warnings.push(...result.warnings);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    validateCompanion(primary, companion, allCompanions, context) {
        const errors = [];
        const warnings = [];
        const rel = companion.relation_type;
        const age = companion.age;
        if (primary.gender === Gender.MALE) {
            if (rel === 'SPOUSE') {
            }
            else if (rel === 'SON' || rel === 'DAUGHTER') {
            }
            else if (rel === 'SON_WIFE' || rel === 'DAUGHTER_HUSBAND') {
                if (!context.hasSpouse) {
                    errors.push(`مرافق (${rel}): يلزم وجود الزوج/الزوجة كوسيط`);
                }
            }
            else if (rel === 'GRANDSON' || rel === 'GRANDDAUGHTER') {
                if (!context.hasSon) {
                    errors.push(`مرافق (${rel}): يلزم وجود الابن ضمن المجموعة`);
                }
            }
            else if (rel === 'BROTHER') {
            }
            else if (rel === 'SISTER') {
            }
            else {
                warnings.push(`مرافق (${rel}): يرجى مراجعة الشروط مع مديرية الحج`);
            }
        }
        else if (primary.gender === Gender.FEMALE) {
            if (rel === 'SON' || rel === 'DAUGHTER') {
            }
            else if (rel === 'BROTHER') {
            }
            else if (rel === 'SISTER') {
                if (age !== undefined && age < 45) {
                    errors.push(`مرافق (أخت): يُشترط أن يكون عمر المرافقة فوق 45 سنة`);
                }
                else if (age === undefined) {
                    warnings.push(`مرافق (أخت): يُشترط التحقق من العمر — يجب أن يكون فوق 45 سنة`);
                }
            }
            else if (rel === 'GRANDSON') {
                if (!context.hasSon) {
                    errors.push(`مرافق (ابن الابن): يلزم وجود الابن ضمن المجموعة`);
                }
            }
            else if (rel === 'GRANDDAUGHTER') {
                if (!context.hasDaughter) {
                    errors.push(`مرافق (بنت البنت): يلزم وجود البنت ضمن المجموعة`);
                }
            }
            else if (rel === 'SON_WIFE') {
                if (!context.hasSon) {
                    errors.push(`مرافق (زوجة الابن): يلزم وجود الابن ضمن المجموعة`);
                }
            }
            else if (rel === 'NEPHEW' || rel === 'NIECE') {
                if (!context.hasBrother) {
                    errors.push(`مرافق (${rel}): يشترط وجود الأخ ضمن المجموعة`);
                }
            }
            else if (rel === 'SISTER_HUSBAND') {
                errors.push(`مرافق (زوج الأخت): غير مسموح`);
            }
            else {
                warnings.push(`مرافق (${rel}): يرجى مراجعة الشروط مع مديرية الحج`);
            }
        }
        return { valid: errors.length === 0, errors, warnings };
    }
    isForbiddenCombination(primary, companions) {
        const hasSpouseOfBrother = companions.some(c => c.relation_type === 'BROTHER_WIFE');
        if (primary.gender === Gender.MALE && hasSpouseOfBrother)
            return true;
        const hasSisterHusband = companions.some(c => c.relation_type === 'SISTER_HUSBAND');
        if (primary.gender === Gender.FEMALE && hasSisterHusband)
            return true;
        return false;
    }
}
exports.MahramValidator = MahramValidator;
//# sourceMappingURL=mahram.validator.js.map