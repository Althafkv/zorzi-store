import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const compareAt =
    product.compareAtPrice === undefined || product.compareAtPrice === null
      ? undefined
      : typeof product.compareAtPrice === 'number'
        ? product.compareAtPrice
        : Number(product.compareAtPrice);

  const showCompareAt =
    typeof compareAt === 'number' && Number.isFinite(compareAt) && compareAt > product.price;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <article className="group product-card-hover rounded-lg overflow-hidden">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-[3/4] overflow-hidden bg-secondary/50">
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:underline underline-offset-2 transition-all">
            {product.title}
          </h3>
        </Link>
        {product.category && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</p>
        )}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
            {showCompareAt && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(compareAt)}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="h-8 px-3 text-xs font-medium border-border/60 hover:bg-foreground hover:text-background hover:border-foreground transition-all"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add to cart
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
