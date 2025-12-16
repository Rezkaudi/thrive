// hooks/usePublicProfile.ts
import { useState, useEffect } from "react";
import { profileService } from "../services/profileService";
import { activityService } from "../services/activityService";
import { PublicProfile } from "../types/public-profile.types";

export const usePublicProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Fetch Profile
  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!userId) {
        setError("Invalid profile URL");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profileData = await profileService.getPublicProfile(userId);
        setProfile(profileData);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  // Fetch Activities (only when profile is loaded)
  useEffect(() => {
    const fetchActivities = async () => {
      if (profile?.id && userId) {
        setActivitiesLoading(true);
        try {
          const response = await activityService.getUserActivities(userId, 1, 10);
          setRecentActivities(response.activities);
        } catch (error) {
          console.error("Failed to fetch activities", error);
        } finally {
          setActivitiesLoading(false);
        }
      }
    };

    fetchActivities();
  }, [profile?.id, userId]);

  return { profile, loading, error, recentActivities, activitiesLoading };
};