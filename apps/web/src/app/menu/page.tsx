'use client';

import React, { useEffect, useState } from 'react';
import { Coffee, Plus, Check, Sparkles, Filter, X } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';

export default function MenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    fetch(`${apiUrl}/menu`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCategories(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const openCustomizer = (product: any) => {
    setSelectedProduct(product);
    // Initialize default options
    const defaults: Record<string, any> = {};
    if (product.optionGroups) {
      product.optionGroups.forEach((grp: any) => {
        if (grp.minSelect > 0 && grp.options?.length > 0) {
          defaults[grp.id] = grp.options[0];
        }
      });
    }
    setSelectedOptions(defaults);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const chosenOptionList = Object.values(selectedOptions).filter(Boolean).map((opt: any) => ({
      groupId: opt.groupId,
      groupName: 'Customization',
      optionId: opt.id,
      optionName: opt.name,
      priceDeltaMinor: opt.priceDeltaMinor,
    }));

    const optionsTotal = chosenOptionList.reduce((acc, opt) => acc + opt.priceDeltaMinor, 0);
    const lineTotalMinor = selectedProduct.basePriceMinor + optionsTotal;

    addItem({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productImage: selectedProduct.imageUrl,
      basePriceMinor: selectedProduct.basePriceMinor,
      quantity: 1,
      selectedOptions: chosenOptionList,
      lineTotalMinor,
    });

    setSelectedProduct(null);
  };

  const filteredCategories =
    activeCategorySlug === 'all'
      ? categories
      : categories.filter((c) => c.slug === activeCategorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest uppercase text-amber-500">
          Seasonal & Estate Catalog
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Roastery Menu
        </h1>
        <p className="text-sm text-stone-400">
          Every cup is calibrated to order. Select your roast, customize milk and extraction profile, and add to your order.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategorySlug('all')}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategorySlug === 'all'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40'
              : 'bg-stone-900/80 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          All Offerings
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategorySlug(cat.slug)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategorySlug === cat.slug
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40'
                : 'bg-stone-900/80 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Categories and Products */}
      {isLoading ? (
        <div className="text-center py-24 text-stone-500">
          <Coffee className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-500" />
          <p className="text-sm">Connecting to roastery catalog...</p>
        </div>
      ) : (
        <div className="space-y-16">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-6">
              <div className="border-b border-stone-800 pb-3 flex items-baseline justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white">{category.name}</h2>
                  {category.description && (
                    <p className="text-xs text-stone-400 mt-0.5">{category.description}</p>
                  )}
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  {category.products?.length || 0} items
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.products?.map((product: any) => (
                  <div
                    key={product.id}
                    id={product.slug}
                    className="card-gradient rounded-2xl p-5 flex flex-col justify-between hover:border-amber-600/40 transition-all duration-300"
                  >
                    <div className="flex gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-24 h-24 rounded-xl object-cover bg-stone-900 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-base font-bold text-white truncate">
                            {product.name}
                          </h3>
                        </div>
                        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {product.dietaryNotes?.map((note: string) => (
                            <span
                              key={note}
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-900 text-amber-300/80 border border-stone-800"
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-800/80 mt-4 flex items-center justify-between">
                      <span className="font-semibold text-amber-400 text-sm">
                        ₹{(product.basePriceMinor / 100).toFixed(2)}
                      </span>

                      <button
                        onClick={() => openCustomizer(product)}
                        className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-amber-600 border border-stone-800 hover:border-amber-500 text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Customize & Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Customizer Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl p-6 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4 items-center">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-16 h-16 rounded-xl object-cover bg-stone-900"
              />
              <div>
                <h3 className="font-serif text-lg font-bold text-white">{selectedProduct.name}</h3>
                <p className="text-xs text-amber-400 font-semibold">
                  Base ₹{(selectedProduct.basePriceMinor / 100).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Option Groups */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {selectedProduct.optionGroups?.map((grp: any) => (
                <div key={grp.id} className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-300 block">
                    {grp.name}
                  </label>
                  <div className="space-y-1.5">
                    {grp.options?.map((opt: any) => {
                      const isSelected = selectedOptions[grp.id]?.id === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [grp.id]: opt,
                            }))
                          }
                          className={`w-full p-2.5 rounded-xl border text-xs flex justify-between items-center transition-all ${
                            isSelected
                              ? 'bg-amber-950/40 border-amber-600 text-white font-semibold'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-amber-500 bg-amber-500' : 'border-stone-600'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 text-stone-950" />}
                            </span>
                            {opt.name}
                          </span>
                          <span>
                            {opt.priceDeltaMinor > 0
                              ? `+₹${(opt.priceDeltaMinor / 100).toFixed(2)}`
                              : 'Included'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg"
            >
              Add Customized Drink to Basket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

