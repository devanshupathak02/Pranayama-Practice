import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types";
import { Clock, ArrowRight } from "lucide-react";

interface Props {
  article: Article;
  featured?: boolean;
}

export const ArticleCard: React.FC<Props> = ({ article, featured = false }) => {
  if (featured) {
    return (
      <article className="group bg-[#FAF7F2] rounded-3xl border border-[#D6C6A5] overflow-hidden shadow-xs hover:border-[#82947A] transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
        <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-[#EDE8DC]">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover group-hover:scale-102 transition-transform duration-700"
          />
        </div>
        <div className="lg:col-span-5 flex flex-col justify-between py-2">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-[#EDE8DC] text-[#263F35] border border-[#D6C6A5] px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                {article.category}
              </span>
              <span className="text-xs text-[#82947A] flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readingTime}</span>
              </span>
              <span className="text-xs text-[#82947A] font-medium">
                &bull; {article.publishedAt}
              </span>
            </div>

            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#263F35] group-hover:text-[#1A2D25] transition-colors leading-tight">
              <Link href={`/journal/${article.slug}`}>
                {article.title}
              </Link>
            </h3>

            <p className="text-[#355245] text-sm sm:text-base leading-relaxed line-clamp-3">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-6 border-t border-[#D6C6A5]/50 flex items-center justify-between mt-6">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#D6C6A5]">
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-medium text-[#263F35]">{article.author.name}</span>
            </div>

            <Link
              href={`/journal/${article.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#263F35] hover:text-[#82947A] group-hover:translate-x-0.5 transition-all"
            >
              <span>Read article</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-[#FAF7F2] rounded-3xl border border-[#D6C6A5] overflow-hidden shadow-xs hover:border-[#82947A] transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-[#EDE8DC]">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-103 transition-transform duration-700"
          />
        </div>

        <div className="p-6 sm:p-7 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="bg-[#EDE8DC] text-[#263F35] border border-[#D6C6A5] px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider">
              {article.category}
            </span>
            <span className="text-[11px] text-[#82947A] flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3" />
              <span>{article.readingTime}</span>
            </span>
          </div>

          <h3 className="font-serif font-bold text-xl text-[#263F35] group-hover:text-[#1A2D25] transition-colors leading-snug">
            <Link href={`/journal/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          <p className="text-[#355245] text-sm leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        </div>
      </div>

      <div className="px-6 sm:px-7 pb-6 pt-3 border-t border-[#D6C6A5]/40 flex items-center justify-between text-xs">
        <span className="text-[#82947A] font-medium">{article.publishedAt}</span>

        <Link
          href={`/journal/${article.slug}`}
          className="inline-flex items-center gap-1 font-medium text-[#263F35] group-hover:text-[#82947A] transition-colors"
        >
          <span>Read essay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
};
