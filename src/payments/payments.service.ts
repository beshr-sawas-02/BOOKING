import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  PaymentType,
  PaymentStatus,
  PaymentMethod,
  BookingStatus,
} from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';

/**
 * نسبة العربون من إجمالي الحجز
 */
export const DEPOSIT_PERCENTAGE = 0.2; // 20%

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * إنشاء دفعة (داخلية - تُستدعى من bookings.service)
   * تحاكي نظام دفع وهمي:
   * - تتحقق من البطاقة بـ Luhn algorithm
   * - تحفظ آخر 4 أرقام فقط (أمان)
   * - تُنشئ transaction_ref وهمي
   */
  async createPayment(params: {
    bookingId: bigint | number;
    userId: bigint | number;
    amount: number;
    paymentType: PaymentType;
    paymentData: CreatePaymentDto;
  }) {
    const { bookingId, userId, amount, paymentType, paymentData } = params;

    // ✅ 1. التحقق من البطاقة بـ Luhn algorithm
    if (!this.isValidCard(paymentData.card_number)) {
      throw new BadRequestException('رقم البطاقة غير صحيح');
    }

    // ✅ 2. التحقق من تاريخ الانتهاء
    if (!this.isValidExpiry(paymentData.card_expiry)) {
      throw new BadRequestException('البطاقة منتهية الصلاحية');
    }

    // ✅ 3. التحقق من المبلغ
    if (paymentData.amount !== amount) {
      throw new BadRequestException(
        `المبلغ غير صحيح. المطلوب: ${amount}, تم إرسال: ${paymentData.amount}`,
      );
    }

    // ✅ 4. حفظ سجل الدفعة
    const last4 = paymentData.card_number.slice(-4);
    const transactionRef = this.generateTransactionRef();

    const payment = await this.prisma.payment.create({
      data: {
        booking_id: BigInt(bookingId),
        user_id: BigInt(userId),
        amount,
        payment_type: paymentType,
        payment_status: PaymentStatus.COMPLETED,
        payment_method: paymentData.payment_method,
        card_last_4: last4,
        card_holder_name: paymentData.card_holder_name,
        transaction_ref: transactionRef,
        paid_at: new Date(),
      },
    });

    return payment;
  }

  /**
   * دفع المبلغ النهائي (يُستدعى من المستخدم)
   * شرط: الحجز CONFIRMED ولم يُدفع المبلغ النهائي بعد
   */
  async payFinal(bookingId: number, userId: number, dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { booking_id: BigInt(bookingId) },
      include: {
        user: { select: { user_id: true, full_name: true } },
        package: { select: { package_title: true } },
        payments: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // ✅ التحقق من ملكية الحجز
    if (booking.user_id.toString() !== userId.toString()) {
      throw new ForbiddenException('ليس حجزك');
    }

    // ✅ التحقق من حالة الحجز
    if (booking.booking_status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        'الحجز يجب أن يكون مقبول من الأدمن قبل الدفع النهائي',
      );
    }

    // ✅ التحقق إن العربون مدفوع
    const depositPaid = booking.payments.some(
      (p) =>
        p.payment_type === PaymentType.DEPOSIT &&
        p.payment_status === PaymentStatus.COMPLETED,
    );
    if (!depositPaid) {
      throw new BadRequestException('يجب دفع العربون أولاً');
    }

    // ✅ التحقق إن الدفعة النهائية لم تُدفع
    const finalPaid = booking.payments.some(
      (p) =>
        p.payment_type === PaymentType.FINAL &&
        p.payment_status === PaymentStatus.COMPLETED,
    );
    if (finalPaid) {
      throw new BadRequestException('تم دفع المبلغ النهائي مسبقاً');
    }

    // ✅ حساب المبلغ المتبقي (80% من الإجمالي)
    const totalPrice = Number(booking.total_price);
    const depositAmount = totalPrice * DEPOSIT_PERCENTAGE;
    const finalAmount = totalPrice - depositAmount;

    // ✅ تنفيذ الدفع
    const payment = await this.createPayment({
      bookingId,
      userId,
      amount: finalAmount,
      paymentType: PaymentType.FINAL,
      paymentData: dto,
    });

    // ✅ إشعار الأدمن (اختياري) + المستخدم
    await this.notificationsService.create({
      userId: booking.user.user_id,
      type: 'PAYMENT_RECEIVED',
      title: '💰 تم استلام دفعتك',
      message: `تم استلام المبلغ النهائي (${this.formatCurrency(finalAmount)}) للرحلة "${booking.package.package_title}".`,
      relatedId: booking.booking_id,
      relatedType: 'booking',
    });

    return {
      payment: this.serializePayment(payment),
      message: 'تم الدفع بنجاح',
    };
  }

  /**
   * تاريخ الدفعات لحجز معيّن
   */
  async findByBooking(bookingId: number, userId: number, isAdmin: boolean) {
    const booking = await this.prisma.booking.findUnique({
      where: { booking_id: BigInt(bookingId) },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (!isAdmin && booking.user_id.toString() !== userId.toString()) {
      throw new ForbiddenException('ليس حجزك');
    }

    const payments = await this.prisma.payment.findMany({
      where: { booking_id: BigInt(bookingId) },
      orderBy: { paid_at: 'desc' },
    });

    const totalPrice = Number(booking.total_price);
    const depositAmount = totalPrice * DEPOSIT_PERCENTAGE;
    const finalAmount = totalPrice - depositAmount;

    const totalPaid = payments
      .filter((p) => p.payment_status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const depositPaid = payments.some(
      (p) =>
        p.payment_type === PaymentType.DEPOSIT &&
        p.payment_status === PaymentStatus.COMPLETED,
    );
    const finalPaid = payments.some(
      (p) =>
        p.payment_type === PaymentType.FINAL &&
        p.payment_status === PaymentStatus.COMPLETED,
    );

    return {
      payments: payments.map((p) => this.serializePayment(p)),
      summary: {
        total_price: totalPrice,
        deposit_amount: depositAmount,
        final_amount: finalAmount,
        total_paid: totalPaid,
        remaining: totalPrice - totalPaid,
        deposit_paid: depositPaid,
        final_paid: finalPaid,
        is_fully_paid: depositPaid && finalPaid,
      },
    };
  }

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────

  /**
   * Luhn algorithm للتحقق من صحة رقم البطاقة
   */
  private isValidCard(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(digits)) return false;

    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }

  /**
   * التحقق من تاريخ انتهاء البطاقة
   */
  private isValidExpiry(expiry: string): boolean {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;

    const month = parseInt(match[1], 10);
    const year = 2000 + parseInt(match[2], 10);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const expiryDate = new Date(year, month, 0); // آخر يوم في الشهر
    return expiryDate >= now;
  }

  /**
   * توليد مرجع معاملة وهمي
   */
  private generateTransactionRef(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * تنسيق العملة للإشعارات
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-SY', {
      style: 'currency',
      currency: 'SYP',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * تحويل BigInt لـ string في الـ response
   */
  private serializePayment(p: any) {
    return {
      ...p,
      payment_id: p.payment_id.toString(),
      booking_id: p.booking_id.toString(),
      user_id: p.user_id.toString(),
      amount: Number(p.amount),
    };
  }
}