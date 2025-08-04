"use client";

import { useState } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { format } from "date-fns";
import { Plus, Target, TrendingUp, Utensils } from "lucide-react";

import { api } from "~/trpc/react";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);

  // Queries
  const { data: dailySummary, refetch: refetchSummary } =
    api.protein.getDailySummary.useQuery(
      { date: selectedDate },
      {
        enabled: isSignedIn && isLoaded,
        refetchOnWindowFocus: false,
      },
    );

  const { data: presetMeals } = api.protein.getPresetMeals.useQuery(undefined, {
    enabled: isSignedIn && isLoaded,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const addProteinEntry = api.protein.addProteinEntry.useMutation({
    onSuccess: () => {
      void refetchSummary();
      setShowAddEntry(false);
    },
  });

  const addPresetMeal = api.protein.addPresetMeal.useMutation({
    onSuccess: () => {
      setShowAddMeal(false);
    },
  });

  const deleteProteinEntry = api.protein.deleteProteinEntry.useMutation({
    onSuccess: () => {
      void refetchSummary();
    },
  });

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Protein Pulse
            </h1>
            <p className="mb-8 text-gray-600">
              Track your daily protein intake with ease
            </p>
            <SignInButton mode="modal">
              <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
                Get Started
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Protein Pulse
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/settings"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Settings
              </a>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Date Selector */}
        <div className="mb-8">
          <input
            type="date"
            value={format(selectedDate, "yyyy-MM-dd")}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Daily Summary */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Daily Goal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailySummary?.targetProtein ?? 0}g
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Consumed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailySummary?.totalProtein ?? 0}g
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <span className="text-sm font-medium text-gray-600">%</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(dailySummary?.percentage ?? 0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {dailySummary && dailySummary.targetProtein > 0 && (
          <div className="mb-8">
            <div className="h-4 rounded-full bg-gray-200">
              <div
                className="h-4 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${Math.min(100, dailySummary.percentage)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <span>{dailySummary.totalProtein}g consumed</span>
              <span>{dailySummary.remaining}g remaining</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex space-x-4">
          <button
            onClick={() => setShowAddEntry(true)}
            className="flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Protein Entry
          </button>
          <button
            onClick={() => setShowAddMeal(true)}
            className="flex items-center rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
          >
            <Utensils className="mr-2 h-5 w-5" />
            Add Preset Meal
          </button>
        </div>

        {/* Protein Entries */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">
              Today&apos;s Entries
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {dailySummary?.entries && dailySummary.entries.length > 0 ? (
              dailySummary.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.mealName ?? "Protein Entry"}
                    </p>
                    {entry.description && (
                      <p className="text-sm text-gray-600">
                        {entry.description?.replace(/'/g, "&apos;")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-blue-600">
                      {entry.amount}g
                    </span>
                    <button
                      onClick={() =>
                        deleteProteinEntry.mutate({ id: entry.id })
                      }
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No protein entries for today. Add your first entry!
              </div>
            )}
          </div>
        </div>

        {/* Preset Meals */}
        {presetMeals && presetMeals.length > 0 && (
          <div className="mt-8 rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">
                Preset Meals
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
              {presetMeals.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => {
                    void addProteinEntry.mutate({
                      amount: meal.proteinAmount,
                      mealName: meal.name,
                      description: meal.description ?? undefined,
                      date: selectedDate,
                    });
                  }}
                  className="rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <p className="font-medium text-gray-900">{meal.name}</p>
                  {meal.description && (
                    <p className="text-sm text-gray-600">{meal.description}</p>
                  )}
                  <p className="mt-2 font-semibold text-blue-600">
                    {meal.proteinAmount}g protein
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">Add Protein Entry</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addProteinEntry.mutate({
                  amount: parseFloat(formData.get("amount") as string),
                  mealName: formData.get("mealName") as string,
                  description: formData.get("description") as string,
                  date: selectedDate,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Protein Amount (g)
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.1"
                  min="0"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Meal Name (optional)
                </label>
                <input
                  type="text"
                  name="mealName"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Add Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEntry(false)}
                  className="flex-1 rounded-md bg-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Preset Meal Modal */}
      {showAddMeal && (
        <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">Add Preset Meal</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addPresetMeal.mutate({
                  name: formData.get("name") as string,
                  proteinAmount: parseFloat(
                    formData.get("proteinAmount") as string,
                  ),
                  description: formData.get("description") as string,
                  isPublic: formData.get("isPublic") === "on",
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Meal Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Protein Amount (g)
                </label>
                <input
                  type="number"
                  name="proteinAmount"
                  step="0.1"
                  min="0"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  id="isPublic"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isPublic"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Make this meal public for others to use
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                >
                  Add Meal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMeal(false)}
                  className="flex-1 rounded-md bg-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
