
interface EquipmentCategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const EquipmentCategoryTabs = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: EquipmentCategoryTabsProps) => {
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
