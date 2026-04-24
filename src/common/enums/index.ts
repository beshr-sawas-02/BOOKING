// export enum BookingStatus {
//   PENDING = 'PENDING',
//   CONFIRMED = 'CONFIRMED',
//   REJECTED = 'REJECTED',
//   CANCELLED = 'CANCELLED',
//   COMPLETED = 'COMPLETED',
// }

// export enum EmbassyStatus {
//   PENDING = 'PENDING',
//   APPROVED = 'APPROVED',
//   REJECTED = 'REJECTED',
// }

// export enum VerificationStatus {
//   PENDING = 'PENDING',
//   APPROVED = 'APPROVED',
//   REJECTED = 'REJECTED',
// }

// export enum AdminRole {
//   SUPER_ADMIN = 'SUPER_ADMIN',
//   ADMIN = 'ADMIN',
// }

// export enum PackageType {
//   HAJJ = 'HAJJ',
//   UMRAH = 'UMRAH',
// }

// export enum Gender {
//   MALE = 'MALE',
//   FEMALE = 'FEMALE',
// }

// export enum RelationType {
//   PRIMARY = 'PRIMARY',
//   SPOUSE = 'SPOUSE', // زوج / زوجة
//   SON = 'SON', // ابن
//   DAUGHTER = 'DAUGHTER', // بنت
//   MOTHER = 'MOTHER', // أم
//   FATHER = 'FATHER', // أب
//   BROTHER = 'BROTHER', // أخ
//   SISTER = 'SISTER', // أخت
//   GRANDSON = 'GRANDSON', // ابن الابن / ابن البنت
//   GRANDDAUGHTER = 'GRANDDAUGHTER', // بنت الابن / بنت البنت
//   SON_WIFE = 'SON_WIFE', // زوجة الابن
//   DAUGHTER_HUSBAND = 'DAUGHTER_HUSBAND', // زوج البنت
//   NEPHEW = 'NEPHEW', // ابن الأخ / ابن الأخت
//   NIECE = 'NIECE', // بنت الأخ / بنت الأخت
//   BROTHER_WIFE = 'BROTHER_WIFE', // زوجة الأخ (غير مسموح)
//   SISTER_HUSBAND = 'SISTER_HUSBAND', // زوج الأخت (غير مسموح)
//   OTHER = 'OTHER',
// }

// export enum ImageType {
//   FRONT = 'FRONT',
//   BACK = 'BACK',
// }
// إعادة تصدير من Prisma - مصدر واحد للحقيقة للـ enums
export {
  BookingStatus,
  EmbassyStatus,
  VerificationStatus,
  AdminRole,
  PackageType,
  Gender,
  RelationType,
  ImageType,
} from '@prisma/client';