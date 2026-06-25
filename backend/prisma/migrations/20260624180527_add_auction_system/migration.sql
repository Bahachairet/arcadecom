-- CreateEnum
CREATE TYPE "BidProductStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'ENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "bid_products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seller_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "starting_price" DECIMAL(10,2) NOT NULL,
    "min_increment" DECIMAL(10,2) NOT NULL,
    "current_price" DECIMAL(10,2) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "BidProductStatus" NOT NULL DEFAULT 'UPCOMING',
    "winner_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bid_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bid_product_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bid_product_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" TEXT,

    CONSTRAINT "bid_product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bid_product_id" UUID NOT NULL,
    "bidder_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bid_products" ADD CONSTRAINT "bid_products_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bid_products" ADD CONSTRAINT "bid_products_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bid_product_images" ADD CONSTRAINT "bid_product_images_bid_product_id_fkey" FOREIGN KEY ("bid_product_id") REFERENCES "bid_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_bid_product_id_fkey" FOREIGN KEY ("bid_product_id") REFERENCES "bid_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
