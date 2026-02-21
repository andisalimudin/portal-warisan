import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function buildExcerpt(content: string, maxLength: number = 180) {
  const plain = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength - 3) + "...";
}

export async function GET() {
  try {
    const prisma = getPrisma();

    let categories = await prisma.forumCategory.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (!categories.length) {
      await prisma.forumCategory.createMany({
        data: [
          {
            name: "Pengumuman Rasmi",
            description: "Pengumuman penting daripada kepimpinan parti dan pentadbiran.",
          },
          {
            name: "Dasar Parti",
            description: "Perbincangan mengenai dasar dan halatuju parti.",
          },
          {
            name: "Aduan & Cadangan",
            description: "Ruangan khas untuk aduan, cadangan dan pandangan akar umbi.",
          },
          {
            name: "Perbincangan Umum",
            description: "Topik umum berkaitan politik, komuniti dan isu semasa.",
          },
        ],
      });

      categories = await prisma.forumCategory.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    let posts = await prisma.forumPost.findMany({
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        author: true,
        category: true,
        likes: true,
        comments: true,
      },
    });

    if (!posts.length) {
      const author =
        (await prisma.user.findFirst({
          where: {
            role: {
              in: ["ADMIN_PUSAT", "ADMIN_NEGERI", "ADMIN_KAWASAN"],
            },
          },
          orderBy: { createdAt: "asc" },
        })) ||
        (await prisma.user.findFirst({
          orderBy: { createdAt: "asc" },
        }));

      if (author && categories.length) {
        const byName: Record<string, string> = {};
        for (const c of categories) {
          byName[c.name] = c.id;
        }

        const announcementCategoryId =
          byName["Pengumuman Rasmi"] || categories[0].id;
        const complaintsCategoryId =
          byName["Aduan & Cadangan"] || categories[0].id;
        const policyCategoryId =
          byName["Dasar Parti"] || categories[0].id;

        await prisma.forumPost.createMany({
          data: [
            {
              title: "Pengumuman: Jadual Mesyuarat Agung Tahunan 2026",
              content:
                "Assalamualaikum dan Salam Sejahtera kepada semua ahli N.52 Sungai Sibuga. Mesyuarat Agung Tahunan parti untuk tahun 2026 akan diadakan pada bulan Mac di Dewan Hakka, Kota Kinabalu. Semua perwakilan cawangan diwajibkan hadir.",
              authorId: author.id,
              categoryId: announcementCategoryId,
              isPinned: true,
            },
            {
              title: "Cadangan penambahbaikan sistem pendaftaran ahli baru",
              content:
                "Saya mencadangkan agar proses pengesahan OTP diperkemaskan untuk kawasan pedalaman yang mempunyai capaian internet terhad. Mungkin boleh dipertimbangkan kaedah pengesahan manual oleh Ketua Cawangan.",
              authorId: author.id,
              categoryId: complaintsCategoryId,
              isPinned: false,
            },
            {
              title: "Perbincangan Belanjawan Negeri Sabah 2026",
              content:
                "Apakah pandangan rakan-rakan mengenai peruntukan pembangunan luar bandar dalam Belanjawan Negeri Sabah 2026? Adakah cukup untuk kawasan Sandakan dan Kinabatangan?",
              authorId: author.id,
              categoryId: policyCategoryId,
              isPinned: false,
            },
          ],
        });

        posts = await prisma.forumPost.findMany({
          orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" },
          ],
          include: {
            author: true,
            category: true,
            likes: true,
            comments: true,
          },
        });
      }
    }

    const resultCategories = categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description || "",
    }));

    const resultPosts = posts.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: buildExcerpt(p.content),
      author: p.author.fullName,
      authorRole: p.author.role,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      likes: p.likes.length,
      comments: p.comments.length,
      createdAt: p.createdAt.toISOString(),
      isPinned: p.isPinned,
    }));

    return NextResponse.json({
      categories: resultCategories,
      posts: resultPosts,
    });
  } catch (error) {
    console.error("FORUM_LIST_ERROR", error);

    return NextResponse.json(
      { error: "Ralat pelayan. Sila cuba lagi sebentar lagi." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const userId =
      typeof body.userId === "string" && body.userId.trim()
        ? (body.userId as string)
        : null;
    const categoryId =
      typeof body.categoryId === "string" && body.categoryId.trim()
        ? (body.categoryId as string)
        : null;
    const title =
      typeof body.title === "string" && body.title.trim()
        ? (body.title as string).trim()
        : null;
    const content =
      typeof body.content === "string" && body.content.trim()
        ? (body.content as string).trim()
        : null;

    if (!userId || !categoryId || !title || !content) {
      return NextResponse.json(
        { error: "Data topik tidak lengkap." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak dijumpai." },
        { status: 404 }
      );
    }

    const category = await prisma.forumCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak dijumpai." },
        { status: 404 }
      );
    }

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        authorId: userId,
        categoryId,
      },
      include: {
        author: true,
        category: true,
        likes: true,
        comments: true,
      },
    });

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        excerpt: buildExcerpt(post.content),
        author: post.author.fullName,
        authorRole: post.author.role,
        categoryId: post.categoryId,
        categoryName: post.category.name,
        likes: post.likes.length,
        comments: post.comments.length,
        createdAt: post.createdAt.toISOString(),
        isPinned: post.isPinned,
      },
    });
  } catch (error) {
    console.error("FORUM_CREATE_ERROR", error);

    return NextResponse.json(
      { error: "Ralat semasa mencipta topik baru." },
      { status: 500 }
    );
  }
}

