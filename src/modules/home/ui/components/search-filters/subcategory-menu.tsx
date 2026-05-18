// src/modules/home/ui/components/search-filters/subcategory-menu.tsx
import Link from "next/link";

import { Category } from "@/payload-types";

import { CategoriesGetManyOutput } from "@/modules/categories/types";

interface Props {
  category: CategoriesGetManyOutput[1];
  isOpen: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const SubcategoryMenu = ({
  category,
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: Props) => {
  if (!isOpen || !category.subcategories || category.subcategories.length === 0) {
    return null;
  }

  const backgroundColor = "#F5F5F5";

  return (
    <div
      className="absolute z-100"
      style={{
        top: "100%",
        left: 0,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Invisible bridge – pointer-events-none so clicks pass through */}
      <div className="h-3 w-60 pointer-events-none" />
      <div
        style={{ backgroundColor }}
        className="w-60 text-black rounded-md overflow-hidden border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div>
          {/* Link to the parent category itself */}
          <Link
            href={`/${category.slug === "all" ? "" : category.slug}`}
            className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center font-medium border-b"
          >
            All {category.name}
          </Link>
          {category.subcategories?.map((subcategory: Category) => (
            <Link
              key={subcategory.slug}
              href={`/${category.slug}/${subcategory.slug}`}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center underline font-medium"
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};