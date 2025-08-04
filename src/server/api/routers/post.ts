import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const proteinRouter = createTRPCRouter({
  // User management
  getOrCreateUser: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    // Get user info from Clerk
    const { currentUser } = await import("@clerk/nextjs/server");
    const clerkUser = await currentUser();

    if (!clerkUser) {
      throw new Error("User not found");
    }

    // Check if user exists in our database
    let dbUser = await ctx.db.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true },
    });

    // Create user if doesn't exist
    dbUser ??= await ctx.db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      },
      include: { profile: true },
    });

    return dbUser;
  }),

  // Profile management
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    const user = await ctx.db.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true },
    });

    return user?.profile ?? null;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        weight: z.number().optional(),
        height: z.number().optional(),
        age: z.number().optional(),
        activityLevel: z
          .enum([
            "sedentary",
            "lightly_active",
            "moderately_active",
            "very_active",
            "extremely_active",
          ])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const user = await ctx.db.user.findUnique({
        where: { clerkId: userId },
        include: { profile: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.profile) {
        return await ctx.db.profile.update({
          where: { id: user.profile.id },
          data: input,
        });
      } else {
        return await ctx.db.profile.create({
          data: {
            ...input,
            userId: user.id,
          },
        });
      }
    }),

  // Daily goals
  getDailyGoal: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;

      const user = await ctx.db.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) return null;

      const goal = await ctx.db.dailyGoal.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: input.date,
          },
        },
      });

      return goal ?? null;
    }),

  setDailyGoal: protectedProcedure
    .input(
      z.object({
        targetProtein: z.number().min(0),
        date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const user = await ctx.db.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return await ctx.db.dailyGoal.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: input.date,
          },
        },
        update: { targetProtein: input.targetProtein },
        create: {
          userId: user.id,
          targetProtein: input.targetProtein,
          date: input.date,
        },
      });
    }),

  // Protein entries
  getProteinEntries: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;

      const user = await ctx.db.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) return [];

      return await ctx.db.proteinEntry.findMany({
        where: {
          userId: user.id,
          date: input.date,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  addProteinEntry: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(0),
        mealName: z.string().optional(),
        description: z.string().optional(),
        date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const user = await ctx.db.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return await ctx.db.proteinEntry.create({
        data: {
          userId: user.id,
          amount: input.amount,
          mealName: input.mealName,
          description: input.description,
          date: input.date,
        },
      });
    }),

  deleteProteinEntry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const user = await ctx.db.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify the entry belongs to the user
      const entry = await ctx.db.proteinEntry.findFirst({
        where: {
          id: input.id,
          userId: user.id,
        },
      });

      if (!entry) {
        throw new Error("Entry not found");
      }

      return await ctx.db.proteinEntry.delete({
        where: { id: input.id },
      });
    }),

  // Preset meals
  getPresetMeals: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    const user = await ctx.db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return [];

    const [userMeals, publicMeals] = await Promise.all([
      ctx.db.presetMeal.findMany({
        where: { userId: user.id },
      }),
      ctx.db.presetMeal.findMany({
        where: { isPublic: true },
      }),
    ]);

    return [...userMeals, ...publicMeals];
  }),

  addPresetMeal: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        proteinAmount: z.number().min(0),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const user = await ctx.db.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return await ctx.db.presetMeal.create({
        data: {
          userId: user.id,
          name: input.name,
          proteinAmount: input.proteinAmount,
          description: input.description,
          isPublic: input.isPublic,
        },
      });
    }),

  deletePresetMeal: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const user = await ctx.db.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify the meal belongs to the user
      const meal = await ctx.db.presetMeal.findFirst({
        where: {
          id: input.id,
          userId: user.id,
        },
      });

      if (!meal) {
        throw new Error("Meal not found");
      }

      return await ctx.db.presetMeal.delete({
        where: { id: input.id },
      });
    }),

  // Summary data
  getDailySummary: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;

      const user = await ctx.db.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) return null;

      const [entries, goal] = await Promise.all([
        ctx.db.proteinEntry.findMany({
          where: {
            userId: user.id,
            date: input.date,
          },
        }),
        ctx.db.dailyGoal.findUnique({
          where: {
            userId_date: {
              userId: user.id,
              date: input.date,
            },
          },
        }),
      ]);

      const totalProtein = entries.reduce(
        (sum, entry) => sum + entry.amount,
        0,
      );
      const targetProtein = goal?.targetProtein ?? 0;
      const remaining = Math.max(0, targetProtein - totalProtein);
      const percentage =
        targetProtein > 0 ? (totalProtein / targetProtein) * 100 : 0;

      return {
        totalProtein,
        targetProtein,
        remaining,
        percentage: Math.min(100, percentage),
        entries,
        goal,
      };
    }),
});
