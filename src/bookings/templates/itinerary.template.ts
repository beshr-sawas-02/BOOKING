import { format } from 'date-fns';

export interface ItineraryDay {
  day_number: number;
  date?: string;
  location: string;
  activities: string[];
  notes?: string;
}

export interface ItineraryData {
  booking_id: string;
  user_name: string;
  package_title: string;
  package_type: 'HAJJ' | 'UMRAH';
  duration_days: number;
  total_price: number;
  participants: { name: string; relation: string }[];
  hotels: { name: string; location: string; stars: number }[];
  supervisor_name?: string;
  supervisor_phone?: string;
  days: ItineraryDay[];
  generated_at: Date;
}

// جدول الحج الافتراضي (10 أيام)
const HAJJ_SCHEDULE: ItineraryDay[] = [
  {
    day_number: 1,
    location: 'الميقات',
    activities: ['الإحرام من الميقات', 'نية الحج', 'التلبية'],
  },
  {
    day_number: 2,
    location: 'مكة المكرمة',
    activities: [
      'الوصول إلى مكة',
      'طواف القدوم',
      'السعي بين الصفا والمروة',
    ],
  },
  {
    day_number: 3,
    location: 'مكة المكرمة',
    activities: ['الاستعداد للتوجه إلى منى', 'صلاة الظهر والعصر'],
  },
  {
    day_number: 4,
    location: 'منى',
    activities: ['التوجه إلى منى (يوم التروية)', 'المبيت في منى'],
  },
  {
    day_number: 5,
    location: 'عرفات',
    activities: [
      'الوقوف بعرفة',
      'خطبة عرفة',
      'الإفاضة إلى مزدلفة',
      'المبيت في مزدلفة',
    ],
  },
  {
    day_number: 6,
    location: 'منى',
    activities: [
      'رمي جمرة العقبة',
      'النحر',
      'الحلق أو التقصير',
      'طواف الإفاضة',
    ],
  },
  {
    day_number: 7,
    location: 'منى',
    activities: ['أيام التشريق - رمي الجمرات الثلاث', 'المبيت في منى'],
  },
  {
    day_number: 8,
    location: 'منى',
    activities: ['اليوم الثاني من التشريق', 'رمي الجمرات بعد الزوال'],
  },
  {
    day_number: 9,
    location: 'منى',
    activities: [
      'اليوم الثالث من التشريق',
      'رمي الجمرات',
      'العودة إلى مكة',
    ],
  },
  {
    day_number: 10,
    location: 'مكة المكرمة',
    activities: ['طواف الوداع', 'الاستعداد للسفر إلى المدينة'],
  },
];

// جدول العمرة الافتراضي (7 أيام)
const UMRAH_SCHEDULE: ItineraryDay[] = [
  {
    day_number: 1,
    location: 'الميقات',
    activities: ['الإحرام من الميقات', 'نية العمرة', 'التلبية'],
  },
  {
    day_number: 2,
    location: 'مكة المكرمة',
    activities: [
      'الوصول إلى مكة',
      'الطواف بالكعبة المشرفة',
      'صلاة ركعتين خلف المقام',
      'السعي بين الصفا والمروة',
      'الحلق أو التقصير',
    ],
  },
  {
    day_number: 3,
    location: 'مكة المكرمة',
    activities: ['زيارة المساجد التاريخية', 'الصلاة في الحرم'],
  },
  {
    day_number: 4,
    location: 'المدينة المنورة',
    activities: [
      'التوجه إلى المدينة المنورة',
      'زيارة المسجد النبوي الشريف',
    ],
  },
  {
    day_number: 5,
    location: 'المدينة المنورة',
    activities: [
      'زيارة قبر الرسول ﷺ',
      'الصلاة في الروضة الشريفة',
      'زيارة البقيع',
    ],
  },
  {
    day_number: 6,
    location: 'المدينة المنورة',
    activities: ['زيارة مسجد قباء', 'زيارة جبل أحد ومقابر الشهداء'],
  },
  {
    day_number: 7,
    location: 'العودة',
    activities: ['الاستعداد للعودة', 'صلاة الوداع'],
  },
];

/**
 * توليد HTML لجدول الرحلة بدعم RTL وخط Cairo
 */
