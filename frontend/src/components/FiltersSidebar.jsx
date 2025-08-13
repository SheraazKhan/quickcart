// src/components/FiltersSidebar.jsx
import React, { useMemo, useState } from "react";

/**
 * Props:
 * - brands: string[]                        // optional
 * - selectedBrands: string[]                // controlled
 * - setSelectedBrands: (arr: string[]) => void
 * - inStockOnly: boolean                    // controlled
 * - setInStockOnly: (val: boolean) => void
 * - sort?: "popular" | "price-asc" | "price-desc"
 * - setSort?: (val: string) => void
 * - priceRange?: { min: number; max: number }  // optional (if you want price filtering)
 * - setPriceRange?: (r: { min: number; max: number }) => void
 * - onClear?: () => void                    // optional
 */
export default function FiltersSidebar({
  brands = [],
  selectedBrands = [],
  setSelectedBrands = () => {},
  inStockOnly = false,
  setInStockOnly = () => {},
  sort,
  setSort,
  priceRange,
  setPriceRange,
  onClear,
}) {
  const [brandQuery, setBrandQuery] = useState("");

  const visibleBrands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b?.toLowerCase().includes(q));
  }, [brands, brandQuery]);

  const toggleBrand = (b) => {
    const s = new Set(selectedBrands);
    s.has(b) ? s.delete(b) : s.add(b);
    setSelectedBrands([...s]);
  };

  const clearAll = () => {
    setSelectedBrands([]);
    setInStockOnly(false);
    if (setSort) setSort("popular");
    if (setPriceRange && priceRange) setPriceRange({ min: 0, max: 0 });
    onClear?.();
  };

  return (
    <aside className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)] ring-1 ring-black/5 p-4 h-fit">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Filters</h3>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-indigo-600 hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* In-stock */}
      <label className="flex items-center gap-2 text-sm mb-4">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
        />
        In stock only
      </label>

      {/* Brand filter  */}
      {brands.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Brand</div>
          <input
            type="text"
            value={brandQuery}
            onChange={(e) => setBrandQuery(e.target.value)}
            placeholder="Search brands…"
            className="w-full mb-2 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <div className="space-y-2 max-h-44 overflow-auto pr-1">
            {visibleBrands.length === 0 ? (
              <div className="text-xs text-gray-500">No brands match.</div>
            ) : (
              visibleBrands.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => toggleBrand(b)}
                  />
                  {b}
                </label>
              ))
            )}
          </div>
        </div>
      )}

      {/* Price range  */}
      {priceRange && setPriceRange && (
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Price</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange({ ...priceRange, min: Number(e.target.value) || 0 })
              }
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="number"
              min={0}
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange({ ...priceRange, max: Number(e.target.value) || 0 })
              }
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      )}

      {/* Sort  */}
      {typeof sort !== "undefined" && setSort && (
        <>
          <div className="text-sm font-medium mb-1">Sort</div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="popular">Popularity</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </>
      )}
    </aside>
  );
}
