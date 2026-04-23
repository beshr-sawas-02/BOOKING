-- CreateTable
CREATE TABLE "package_reviews" (
    "review_id" BIGSERIAL NOT NULL,
    "package_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "booking_id" BIGINT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "package_reviews_booking_id_key" ON "package_reviews"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_reviews_user_id_package_id_key" ON "package_reviews"("user_id", "package_id");

-- AddForeignKey
ALTER TABLE "package_reviews" ADD CONSTRAINT "package_reviews_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("package_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_reviews" ADD CONSTRAINT "package_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_reviews" ADD CONSTRAINT "package_reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;
