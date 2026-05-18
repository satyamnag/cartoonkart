"use client";

import Link from "next/link";
import { useRef, useState, useCallback } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { CategoriesGetManyOutput } from "@/modules/categories/types";

import { SubcategoryMenu } from "./subcategory-menu";

interface Props {
  category: CategoriesGetManyOutput[1];
  isActive?: boolean;
  isNavigationHovered?: boolean;
}

export const CategoryDropdown = ({
  category,
  isActive,
  isNavigationHovered,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimeout();
    if (category.subcategories) {
      setIsOpen(true);
    }
  }, [category.subcategories, clearCloseTimeout]);

  const closeMenu = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, [clearCloseTimeout]);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      openMenu();
    }
  }, [isOpen, openMenu]);

  const handleSubcategoryMenuEnter = () => {
    clearCloseTimeout();
  };

  const handleSubcategoryMenuLeave = () => {
    closeMenu();
  };

  const hasSubcategories = category.subcategories && category.subcategories.length > 0;

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <div className="relative">
        {hasSubcategories ? (
          // For categories with subcategories, the button toggles the dropdown
          <Button
            variant="elevated"
            onClick={toggleMenu}
            className={cn(
              "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black cursor-pointer",
              isActive && !isNavigationHovered && "bg-white border-primary",
              isOpen &&
                "bg-white border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[4px] -translate-y-[4px]"
            )}
          >
            {category.name}
          </Button>
        ) : (
          // For categories without subcategories (or "all"), it's a direct link
          <Button
            variant="elevated"
            asChild
            className={cn(
              "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black",
              isActive && !isNavigationHovered && "bg-white border-primary"
            )}
          >
            <Link href={`/${category.slug === "all" ? "" : category.slug}`}>
              {category.name}
            </Link>
          </Button>
        )}
        {hasSubcategories && (
          <div
            className={cn(
              "opacity-0 absolute -bottom-3 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-black left-1/2 -translate-x-1/2",
              isOpen && "opacity-100"
            )}
          />
        )}
      </div>

      <SubcategoryMenu
        category={category}
        isOpen={isOpen}
        onMouseEnter={handleSubcategoryMenuEnter}
        onMouseLeave={handleSubcategoryMenuLeave}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};