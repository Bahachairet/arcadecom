-- AlterTable: Make productId nullable, add bidProductId to conversations
ALTER TABLE "conversations" ALTER COLUMN "product_id" DROP NOT NULL;
ALTER TABLE "conversations" ADD COLUMN "bid_product_id" UUID;

-- Add foreign key for bidProductId
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_bid_product_id_fkey" FOREIGN KEY ("bid_product_id") REFERENCES "bid_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop old unique constraint (find and drop dynamically)
DO $$ BEGIN
  ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_buyer_id_seller_id_product_id_key";
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add new unique constraint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_buyer_id_seller_id_product_id_bid_product_id_key" UNIQUE ("buyer_id", "seller_id", "product_id", "bid_product_id");

-- CreateTable: BidProductReview
CREATE TABLE "bid_product_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "bid_product_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bid_product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraint on bid_product_reviews
CREATE UNIQUE INDEX "bid_product_reviews_user_id_bid_product_id_key" ON "bid_product_reviews"("user_id", "bid_product_id");

-- AddForeignKey
ALTER TABLE "bid_product_reviews" ADD CONSTRAINT "bid_product_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bid_product_reviews" ADD CONSTRAINT "bid_product_reviews_bid_product_id_fkey" FOREIGN KEY ("bid_product_id") REFERENCES "bid_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
