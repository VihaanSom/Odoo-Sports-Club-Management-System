import {  useState  } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { FaTrophy, FaBoxesStacked, FaPlus } from 'react-icons/fa6';

import { Button } from '@/components/ui';
import { mockEquipment } from '@/mock';
import type { Equipment } from '@/types';
import type { CreateEquipmentPayload, UpdateEquipmentPayload } from '@/types/equipment';
import { equipmentService } from '@/services/equipmentService';
import { EquipmentTable, EquipmentCategoryTabs, EquipmentFormModal } from './components';

export const EquipmentPage = () => {
  const [items, setItems] = useState<Equipment[]>(mockEquipment);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['All', 'Rackets', 'Balls', 'Protective Gear', 'Gym Accessories', 'Court Accessories'];

  const filtered = items.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const handleRent = (id: string, name: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.quantityAvailable > 0) {
          return { ...item, quantityAvailable: item.quantityAvailable - 1 };
        }
        return item;
      })
    );
    toast.success(`Issued 1x ${name} to member.`);
  };

  const handleReturn = (id: string, name: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.quantityAvailable < item.quantityTotal) {
          return { ...item, quantityAvailable: item.quantityAvailable + 1 };
        }
        return item;
      })
    );
    toast.success(`Returned 1x ${name} to club stock.`);
  };

  const handleCreateEquipment = async (
    payload: CreateEquipmentPayload | UpdateEquipmentPayload
  ) => {
    try {
      const created = await equipmentService.createEquipment(payload as CreateEquipmentPayload);
      const newLegacyItem: Equipment = {
        id: `EQ-0${items.length + 1}`,
        name: created.name,
        category: (created.category === 'racket' ? 'Rackets' : created.category === 'ball' ? 'Balls' : 'Gym Accessories') as any,
        quantityTotal: created.stockQty,
        quantityAvailable: created.stockQty,
        condition: (created.condition || 'Excellent') as any,
        rentalRate: Math.round((created.rentalRatePaise || 0) / 100),
      };
      setItems((prev) => [newLegacyItem, ...prev]);
      toast.success('Equipment item created');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create equipment');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FaTrophy className="size-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              Equipment & Rentals
            </h1>
          </div>
          <p className="text-sm text-base-content/70 mt-1">
            Track sports gear, monitor condition status, and record checkouts and returns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            leftIcon={<FaBoxesStacked className="size-4" />}
            onClick={() => toast('Odoo inventory sync triggered')}
          >
            Sync Inventory
          </Button>
          <Button
            variant="primary"
            leftIcon={<FaPlus className="size-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            New Equipment
          </Button>
        </div>
      </div>

      <EquipmentCategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <EquipmentTable
        items={filtered}
        onRent={handleRent}
        onReturn={handleReturn}
      />

      <EquipmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEquipment}
      />
    </motion.div>
  );
};

export default EquipmentPage;

