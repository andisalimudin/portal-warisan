
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { getPrisma } from "@/lib/prisma";

// Force dynamic rendering to ensure we get fresh data
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  const prisma = getPrisma();
  const post = await prisma.blogPost.findUnique({
    where: {
      slug: slug,
      published: true, // Only show published posts
    },
    include: {
      author: {
        select: {
          fullName: true,
        },
      },
    },
  });

  return post;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Artikel Tidak Dijumpai",
    };
  }

  return {
    title: `${post.title} | Parti Warisan N.52 Sungai Sibuga`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-warisan-950 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali ke Utama</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Image
              src="/logo-warisan-sabah.svg"
              alt="Logo Parti Warisan Sabah"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-bold text-lg text-warisan-950 hidden sm:inline">PARTI WARISAN</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* Hero Image */}
          {post.image && (
            <div className="relative w-full h-64 md:h-96 bg-gray-200">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-10">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(post.createdAt).toLocaleDateString("ms-MY", {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              {post.author && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {post.author.fullName}
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              {post.title}
            </h1>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-warisan-600 hover:prose-a:text-warisan-700 prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </main>

      <footer className="bg-warisan-950 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-warisan-200">
            &copy; {new Date().getFullYear()} Parti Warisan N.52 Sungai Sibuga. Hak Cipta Terpelihara.
          </p>
        </div>
      </footer>
    </div>
  );
}
