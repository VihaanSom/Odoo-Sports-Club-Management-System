import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FaBagShopping, FaCartShopping } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { publicService } from '@/services/publicService';
import type { PublicShopItem } from '@/types/public';

export const PublicShopPage = () => {
  const [items, setItems] = useState<PublicShopItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      try {
        const data = await publicService.getPublicShopItems();
        setItems(data);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, []);

  const categories = ['all', 'Rackets', 'Balls', 'Accessories', 'Swimming'];

  const filtered = selectedCategory === 'all'
    ? items
    : items.filter((i) => i.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleReserve = (itemName: string) => {
    toast.success(`Reservation inquiry for "${itemName}" placed. Visit club desk for checkout.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
            <FaBagShopping className="size-8 text-primary" /> Pro Sports Shop & Rentals
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Tournament-grade tennis rackets, badminton gear, competition accessories, and rental demos.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-xs capitalize ${
                selectedCategory === cat ? 'btn-primary' : 'btn-outline'
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card bg-base-100 border border-base-300 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <figure className="relative h-48 bg-base-200">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="badge badge-neutral absolute top-3 right-3 text-xs font-mono">
                    {item.availableQuantity} in stock
                  </span>
                  {item.brand && (
                    <span className="badge badge-primary absolute top-3 left-3 text-xs font-bold">
                      {item.brand}
                    </span>
                  )}
                </figure>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base">{item.name}</h3>
                    <span className="badge badge-outline badge-xs capitalize">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-base-content/70 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="divider my-1" />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-base-200/50 border border-base-300">
                      <div className="text-[10px] uppercase text-base-content/60 font-semibold">
                        Daily Rental
                      </div>
                      <div className="font-mono font-bold text-sm text-primary mt-0.5">
                        ₹{(item.rentalRatePaise / 100).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-base-200/50 border border-base-300">
                      <div className="text-[10px] uppercase text-base-content/60 font-semibold">
                        Purchase Price
                      </div>
                      <div className="font-mono font-bold text-sm text-base-content mt-0.5">
                        ₹{(item.buyPricePaise / 100).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Button
                  size="xs"
                  variant="primary"
                  className="w-full"
                  leftIcon={<FaCartShopping />}
                  onClick={() => handleReserve(item.name)}
                >
                  Reserve at Club Desk
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PublicShopPage;
