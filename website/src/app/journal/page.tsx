import React from "react";
import type { Metadata } from "next";
import { getPosts } from "@/lib/wordpress/posts";
import { ArticleCard } from "@/components/ArticleCard";
import { AppCtaSection } from "@/components/AppCtaSection";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Breathwork Journal & Breath Science Essays",
  description:
    "Essays and research on classical pranayama, the neurobiology of slow exhalations, and restorative yoga nidra.",
};

export default async function JournalPage() {
  const articles = await getPosts();
  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);


  return (
    <div className="space-y-20 py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Section */}
        <div className="max-w-3xl space-y-5">
          <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Still Mountain Journal
          </span>
          <h1 className="font-serif font-extrabold text-4xl sm:text-6xl text-slate-950 leading-tight">
            The Science & Spirit of Classical Pranayama.
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">
            In-depth writings exploring the intersection of authentic Himalayan breath traditions, vagus nerve physiology, and the contemplative practice of stillness.
          </p>
        </div>

        {/* Featured Article Card */}
        {featuredArticle && (
          <div>
            <ArticleCard article={featuredArticle} featured={true} />
          </div>
        )}

        {/* All Articles Grid */}
        <div className="space-y-6 pt-6">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-950 border-b border-slate-200 pb-4">
            Recent Publications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </div>

      {/* App CTA */}
      <AppCtaSection />
    </div>
  );
}
