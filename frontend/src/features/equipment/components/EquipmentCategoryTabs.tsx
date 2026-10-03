import React from 'react';

interface EquipmentCategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const EquipmentCategoryTabs: React.FC<EquipmentCategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelectCategory(cat)}
          className={`btn btn-sm ${
            selectedCategory === cat ? 'btn-primary' : 'btn-outline border-base-300'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};
