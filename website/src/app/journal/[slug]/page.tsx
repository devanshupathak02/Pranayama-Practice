import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types";
import { getPosts, getPostBySlug } from "@/lib/wordpress/posts";
import { ArticleCard } from "@/components/ArticleCard";
import { Clock, Calendar, ArrowLeft, Wind, ArrowRight } from "lucide-react";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getPosts();
  return articles.map((a: Article) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPostBySlug(slug);
  if (!article) return { title: "Article Not Found | Still Mountain" };

  return {
    title: `${article.title} — Still Mountain Journal`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.featuredImage],
      type: "article",
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getPostBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = await getPosts({ limit: 4 });
  const relatedArticles = allArticles
    .filter((a: Article) => a.id !== article.id)
    .slice(0, 2);

  return (
    <div className="pt-28 sm:pt-36 pb-20">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back Link */}
        <div>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#82947A] hover:text-[#263F35] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#FAF7F2] text-[#263F35] border border-[#D6C6A5] px-3.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
              {article.category}
            </span>
            <span className="text-xs text-[#82947A] flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readingTime}</span>
            </span>
            <span className="text-xs text-[#82947A] flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{article.publishedAt}</span>
            </span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-[#263F35] leading-[1.12]">
            {article.title}
          </h1>

          <p className="text-[#355245] text-lg sm:text-xl leading-relaxed italic font-serif">
            {article.excerpt}
          </p>

          {/* Author Bar */}
          <div className="pt-4 pb-2 border-y border-[#D6C6A5]/50 flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#D6C6A5]">
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#263F35] block">
                {article.author.name}
              </span>
              <span className="text-xs text-[#82947A] block">
                {article.author.role} &bull; Still Mountain Faculty
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative h-72 sm:h-[420px] rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#D6C6A5]">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
          />
        </div>

        {/* Article Body */}
        <div
          className="prose prose-lg max-w-none text-[#355245] leading-relaxed space-y-6 pt-4 font-normal"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-6 border-t border-[#D6C6A5]/50 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#82947A] font-medium mr-1">Topics:</span>
            {article.tags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#FAF7F2] border border-[#D6C6A5] rounded-lg text-xs font-medium text-[#263F35]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Inline Practice CTA Banner */}
        <div className="bg-[#FAF7F2] border border-[#D6C6A5] rounded-3xl p-7 sm:p-8 space-y-4 my-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#82947A]">
            <Wind className="w-3.5 h-3.5" />
            <span>Experiential Application</span>
          </div>

          <h3 className="font-serif font-bold text-2xl text-[#263F35]">
            Put Conscious Breathing into Practice Today
          </h3>

          <p className="text-sm text-[#355245] leading-relaxed">
            Move beyond intellectual reading. Open our distraction-free Pranayama Timer to practice structured 6-stage sequences with temple bell chimes.
          </p>

          <div className="pt-2">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 bg-[#263F35] hover:bg-[#1A2D25] text-[#FAF7F2] px-6 py-3 rounded-xl font-medium text-sm transition-colors"
            >
              <span>Open Pranayama Timer</span>
              <ArrowRight className="w-4 h-4 text-[#D6C6A5]" />
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="pt-10 border-t border-[#D6C6A5] space-y-6">
            <h3 className="font-serif font-bold text-2xl text-[#263F35]">
              Related Essays
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedArticles.map((rel: Article) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
