import Link from "next/link";

import { Category } from "@/payload-types";

import { CategoriesGetManyOutput } from "@/modules/categories/types";

interface Props {
  category: CategoriesGetManyOutput[1];
  isOpen: boolean;
}

export const SubcategoryMenu = ({
  category,
  isOpen,
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
    >
      <div
        style={{ backgroundColor }}
        className="w-60 text-black rounded-md overflow-hidden border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div>
          {/* Parent category link */}
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