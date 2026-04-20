import { getCategoryInfo } from '../utils/format';

const CategoryIcon = ({ category, size = 44 }) => {
  const { emoji, color } = getCategoryInfo(category);

  return (
    <div
      className="category-icon"
      style={{
        width: size,
        height: size,
        backgroundColor: color + '33',
        border: `1px solid ${color}55`,
      }}
    >
      {emoji}
    </div>
  );
};

export default CategoryIcon;
