import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const published = searchParams.get("published");
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");
    
    const prisma = getPrisma();

    // Get single post by id
    if (id) {
        const post = await prisma.blogPost.findUnique({
            where: { id },
            include: { author: { select: { fullName: true } } }
        });
        return NextResponse.json({ post });
    }

    // Get single post by slug
    if (slug) {
        const post = await prisma.blogPost.findUnique({
            where: { slug },
            include: { author: { select: { fullName: true } } }
        });
        return NextResponse.json({ post });
    }

    // Get list
    const whereClause: any = {};
    if (published === "true") whereClause.published = true;

    const posts = await prisma.blogPost.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { fullName: true } } }
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("BLOG_API_GET_ERROR", error);
    return NextResponse.json({ error: "Ralat mengambil data blog" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // NOTE: Authentication removed for MVP. 
    // Ideally use session or JWT token here.
    
    const body = await req.json();
    const { title, content, image, published, excerpt } = body;

    const prisma = getPrisma();

    // Fallback: Find first admin user to assign as author
    const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" }
    });

    if (!admin) {
        return NextResponse.json({ error: "Tiada admin dijumpai untuk dijadikan penulis." }, { status: 400 });
    }

    // Simple slug generation
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Date.now();

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 150) + "...",
        image,
        published: published || false,
        authorId: admin.id,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("BLOG_API_POST_ERROR", error);
    return NextResponse.json({ error: "Ralat mencipta blog" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    try {
      const body = await req.json();
      const { id, title, content, image, published, excerpt } = body;
  
      if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
  
      const prisma = getPrisma();
      const post = await prisma.blogPost.update({
        where: { id },
        data: {
          title,
          content,
          excerpt,
          image,
          published
        },
      });
  
      return NextResponse.json({ success: true, post });
    } catch (error) {
      console.error("BLOG_API_PUT_ERROR", error);
      return NextResponse.json({ error: "Ralat mengemaskini blog" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

        const prisma = getPrisma();
        await prisma.blogPost.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("BLOG_API_DELETE_ERROR", error);
        return NextResponse.json({ error: "Ralat memadam blog" }, { status: 500 });
    }
}
