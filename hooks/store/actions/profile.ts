import { UserProfile } from "@/lib/types"
import { getUserProfile, updateUserProfile as persistUserProfile, updateUserGlobalMemory } from "@/lib/api"
import { ChatState } from "../types"

type SetFunction = (state: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void
type GetFunction = () => ChatState

export const createProfileActions = (set: SetFunction, get: GetFunction) => ({
  loadProfile: async () => {
    const profile = get().profile
    if (!profile || !profile.userId) {
      return
    }

    const userId = profile.userId as string

    try {
      const backendProfile = await getUserProfile(
        userId,
        profile.name || undefined,
        profile.email || undefined
      )
      if (backendProfile) {
        set({
          profile: backendProfile,
        })
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load user profile",
      })
    }
  },

  saveProfile: async (updates: Partial<UserProfile> & { password?: string }) => {
    const profile = get().profile
    if (!profile || !profile.userId) {
      set({ error: "Please sign in to update profile" })
      return
    }

    const userId = profile.userId as string

    try {
      // Handle global memory separately and reload profile after
      if (updates.globalMemory != null) {
        await updateUserGlobalMemory(userId, updates.globalMemory)
        // Reload the full profile to get the updated global memory
        const reloadedProfile = await getUserProfile(userId)
        if (reloadedProfile) {
          set({
            profile: reloadedProfile,
            error: null,
          })
        }
        return
      }
      
      const backendProfile = await persistUserProfile(userId, {
        name: updates.name || undefined,
        email: updates.email || undefined,
        password: updates.password || undefined,
        gender: updates.gender || undefined,
      })
      if (backendProfile) {
        set({
          profile: backendProfile,
          error: null,
        })
      }
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to save profile",
      })
    }
  },
})
