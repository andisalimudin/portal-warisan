import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const prisma = getPrisma();
    const postId = context.params.id;

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        author: true,
        category: true,
        likes: true,
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Topik tidak dijumpai." },
        { status: 404 }
      );
    }

    const comments = post.comments.map((c) => ({
      id: c.id,
      author: c.author.fullName,
      authorRole: c.author.role,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      likes: c.likes.length,
    }));

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author.fullName,
        authorRole: post.author.role,
        categoryId: post.categoryId,
        categoryName: post.category.name,
        createdAt: post.createdAt.toISOString(),
        likes: post.likes.length,
        comments,
      },
    });
  } catch (error) {
    console.error("FORUM_DETAIL_ERROR", error);

    return NextResponse.json(
      { error: "Ralat pelayan. Sila cuba lagi sebentar lagi." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const prisma = getPrisma();
    const postId = context.params.id;
    const body = await req.json().catch(() => ({}));

    const userId =
      typeof body.userId === "string" && body.userId.trim()
        ? (body.userId as string)
        : null;
    const content =
      typeof body.content === "string" && body.content.trim()
        ? (body.content as string).trim()
        : null;

    if (!userId || !content) {
      return NextResponse.json(
        { error: "Data komen tidak lengkap." },
        { status: 400 }
      );
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Topik tidak dijumpai." },
        { status: 404 }
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

    const comment = await prisma.forumComment.create({
      data: {
        content,
        postId,
        authorId: userId,
      },
      include: {
        author: true,
        likes: true,
      },
    });

    return NextResponse.json({
      comment: {
        id: comment.id,
        author: comment.author.fullName,
        authorRole: comment.author.role,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        likes: comment.likes.length,
      },
    });
  } catch (error) {
    console.error("FORUM_COMMENT_CREATE_ERROR", error);

    return NextResponse.json(
      { error: "Ralat semasa menambah komen." },
      { status: 500 }
    );
  }
}

