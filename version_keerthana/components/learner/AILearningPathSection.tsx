"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { getPathBySlug } from "@/data/learningPaths";
import { getLearningProfile } from "@/lib/api/learningProfile";
import LearningPathOnboarding from "./LearningPathOnboarding";
import AIRoadmapView from "./AIRoadmapView";
import LearningPathStepper from "./LearningPathStepper";
import SetLearningTargetCard from "./SetLearningTargetCard";

export default function AILearningPathSection() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getLearningProfile>> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const p = await getLearningProfile();
      setProfile(p);
    } catch {
      setProfile({
        goal: "",
        targetRole: "",
        knownSkills: [],
        completedOnboarding: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [showOnboarding]);

  const completedOnboarding = profile?.completedOnboarding ?? false;
  const recommendedPath = profile?.recommendedPathSlug
    ? getPathBySlug(profile.recommendedPathSlug)
    : null;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
        <div className="h-24 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  return (
    <>
      {/* Set Learning Target card - prominent when user hasn't set target (like image) */}
      {!completedOnboarding && (
        <div className="mb-6">
          <SetLearningTargetCard onSetTarget={() => setShowOnboarding(true)} />
        </div>
      )}

      {/* AI-Generated Roadmap - only when target is set */}
      {completedOnboarding && recommendedPath ? (
        <div className="space-y-4">
          <AIRoadmapView
            path={recommendedPath}
            personalizedMessage={profile?.personalizedMessage}
          />
          <div className="flex justify-end">
            <button
              onClick={() => setShowOnboarding(true)}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Update my path
            </button>
          </div>
        </div>
      ) : completedOnboarding && !recommendedPath ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <p className="text-slate-600 text-sm">Recommended path not found. Please update your target.</p>
          <button
            onClick={() => setShowOnboarding(true)}
            className="mt-3 text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Update my path
          </button>
        </div>
      ) : null}

      {/* Active Learning Paths (enrolled) */}
      <LearningPathStepper />

      <LearningPathOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          loadProfile();
          setShowOnboarding(false);
        }}
      />
    </>
  );
}
