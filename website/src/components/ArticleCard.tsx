import React from "react";
import Link from "next/link";
import { Article } from "@/types";
import { Clock, ArrowRight } from "lucide-react";

interface Props {
  article: Article;
  featured?: boolean;
}

export const ArticleCard: React.FC<Props> = ({ article, featured = false }) => {
  if (featured) {
    return (
      <div className="group bg-gradient-to-br from-[#C8F3FF]/50 to-white rounded-3xl border border-[#8EE0F7] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
        <div className="lg:col-span-6 relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="lg:col-span-6 flex flex-col justify-between py-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-[#FF5C23]/10 text-[#FF5C23] border border-[#FF5C23]/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {article.category}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readingTime}</span>
              </span>
            </div>

            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 group-hover:text-[#FF5C23] transition-colors leading-tight">
              {article.title}
            </h3>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200/80 flex items-center justify-between mt-4">
            <div className="flex items-center gap-2.5">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-semibold text-slate-800">{article.author.name}</span>
            </div>

            <Link
              href={`/journal/${article.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF5C23] group-hover:underline"
            >
              <span>Read Article</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#8EE0F7] transition-all duration-300 flex flex-col h-full">
      {/* Article Image */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {article.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{article.publishedAt}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{article.readingTime}</span>
            </span>
          </div>

          <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-[#FF5C23] transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">{article.author.name}</span>
          <Link
            href={`/journal/${article.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5C23] group-hover:underline"
          >
            <span>Read More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
