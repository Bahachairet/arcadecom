import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Gavel, Tag } from 'lucide-react';

export type ItemType = 'product' | 'auction' | 'bid';
export type ColorVariant = 'default' | 'dark' | 'olive' | 'sage' | 'salmon' | 'peach' | 'lime' | 'sky' | 'steel' | 'periwinkle';
export type ProductType = 'Physical' | 'Digital' | 'Collectible';

interface ItemCardProps {
  id: string;
  type: ItemType;
  title: string;
  price: string;
  label?: string;
  badge?: string;
  productType?: ProductType;
  timer?: string;
  bids?: number;
  imageUrl?: string;
  seller?: string;
  category?: string;
  colorVariant?: ColorVariant;
  showNew?: boolean;
}

const typeConfig: Record<ItemType, { icon: typeof Tag; tint: string }> = {
  product: { icon: Tag, tint: 'bg-tint-sage' },
  auction: { icon: Gavel, tint: 'bg-tint-salmon' },
  bid: { icon: ArrowUpRight, tint: 'bg-tint-periwinkle' },
};

function getDefaultBadge(type: ItemType, productType?: ProductType): string {
  if (type === 'auction') return 'Rare find';
  if (type === 'bid') return 'Open bid';
  return productType || 'Collectible';
}

const surfaceVariantClasses: Record<ColorVariant, string> = {
  default: 'bg-card',
  dark: 'bg-neutral-900 text-white',
  olive: 'bg-tint-olive',
  sage: 'bg-tint-sage',
  salmon: 'bg-tint-salmon',
  peach: 'bg-tint-peach',
  lime: 'bg-tint-lime',
  sky: 'bg-tint-sky',
  steel: 'bg-tint-steel',
  periwinkle: 'bg-tint-periwinkle',
};

function isDarkVariant(v: ColorVariant): boolean {
  return v === 'dark';
}

export default function ItemCard({
  id,
  type,
  title,
  price,
  label,
  badge,
  productType,
  timer,
  bids,
  imageUrl,
  seller,
  category,
  colorVariant = 'default',
  showNew = false,
}: ItemCardProps) {
  const config = typeConfig[type];
  const TypeIcon = config.icon;
  const surfaceClasses = surfaceVariantClasses[colorVariant];
  const dark = isDarkVariant(colorVariant);
  const badgeLabel = badge || getDefaultBadge(type, productType);

  const href = type === 'auction' ? `/auctions/${id}` : `/products/${id}`;

  const mutedText = dark ? 'text-white/60' : 'text-foreground/60';
  const borderTint = dark ? 'border-white/15' : 'border-foreground/15';

  return (
    <Link to={href} className="group block">
      <article className="overflow-hidden border border-border bg-card transition-colors duration-200 hover:shadow-md">
        {/* Image area — no tint */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <TypeIcon className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Type badge — top left */}
          <span
            className={`absolute left-0 top-0 flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-wider text-ink ${config.tint}`}
          >
            <TypeIcon className="h-3 w-3" />
            {badgeLabel}
          </span>

          {/* NEW! burst — angled yellow sticker */}
          {showNew && (
            <span className="absolute -right-1 top-3 z-10 rotate-[-8deg] border-2 border-ink bg-accent-yellow px-2 py-0.5 text-[10px] font-bold text-ink shadow-[2px_2px_0_#000]">
              NEW!
            </span>
          )}
        </div>

        {/* Content area — full tint surface */}
        <div className={`${surfaceClasses}`}>
          {/* Title */}
          <div className={`px-4 pt-3 pb-2 ${!dark ? '' : ''}`}>
            <h3 className="truncate font-sans text-sm font-bold uppercase leading-tight">
              {title}
            </h3>
            {category && (
              <p className={`mt-0.5 text-[11px] ${mutedText}`}>{category}</p>
            )}
          </div>

          {/* Divider */}
          <div className={`mx-4 border-t ${borderTint}`} />

          {/* Price + meta */}
          <div className="px-4 py-3">
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-[10px] font-bold tracking-wider ${mutedText}`}>
                  {(label || (type === 'auction' ? 'CURRENT BID' : 'PRICE')).toUpperCase()}
                </p>
                <p className="mt-0.5 font-display text-xl font-bold">{price}</p>
              </div>

              {timer && (
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block h-2 w-2 rounded-full ${dark ? 'bg-green-400' : 'bg-green-600'}`} />
                  <span className={`flex items-center gap-1 text-[10px] ${mutedText}`}>
                    <Clock className="h-3 w-3" />
                    {timer}
                  </span>
                </div>
              )}

              {bids !== undefined && (
                <span className={`text-[10px] ${mutedText}`}>
                  {bids} {bids === 1 ? 'bid' : 'bids'}
                </span>
              )}
            </div>

            {seller && (
              <p className={`mt-2 text-[11px] ${mutedText}`}>by {seller}</p>
            )}
          </div>
        </div>

        {/* Footer — View details strip (no tint) */}
        <div className="flex items-center justify-between border-t border-border bg-card px-4 py-2.5">
          <span className="flex items-center gap-1 text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
            View details <ArrowUpRight className="h-3 w-3" />
          </span>
          {type === 'auction' && (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold">
              Bid
            </span>
          )}
          {type === 'bid' && (
            <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold">
              Place Bid
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
