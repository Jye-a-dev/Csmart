import { Category } from '@/types/entities/category';
import { Product } from '@/types/entities/product';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, FolderOpen, FolderTree, Tag } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  categories: Category[];
  products: Product[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onViewChildren?: (category: Category) => void;
}

export default function CategoryCard({
  category,
  categories,
  products,
  onEdit,
  onDelete,
  onViewChildren
}: CategoryCardProps) {
  const router = useRouter();

  // Find sub-categories under this category
  const subCategories = categories.filter(c => c.parent_id === category.id);
  const hasChildren = subCategories.length > 0;

  // Find parent category name
  const getParentName = () => {
    if (!category.parent_id) return null;
    const parent = categories.find(c => c.id === category.parent_id);
    return parent ? parent.name : `#${category.parent_id}`;
  };

  // Count products in this category (or child categories)
  const productCount = products.filter(p => p.category_id === category.id).length;
  const parentName = getParentName();

  const handleMainAction = () => {
    if (hasChildren) {
      if (onViewChildren) {
        onViewChildren(category);
      } else if (subCategories.length > 0) {
        router.push(`/products/category/${subCategories[0].slug}`);
      }
    } else {
      router.push(`/products/category/${category.slug}`);
    }
  };

  return (
    <div className="border-4 border-[#09090B] bg-white p-6 shadow-[6px_6px_0px_0px_#09090B] flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#09090B] transition-all min-h-60">
      <div>
        <div className="flex justify-between items-start mb-3 border-b-2 border-dashed border-[#09090B]/10 pb-3">
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] font-bold uppercase">
            <Tag size={12} className="text-[#F97316]" />
            SLUG: {category.slug}
          </div>
        </div>

        <h3 className="text-lg font-black text-[#09090B] uppercase tracking-tight line-clamp-1 mb-1">
          {category.name}
        </h3>
        
        <div className="font-mono text-xs text-zinc-400 mb-3 line-clamp-1">
          /{category.slug}
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3 font-sans min-h-12 mb-3">
          {category.description || <span className="italic text-zinc-300">Không có mô tả chi tiết.</span>}
        </p>

        {(category.image_url_1 || category.image_url_2) && (
          <div className="flex gap-2 my-2 pt-2 border-t border-zinc-100">
            {category.image_url_1 && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={category.image_url_1}
                alt={`${category.name} 1`}
                className="w-12 h-12 object-cover border-2 border-[#09090B] bg-zinc-50"
              />
            )}
            {category.image_url_2 && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={category.image_url_2}
                alt={`${category.name} 2`}
                className="w-12 h-12 object-cover border-2 border-[#09090B] bg-zinc-50"
              />
            )}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t-2 border-dashed border-[#09090B]/10 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs font-mono">
          {hasChildren ? (
            <>
              <span className="text-zinc-500">Danh mục con hiện có:</span>
              <strong className="text-[#F97316] font-bold">{subCategories.length} danh mục con</strong>
            </>
          ) : (
            <>
              <span className="text-zinc-500">Sản phẩm hiện có:</span>
              <strong className="text-[#09090B]">{productCount} sản phẩm</strong>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleMainAction}
            className={`flex-1 py-2.5 border-2 border-[#09090B] text-white font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer ${
              hasChildren ? 'bg-[#F97316] hover:bg-orange-600 text-[#09090B]' : 'bg-[#09090B] hover:bg-zinc-800'
            }`}
          >
            {hasChildren ? <FolderTree size={14} /> : <FolderOpen size={14} />}
            {hasChildren ? 'Xem danh mục con' : 'Xem sản phẩm'}
          </button>
          
          <button
            onClick={() => onEdit(category)}
            className="p-2 border-2 border-[#09090B] bg-[#FAFAFA] text-[#09090B] hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            title="Sửa danh mục"
          >
            <Edit size={14} />
          </button>
          
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 border-2 border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            title="Xóa danh mục"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
