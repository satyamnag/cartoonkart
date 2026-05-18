"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, [clearCloseTimeout]);

  const openMenu = useCallback(() => {
    clearCloseTimeout();
    if (category.subcategories?.length) {
      setIsOpen(true);
    }
  }, [category.subcategories, clearCloseTimeout]);

  const closeMenu = useCallback(() => {
    scheduleClose();
  }, [scheduleClose]);

  const toggleMenu = useCallback(() => {
    clearCloseTimeout();
    if (category.subcategories?.length) {
      setIsOpen((prev) => !prev);
    }
  }, [category.subcategories, clearCloseTimeout]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const hasSubcategories = category.subcategories && category.subcategories.length > 0;

  return (
    <div
      className="relative"
      ref={containerRef}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <div className="relative">
        {hasSubcategories ? (
          <Button
            type="button"
            variant="elevated"
            onClick={toggleMenu}
            className={cn(
              "h-11 px-4 bg-transparent border-transparent rounded-full text-black cursor-pointer",
              "hover:bg-white hover:border-primary",
              "hover:!translate-x-0 hover:!translate-y-0",
              isActive && !isNavigationHovered && "bg-white border-primary",
              isOpen && "bg-white border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            )}
          >
            {category.name}
          </Button>
        ) : (
          <Button
            variant="elevated"
            asChild
            className={cn(
              "h-11 px-4 bg-transparent border-transparent rounded-full text-black",
              "hover:bg-white hover:border-primary hover:!translate-x-0 hover:!translate-y-0",
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
        onClose={() => setIsOpen(false)}
        onMouseEnter={openMenu}
        onMouseLeave={closeMenu}
      />
    </div>
  );
};