export function generateItineraryHtml(data: ItineraryData): string {
  // إذا ما في جدول مخصص، استخدم الافتراضي
  const days =
    data.days.length > 0
      ? data.days
      : data.package_type === 'HAJJ'
        ? HAJJ_SCHEDULE.slice(0, data.duration_days)
        : UMRAH_SCHEDULE.slice(0, data.duration_days);

  const generatedDate = format(data.generated_at, 'yyyy/MM/dd HH:mm');

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>جدول الرحلة - ${data.package_title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Cairo', sans-serif;
    }

    body {
      direction: rtl;
      color: #1A1A1A;
      line-height: 1.7;
    }

    .header {
      background: linear-gradient(135deg, #1B5E20 0%, #003300 100%);
      color: white;
      padding: 30px 25px;
      text-align: center;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .header .subtitle {
      font-size: 15px;
      opacity: 0.9;
    }

    .header .badge {
      display: inline-block;
      background: #D4AF37;
      color: #000;
      padding: 5px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      margin-top: 12px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    .info-card {
      background: #F8F9FA;
      padding: 14px;
      border-radius: 10px;
      border-right: 4px solid #1B5E20;
    }

    .info-card .label {
      font-size: 11px;
      color: #6C757D;
      margin-bottom: 4px;
    }

    .info-card .value {
      font-size: 14px;
      font-weight: 600;
      color: #1A1A1A;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      font-weight: 700;
      color: #1B5E20;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 2px solid #D4AF37;
    }

    .day-card {
      background: white;
      border: 1px solid #DEE2E6;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }

    .day-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .day-number {
      width: 40px;
      height: 40px;
      background: #1B5E20;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }

    .day-info {
      flex: 1;
    }

    .day-title {
      font-size: 15px;
      font-weight: 700;
      color: #1A1A1A;
    }

    .day-location {
      font-size: 13px;
      color: #1B5E20;
      font-weight: 600;
    }

    .activities {
      list-style: none;
      padding-right: 52px;
    }

    .activities li {
      position: relative;
      padding: 4px 0;
      font-size: 13px;
      color: #495057;
    }

    .activities li::before {
      content: '◆';
      position: absolute;
      right: -16px;
      color: #D4AF37;
      font-size: 10px;
      top: 8px;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .table th {
      background: #1B5E20;
      color: white;
      padding: 10px;
      text-align: right;
      font-size: 13px;
      font-weight: 700;
    }

    .table td {
      padding: 10px;
      border-bottom: 1px solid #DEE2E6;
      font-size: 13px;
    }

    .table tr:last-child td {
      border-bottom: none;
    }

    .table tr:nth-child(even) {
      background: #F8F9FA;
    }

    .supervisor-card {
      background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
      color: #1A1A1A;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .supervisor-icon {
      width: 50px;
      height: 50px;
      background: rgba(0,0,0,0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .supervisor-info .name {
      font-size: 15px;
      font-weight: 700;
    }

    .supervisor-info .phone {
      font-size: 14px;
      direction: ltr;
      text-align: right;
      margin-top: 4px;
    }

    .footer {
      margin-top: 30px;
      padding-top: 16px;
      border-top: 2px dashed #DEE2E6;
      text-align: center;
      color: #6C757D;
      font-size: 11px;
    }

    .footer .logo {
      color: #1B5E20;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .stars {
      color: #D4AF37;
      letter-spacing: 2px;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>📋 جدول الرحلة</h1>
    <div class="subtitle">${data.package_title}</div>
    <span class="badge">${data.package_type === 'HAJJ' ? '🕋 الحج' : '🕌 العمرة'}</span>
  </div>

  <!-- Booking Info -->
  <div class="info-grid">
    <div class="info-card">
      <div class="label">رقم الحجز</div>
      <div class="value">#${data.booking_id}</div>
    </div>
    <div class="info-card">
      <div class="label">اسم الحاج</div>
      <div class="value">${data.user_name}</div>
    </div>
    <div class="info-card">
      <div class="label">المدة</div>
      <div class="value">${data.duration_days} يوم</div>
    </div>
    <div class="info-card">
      <div class="label">إجمالي المبلغ</div>
      <div class="value">${data.total_price.toLocaleString('ar')} ر.س</div>
    </div>
  </div>

  ${
    data.supervisor_name
      ? `
  <!-- Supervisor -->
  <div class="section">
    <h2 class="section-title">👤 مشرف الرحلة</h2>
    <div class="supervisor-card">
      <div class="supervisor-icon">👤</div>
      <div class="supervisor-info">
        <div class="name">${data.supervisor_name}</div>
        ${data.supervisor_phone ? `<div class="phone">${data.supervisor_phone}</div>` : ''}
      </div>
    </div>
  </div>
  `
      : ''
  }

  <!-- Participants -->
  <div class="section">
    <h2 class="section-title">👥 المشاركون (${data.participants.length})</h2>
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>الاسم</th>
          <th>صلة القرابة</th>
        </tr>
      </thead>
      <tbody>
        ${data.participants
          .map(
            (p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${p.name}</td>
            <td>${p.relation}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <!-- Hotels -->
  ${
    data.hotels.length > 0
      ? `
  <div class="section">
    <h2 class="section-title">🏨 الفنادق</h2>
    <table class="table">
      <thead>
        <tr>
          <th>الفندق</th>
          <th>الموقع</th>
          <th>التصنيف</th>
        </tr>
      </thead>
      <tbody>
        ${data.hotels
          .map(
            (h) => `
          <tr>
            <td>${h.name}</td>
            <td>${h.location}</td>
            <td><span class="stars">${'★'.repeat(h.stars)}</span></td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  </div>
  `
      : ''
  }

  <!-- Daily Schedule -->
  <div class="section">
    <h2 class="section-title">📅 الجدول اليومي</h2>
    ${days
      .map(
        (day) => `
      <div class="day-card">
        <div class="day-header">
          <div class="day-number">${day.day_number}</div>
          <div class="day-info">
            <div class="day-title">اليوم ${day.day_number}</div>
            <div class="day-location">📍 ${day.location}</div>
          </div>
        </div>
        <ul class="activities">
          ${day.activities.map((a) => `<li>${a}</li>`).join('')}
        </ul>
        ${day.notes ? `<div style="margin-top:8px;padding:8px;background:#FFF3E0;border-radius:6px;font-size:12px;">📝 ${day.notes}</div>` : ''}
      </div>
    `,
      )
      .join('')}
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="logo">🕋 تطبيق الحج والعمرة</div>
    <div>تم إصدار هذا الجدول في ${generatedDate}</div>
    <div style="margin-top:6px;">هذا الجدول استرشادي وقابل للتعديل حسب الظروف</div>
  </div>
</body>
</html>
  `;
}