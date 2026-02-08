"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
  displayNames?: Record<string, string>;
}

export default function FilterSection({
  title,
  items,
  selected,
  onToggle,
  displayNames
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-[#e8e6e3] pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-[#1a1a1a]"
      >
        {title}
        <ChevronDown className={`h-4 w-4 text-[#999] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2">
              {items.map((item) => (
                <label key={item} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(item)}
                    onChange={() => onToggle(item)}
                    className="h-4 w-4 rounded border-[#e8e6e3] text-[#0f3f44] focus:ring-[#0f3f44]"
                  />
                  <span className="text-sm text-[#666]">{displayNames?.[item] || item}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
