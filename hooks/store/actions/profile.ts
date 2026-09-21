import { UserProfile } from "@/lib/types"
import { getUserProfile, updateUserProfile as persistUserProfile, updateUserGlobalMemory } from "@/lib/api"
import { toUserProfile } from "../converters"
import { ChatState } from "../types"

type SetFunction = (state: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void
type GetFunction = () => ChatState

export const createProfileActions = (set: SetFunction, get: GetFunction) => ({
  loadProfile: async () => {
    const profile = get().profile
    if (!profile) {
      return
    }

    try {
      const backendProfile = await getUserProfile(
        profile.id,
        profile.name,
        profile.email
      )
      const nextProfile = toUserProfile(backendProfile)
      set({
        profile: nextProfile,
      })
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
    if (!profile) {
      set({ error: "Please sign in to update profile" })
      return
    }

    try {
      // Handle global memory separately and reload profile after
      if (updates.globalMemory !== undefined) {
        await updateUserGlobalMemory(profile.id, updates.globalMemory)
        // Reload the full profile to get the updated global memory
        const reloadedProfile = await getUserProfile(profile.id)
        const nextProfile = toUserProfile(reloadedProfile)
        set({
          profile: nextProfile,
          error: null,
        })
        return
      }
      
      const backendProfile = await persistUserProfile(profile.id, {
        name: updates.name,
        email: updates.email,
        password: updates.password,
        gender: updates.gender,
      })
      const nextProfile = toUserProfile(backendProfile)
      set({
        profile: nextProfile,
        error: null,
      })
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to save user profile",
      })
    }
  },
})
