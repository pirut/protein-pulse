"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Target, User, Save } from "lucide-react";

import { api } from "~/trpc/react";

export default function SettingsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [dailyGoal, setDailyGoal] = useState(0);
  const [profile, setProfile] = useState({
    name: "",
    weight: 0,
    height: 0,
    age: 0,
    activityLevel: "moderately_active" as
      | "moderately_active"
      | "sedentary"
      | "lightly_active"
      | "very_active"
      | "extremely_active",
  });

  // Queries - only enable when user is fully loaded and signed in
  const shouldEnableQueries = isSignedIn && isLoaded;

  // Add a small delay to ensure Clerk is fully initialized
  const [queriesEnabled, setQueriesEnabled] = useState(false);

  useEffect(() => {
    if (shouldEnableQueries) {
      const timer = setTimeout(() => {
        setQueriesEnabled(true);
      }, 1000); // Wait 1 second after auth is ready

      return () => clearTimeout(timer);
    } else {
      setQueriesEnabled(false);
    }
  }, [shouldEnableQueries]);

  // Use a stable date for the query to prevent re-runs
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); // Set to start of day for consistency
    return date;
  }, []); // Empty dependency array means this only runs once

  const { data: currentGoal } = api.protein.getDailyGoal.useQuery(
    { date: today },
    {
      enabled: queriesEnabled,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
  );

  // Debug logging to see if query is still running
  useEffect(() => {
    if (queriesEnabled) {
      console.log("Daily goal query enabled with date:", today);
    }
  }, [queriesEnabled, today]);

  const { data: currentProfile } = api.protein.getProfile.useQuery(undefined, {
    enabled: queriesEnabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  // Mutations
  const setDailyGoalMutation = api.protein.setDailyGoal.useMutation();
  const updateProfileMutation = api.protein.updateProfile.useMutation();

  // Initialize form data when server data loads
  useEffect(() => {
    if (currentGoal && dailyGoal === 0) {
      setDailyGoal(currentGoal.targetProtein);
    }
  }, [currentGoal, dailyGoal]);

  useEffect(() => {
    if (currentProfile && profile.name === "") {
      setProfile({
        name: currentProfile.name ?? "",
        weight: currentProfile.weight ?? 0,
        height: currentProfile.height ?? 0,
        age: currentProfile.age ?? 0,
        activityLevel:
          (currentProfile.activityLevel as
            | "moderately_active"
            | "sedentary"
            | "lightly_active"
            | "very_active"
            | "extremely_active") ?? "moderately_active",
      });
    }
  }, [currentProfile, profile.name]);

  const handleSaveGoal = () => {
    setDailyGoalMutation.mutate({
      targetProtein: dailyGoal,
      date: today, // Use the stable date
    });
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profile);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Please sign in to access settings
          </h1>
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
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Daily Goal Settings */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-6 flex items-center">
              <Target className="mr-3 h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Daily Protein Goal
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Target Protein (grams per day)
                </label>
                <input
                  type="number"
                  value={dailyGoal}
                  onChange={(e) =>
                    setDailyGoal(parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="0.1"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSaveGoal}
                disabled={setDailyGoalMutation.isPending}
                className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                <Save className="mr-2 h-4 w-4" />
                {setDailyGoalMutation.isPending ? "Saving..." : "Save Goal"}
              </button>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-6 flex items-center">
              <User className="mr-3 h-6 w-6 text-green-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Profile Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.1"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        height: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.1"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      age: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Activity Level
                </label>
                <select
                  value={profile.activityLevel}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      activityLevel: e.target.value as
                        | "moderately_active"
                        | "sedentary"
                        | "lightly_active"
                        | "very_active"
                        | "extremely_active",
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sedentary">
                    Sedentary (little or no exercise)
                  </option>
                  <option value="lightly_active">
                    Lightly Active (light exercise/sports 1-3 days/week)
                  </option>
                  <option value="moderately_active">
                    Moderately Active (moderate exercise/sports 3-5 days/week)
                  </option>
                  <option value="very_active">
                    Very Active (hard exercise/sports 6-7 days a week)
                  </option>
                  <option value="extremely_active">
                    Extremely Active (very hard exercise, physical job)
                  </option>
                </select>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:bg-green-400"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Daily Protein */}
        <div className="mt-8 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-4 text-lg font-medium text-blue-900">
            Recommended Daily Protein Intake
          </h3>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="font-medium text-blue-800">
                General Recommendation:
              </p>
              <p className="text-blue-700">0.8g per kg of body weight</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">Active Adults:</p>
              <p className="text-blue-700">1.2-1.6g per kg of body weight</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">Athletes:</p>
              <p className="text-blue-700">1.6-2.2g per kg of body weight</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
