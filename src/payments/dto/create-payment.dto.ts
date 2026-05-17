import {
  IsString,
  IsEnum,
  IsNumber,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  payment_method!: PaymentMethod;

  // رقم البطاقة (16 رقم)
  @IsString()
  @Length(16, 16, { message: 'رقم البطاقة يجب أن يكون 16 رقم' })
  @Matches(/^\d{16}$/, { message: 'رقم البطاقة يجب أن يحتوي على أرقام فقط' })
  card_number!: string;

  // اسم حامل البطاقة
  @IsString()
  card_holder_name!: string;

  // تاريخ الانتهاء MM/YY
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'تاريخ الانتهاء بصيغة MM/YY',
  })
  card_expiry!: string;

  // CVV
  @IsString()
  @Length(3, 4)
  @Matches(/^\d{3,4}$/)
  cvv!: string;

  // المبلغ (يأتي من الفرونت — البك يتحقق منه)
  @IsNumber()
  amount!: number;
}