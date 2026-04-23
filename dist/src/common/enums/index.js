"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageType = exports.RelationType = exports.Gender = exports.PackageType = exports.AdminRole = exports.VerificationStatus = exports.EmbassyStatus = exports.BookingStatus = void 0;
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["REJECTED"] = "REJECTED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["COMPLETED"] = "COMPLETED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var EmbassyStatus;
(function (EmbassyStatus) {
    EmbassyStatus["PENDING"] = "PENDING";
    EmbassyStatus["APPROVED"] = "APPROVED";
    EmbassyStatus["REJECTED"] = "REJECTED";
})(EmbassyStatus || (exports.EmbassyStatus = EmbassyStatus = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["APPROVED"] = "APPROVED";
    VerificationStatus["REJECTED"] = "REJECTED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["ADMIN"] = "ADMIN";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
var PackageType;
(function (PackageType) {
    PackageType["HAJJ"] = "HAJJ";
    PackageType["UMRAH"] = "UMRAH";
})(PackageType || (exports.PackageType = PackageType = {}));
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
    RelationType["BROTHER"] = "BROTHER";
    RelationType["SISTER"] = "SISTER";
    RelationType["GRANDSON"] = "GRANDSON";
    RelationType["GRANDDAUGHTER"] = "GRANDDAUGHTER";
    RelationType["SON_WIFE"] = "SON_WIFE";
    RelationType["DAUGHTER_HUSBAND"] = "DAUGHTER_HUSBAND";
    RelationType["NEPHEW"] = "NEPHEW";
    RelationType["NIECE"] = "NIECE";
    RelationType["BROTHER_WIFE"] = "BROTHER_WIFE";
    RelationType["SISTER_HUSBAND"] = "SISTER_HUSBAND";
    RelationType["OTHER"] = "OTHER";
})(RelationType || (exports.RelationType = RelationType = {}));
var ImageType;
(function (ImageType) {
    ImageType["FRONT"] = "FRONT";
    ImageType["BACK"] = "BACK";
})(ImageType || (exports.ImageType = ImageType = {}));
//# sourceMappingURL=index.js.map