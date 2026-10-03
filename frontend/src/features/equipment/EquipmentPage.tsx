import React, { useState } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { FaDumbbell, FaBoxesStacked } from 'react-icons/fa6';
import { Button } from '@/components/ui';
import { mockEquipment } from '@/mock';
import type { Equipment } from '@/types';
import { EquipmentTable, EquipmentCategoryTabs } from './components';

export const EquipmentPage: React.FC = () => {
  const [items, setItems] = useState<Equipment[]>(mockEquipment);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FaDumbbell className="size-7 text-primary" /> Equipment & Rentals
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Track sports gear, monitor condition status, and record checkouts and returns.
          </p>
        </div>

        <Button
          variant="outline"
          leftIcon={<FaBoxesStacked className="size-4" />}
          onClick={() => toast('Odoo inventory sync triggered')}
        >
          Sync Inventory
        </Button>
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
    </motion.div>
  );
};

export default EquipmentPage;
