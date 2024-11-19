import { Hono } from "hono";
import authMiddleware from "../Middlewares/AuthMiddleware";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", authMiddleware);

// 1) Creating a blog post :
blogRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const authorId = c.get("userId");

  const createBlogPost = await prisma.post.create({
    data: {
      authorId: authorId,
      title: body.title,
      content: body.content,
    },
  });

  return c.json({
    id: createBlogPost.id,
    message: "Blog created successfully!!",
  });
});

// 2) To update the existing blog post :
blogRouter.put("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const updateBlogPost = await prisma.post.update({
    where: {
      id: body.id,
    },
    data: {
      title: body?.title,
      content: body?.content,
    },
  });

  return c.json({
    id: updateBlogPost.id,
    message: "Blog updated successfully!",
  });
});

// 3) To get all the blog post :

// Feature to add : pagination
blogRouter.get("/bulk", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const allBlogPost = await prisma.post.findMany();
    
    return c.json({
      blogs: allBlogPost,
    });
});

// 4) To get the specific blog post :
blogRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = c.req.param("id");

  try {
    const getBlogPost = await prisma.post.findFirst({
      where: {
        id: id,
      },
    });

    return c.json({
      Blog: getBlogPost,
    });
  } catch (error) {
    c.status(411);
    return c.json({
      message: "Error while fetching blog post",
    });
  }
});

export default blogRouter;