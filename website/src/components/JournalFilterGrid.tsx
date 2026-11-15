"use client";

import React, { useState, useMemo } from "react";
import { Article } from "@/types";
import { ArticleCard } from "@/components/ArticleCard";
import { Search, X } from "lucide-react";

interface Props {
  initialArticles: Article[];
}

export const JournalFilterGrid: React.FC<Props> = ({ initialArticles }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Extract unique categories supported by actual content
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("All");
    initialArticles.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [initialArticles]);

  // Filter articles based on category and search query
  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const matchesCategory =
        selectedCategory === "All" || article.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [initialArticles, selectedCategory, searchQuery]);

  const featuredArticle = filteredArticles.length > 0 && selectedCategory === "All" && searchQuery === ""
    ? filteredArticles[0]
    : null;

  const regularArticles = featuredArticle
    ? filteredArticles.slice(1)
    : filteredArticles;

  return (
    <div className="space-y-10">
      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D6C6A5]">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#263F35] ${
                selectedCategory === cat
                  ? "bg-[#263F35] text-[#FAF7F2] shadow-xs"
                  : "bg-[#FAF7F2] text-[#355245] border border-[#D6C6A5] hover:border-[#82947A]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#82947A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search essays or topics..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#FAF7F2] border border-[#D6C6A5] focus:border-[#263F35] rounded-xl text-xs sm:text-sm text-[#263F35] placeholder:text-[#82947A] focus:outline-none focus:ring-1 focus:ring-[#263F35] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#82947A] hover:text-[#263F35]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Featured Article when browsing All with no search */}
      {featuredArticle && (
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#82947A] block">
            Featured Essay
          </span>
          <ArticleCard article={featuredArticle} featured={true} />
        </div>
      )}

      {/* Main Grid */}
      <div className="space-y-6">
        {featuredArticle && (
          <h2 className="font-serif font-bold text-2xl text-[#263F35] pt-4">
            Recent Publications
          </h2>
        )}

        {filteredArticles.length === 0 ? (
          <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-12 text-center space-y-3">
            <h3 className="font-serif font-bold text-xl text-[#263F35]">
              No articles found
            </h3>
            <p className="text-sm text-[#355245]">
              No publications matched your search query &ldquo;{searchQuery}&rdquo;. Try clearing filters or exploring other topics.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-2 inline-flex items-center gap-2 bg-[#263F35] text-[#FAF7F2] px-5 py-2.5 rounded-xl text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
