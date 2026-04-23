/**
 * Mahram Validation Rules
 * Based on: قرار تسجيل الحجاج السوريين رقم 2108 - 46 ق.د لموسم حج 1447هـ - 2026م
 *
 * Rules:
 * - PRIMARY is always the applicant (صاحب الطلب)
 * - Companions are validated against allowed combinations
 * - Some combinations require conditions (age, guardian presence, etc.)
 */

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum RelationType {
  PRIMARY   = 'PRIMARY',
  SPOUSE    = 'SPOUSE',
  SON       = 'SON',
  DAUGHTER  = 'DAUGHTER',
  MOTHER    = 'MOTHER',
  FATHER    = 'FATHER',
  SIBLING   = 'SIBLING', // أخ / أخت
  // Extended
  SON_WIFE        = 'SON_WIFE',        // زوجة الابن
  DAUGHTER_HUSBAND = 'DAUGHTER_HUSBAND', // زوج البنت
  GRANDSON        = 'GRANDSON',        // ابن الابن / ابن البنت
  GRANDDAUGHTER   = 'GRANDDAUGHTER',   // بنت الابن / بنت البنت
  BROTHER         = 'BROTHER',         // أخ
  SISTER          = 'SISTER',          // أخت
  NEPHEW          = 'NEPHEW',          // ابن الأخ / ابن الأخت
  NIECE           = 'NIECE',           // بنت الأخ / بنت الأخت
  BROTHER_WIFE    = 'BROTHER_WIFE',    // زوجة الأخ
  SISTER_HUSBAND  = 'SISTER_HUSBAND',  // زوج الأخت
}

export interface Participant {
  relation_type: string;
  gender: Gender;
  age?: number; // عمر المشارك بالسنين
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

// ─────────────────────────────────────────────────────────────
// HELPER: get age from date_of_birth
// ─────────────────────────────────────────────────────────────
export function calcAge(dateOfBirth: string | Date): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// ─────────────────────────────────────────────────────────────
// MAIN VALIDATOR
// ─────────────────────────────────────────────────────────────
export class MahramValidator {

  validate(primary: Primary, companions: Participant[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (companions.length === 0) {
      return { valid: true, errors: [], warnings: [] };
    }

    // Max 2 companions per applicant (as per the table structure)
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
      const result = this.validateCompanion(
        primary,
        companion,
        companions,
        { hasSpouse, hasSon, hasDaughter, hasBrother, hasSister }
      );
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateCompanion(
    primary: Primary,
    companion: Participant,
    allCompanions: Participant[],
    context: {
      hasSpouse: boolean;
      hasSon: boolean;
      hasDaughter: boolean;
      hasBrother: boolean;
      hasSister: boolean;
    }
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const rel = companion.relation_type;
    const age = companion.age;

    // ── MALE PRIMARY (زوج / رجل) ─────────────────────────────
    if (primary.gender === Gender.MALE) {

      // الزوجة دائماً مسموحة
      if (rel === 'SPOUSE') {
        // مسموح بدون شروط
      }

      // ابن الزوجة / بنت الزوجة → يلزم وجود الزوجة كوسيط
      else if (rel === 'SON' || rel === 'DAUGHTER') {
        // مسموح مطلقاً (أبناء صاحب الطلب المباشرون)
      }

      // ابن الزوج / بنت الزوج → يلزم وجود الزوج كوسيط
      else if (rel === 'SON_WIFE' || rel === 'DAUGHTER_HUSBAND') {
        if (!context.hasSpouse) {
          errors.push(`مرافق (${rel}): يلزم وجود الزوج/الزوجة كوسيط`);
        }
      }

      // ابن الابن / بنت الابن → يلزم وجود الابن
      else if (rel === 'GRANDSON' || rel === 'GRANDDAUGHTER') {
        if (!context.hasSon) {
          errors.push(`مرافق (${rel}): يلزم وجود الابن ضمن المجموعة`);
        }
      }

      // أخ مسموح مطلقاً للرجل
      else if (rel === 'BROTHER') {
        // مسموح
      }

      // أخت للرجل — مسموح (مع وجود أخيها كمحرم ضمنياً)
      else if (rel === 'SISTER') {
        // مسموح
      }

      // المحارم الأخرى غير المذكورة
      else {
        warnings.push(`مرافق (${rel}): يرجى مراجعة الشروط مع مديرية الحج`);
      }
    }

    // ── FEMALE PRIMARY (زوجة / إمرأة) ───────────────────────
    else if (primary.gender === Gender.FEMALE) {

      // ابن / بنت — مسموح مطلقاً
      if (rel === 'SON' || rel === 'DAUGHTER') {
        // مسموح
      }

      // أخ — مسموح (هو المحرم)
      else if (rel === 'BROTHER') {
        // مسموح
      }

      // أخت — مسموح بشرط العمر فوق 45 سنة
      else if (rel === 'SISTER') {
        if (age !== undefined && age < 45) {
          errors.push(`مرافق (أخت): يُشترط أن يكون عمر المرافقة فوق 45 سنة`);
        } else if (age === undefined) {
          warnings.push(`مرافق (أخت): يُشترط التحقق من العمر — يجب أن يكون فوق 45 سنة`);
        }
      }

      // ابن الابن / ابن البنت → يلزم وجود الابن أو البنت
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

      // زوجة الابن → يلزم وجود الابن
      else if (rel === 'SON_WIFE') {
        if (!context.hasSon) {
          errors.push(`مرافق (زوجة الابن): يلزم وجود الابن ضمن المجموعة`);
        }
      }

      // ابن الأخ / بنت الأخ → يشترط وجود الأخ
      else if (rel === 'NEPHEW' || rel === 'NIECE') {
        if (!context.hasBrother) {
          errors.push(`مرافق (${rel}): يشترط وجود الأخ ضمن المجموعة`);
        }
      }

      // ابن الأخت / بنت الأخت → يلزم وجود الابن والمرأة معاً
      else if (rel === 'SISTER_HUSBAND') {
        errors.push(`مرافق (زوج الأخت): غير مسموح`);
      }

      else {
        warnings.push(`مرافق (${rel}): يرجى مراجعة الشروط مع مديرية الحج`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  // ─────────────────────────────────────────────────────────
  // Quick check: is this combination absolutely forbidden?
  // ─────────────────────────────────────────────────────────
  isForbiddenCombination(primary: Primary, companions: Participant[]): boolean {
    // رجل + زوجة الأخ — غير مسموح (رقم 37)
    const hasSpouseOfBrother = companions.some(c => c.relation_type === 'BROTHER_WIFE');
    if (primary.gender === Gender.MALE && hasSpouseOfBrother) return true;

    // امرأة + زوج الأخت — غير مسموح (رقم 52)
    const hasSisterHusband = companions.some(c => c.relation_type === 'SISTER_HUSBAND');
    if (primary.gender === Gender.FEMALE && hasSisterHusband) return true;

    return false;
  }
}