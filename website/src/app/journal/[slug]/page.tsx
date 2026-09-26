import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPosts, getPostBySlug } from "@/lib/wordpress/posts";
import { ArticleCard } from "@/components/ArticleCard";
import { Clock, Calendar, ArrowLeft, Tag, Sparkles, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getPosts();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPostBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.featuredImage],
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
  const relatedArticles = allArticles.filter((a) => a.id !== article.id).slice(0, 2);


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Back Link */}
      <div>
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#FF5C23] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-[#C8F3FF] text-[#092832] border border-[#8EE0F7] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            {article.category}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#FF5C23]" />
            <span>{article.readingTime}</span>
          </span>
        </div>

        <h1 className="font-serif font-extrabold text-3xl sm:text-5xl text-slate-950 leading-tight">
          {article.title}
        </h1>

        {/* Author / Date Bar */}
        <div className="flex items-center justify-between border-y border-slate-200 py-4">
          <div className="flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <span className="text-sm font-bold text-slate-900 block">{article.author.name}</span>
              <span className="text-xs text-slate-500">{article.author.role}</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{article.publishedAt}</span>
          </div>
        </div>
      </div>

      {/* Featured Hero Image */}
      <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Content Renderer (HTML-ready for future WordPress REST API payload) */}
      <article
        className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-950 prose-a:text-[#FF5C23] prose-blockquote:border-l-[#FF5C23] prose-blockquote:bg-[#C8F3FF]/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Tags Section */}
      <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-2">
        <Tag className="w-4 h-4 text-[#FF5C23] mr-1" />
        {article.tags.map((tag, idx) => (
          <span
            key={idx}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold transition-colors"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* In-Article PWA Callout Card */}
      <div className="bg-gradient-to-br from-[#C8F3FF] to-white p-8 rounded-3xl border border-[#8EE0F7] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#092832]">
            Practice This Sequence
          </span>
          <h3 className="font-serif font-bold text-xl text-slate-950">
            Guided 1:2 Ratios in the Pranayama PWA
          </h3>
          <p className="text-xs text-slate-600 max-w-md">
            Let acoustic bells hold your countdown while your eyes remain peacefully closed. Free on any device.
          </p>
        </div>

        <a
          href={siteConfig.pwaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#FF5C23] hover:bg-[#E04B14] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-[#FF5C23]/25 hover:shadow-lg transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Practice</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="pt-12 border-t border-slate-200 space-y-6">
          <h2 className="font-serif font-bold text-2xl text-slate-950">
            Continue Reading
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedArticles.map((rel) => (
              <ArticleCard key={rel.id} article={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
