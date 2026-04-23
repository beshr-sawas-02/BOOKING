# Hajj Booking Backend

نظام إدارة حجوزات الحج والعمرة - مبني بـ NestJS + Prisma + PostgreSQL

---

## 🚀 التشغيل السريع

### 1. المتطلبات
- Node.js >= 18
- PostgreSQL
- Cloudinary account

### 2. الإعداد

```bash
# نسخ ملف البيئة
cp .env.example .env
# عدّل القيم في .env

# تثبيت الحزم
npm install

# إنشاء قاعدة البيانات وتطبيق الـ migrations
npm run db:migrate

# توليد Prisma client
npm run db:generate

# إضافة البيانات الأولية (super admin + sample package)
npm run db:seed

# تشغيل السيرفر
npm run start:dev
```

السيرفر يشتغل على: `http://localhost:3000/api`

---

## 📁 هيكل المشروع

```
src/
├── auth/           # JWT Authentication
├── users/          # User management
├── admins/         # Admin management + Dashboard
├── packages/       # Travel packages (Hajj/Umrah)
├── hotels/         # Hotels + image upload
├── bookings/       # Bookings + Family proof documents
├── passports/      # Passport management + verification flow
├── embassy/        # Embassy submission + result tracking
├── upload/         # Cloudinary service
├── prisma/         # Prisma service
└── common/
    ├── guards/     # JwtAuthGuard, RolesGuard
    ├── decorators/ # @Roles, @CurrentUser
    └── filters/    # Global exception filter
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | تسجيل مستخدم جديد |
| POST | `/api/auth/login` | دخول المستخدم |
| POST | `/api/auth/admin/login` | دخول الأدمن |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | User | بيانات الحساب |
| PATCH | `/api/users/profile` | User | تعديل الحساب |
| GET | `/api/users` | Admin | كل المستخدمين |
| GET | `/api/users/:id` | Admin | مستخدم محدد |

### Packages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/packages` | Public | كل الباقات |
| GET | `/api/packages?type=HAJJ` | Public | فلتر بالنوع |
| GET | `/api/packages/:id` | Public | باقة محددة |
| POST | `/api/packages` | Admin | إضافة باقة |
| PATCH | `/api/packages/:id` | Admin | تعديل باقة |
| DELETE | `/api/packages/:id` | Admin | حذف باقة |
| POST | `/api/packages/:id/hotels/:hotelId` | Admin | ربط فندق بباقة |

### Hotels
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/hotels` | Public | كل الفنادق |
| POST | `/api/hotels` | Admin | إضافة فندق |
| POST | `/api/hotels/:id/images` | Admin | رفع صورة فندق |
| DELETE | `/api/hotels/:id/images/:imageId` | Admin | حذف صورة |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | User | إنشاء حجز |
| GET | `/api/bookings/my` | User | حجوزاتي |
| GET | `/api/bookings` | Admin | كل الحجوزات |
| GET | `/api/bookings?status=PENDING` | Admin | فلتر بالحالة |
| GET | `/api/bookings/:id` | Both | تفاصيل حجز |
| PATCH | `/api/bookings/:id/status` | Admin | تغيير حالة الحجز |
| PATCH | `/api/bookings/:id/cancel` | User | إلغاء حجز |

### Family Proof Documents
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/family-proof/upload` | User | رفع وثيقة عائلية |
| GET | `/api/family-proof/booking/:id` | Both | وثائق حجز |
| PATCH | `/api/family-proof/:id/verify` | Admin | التحقق من الوثيقة |
| PATCH | `/api/family-proof/:id/link/:participantId` | Admin | ربط بمشارك |

### Passports
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/passports` | User | إضافة جواز سفر |
| GET | `/api/passports` | Admin | كل الجوازات |
| GET | `/api/passports/pending` | Admin | الجوازات تنتظر تحقق |
| GET | `/api/passports/booking/:id` | Both | جوازات حجز |
| POST | `/api/passports/:id/images?type=FRONT` | Both | رفع صورة جواز |
| PATCH | `/api/passports/:id/verify` | Admin | تحقق + تعديل بيانات |
| PATCH | `/api/passports/:id/send-to-embassy` | Admin | إرسال للسفارة |

### Embassy
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/embassy/stats` | Admin | إحصائيات السفارة |
| GET | `/api/embassy` | Admin | كل النتائج |
| GET | `/api/embassy?status=PENDING` | Admin | فلتر بالحالة |
| GET | `/api/embassy/booking/:id` | Admin | نتائج حجز |
| POST | `/api/embassy/submit/:bookingId` | Admin | إرسال للسفارة |
| PATCH | `/api/embassy/results/:id` | Admin | تحديث نتيجة |

### Admins
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admins/dashboard` | Admin | إحصائيات لوحة التحكم |
| GET | `/api/admins` | Admin | كل الأدمنز |
| POST | `/api/admins` | Admin | إضافة أدمن |

---

## 🔐 بيانات الدخول الافتراضية (بعد السيد)

```
Admin Email: admin@hajj.com
Admin Password: Admin@123456
```

---

## 🤖 AI System (للمستقبل)

الـ endpoints الجاهزة للـ AI:
- `POST /api/passports/:id/images` → بعد الرفع، استدعي `passportsService.saveAiExtraction()`
- `FamilyProofDocument.im_extracted` → جاهز لحفظ نتيجة الـ AI

---

## 🔄 Business Logic المهمة

### تدفق الحجز:
```
User creates booking (PENDING)
    ↓
User uploads passports + family proof
    ↓
Admin reviews & verifies passports
    ↓
Admin confirms booking (CONFIRMED)
    ↓
Admin submits to embassy
    ↓
Embassy result received (APPROVED/REJECTED)
    ↓
Booking completed (COMPLETED)
```

### Status Transitions:
- PENDING → CONFIRMED / REJECTED / CANCELLED
- CONFIRMED → COMPLETED / CANCELLED
- REJECTED → (نهاية)
- CANCELLED → (نهاية)
- COMPLETED → (نهاية)
