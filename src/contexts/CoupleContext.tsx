import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/services/supabase/client'
import * as coupleService from '@/services/api/couple'
import type { CoupleMemberWithProfile } from '@/services/api/couple'
import type { Couple, CoupleMember } from '@/types/domain'

interface CoupleContextValue {
  couple: Couple | null
  myMember: CoupleMember | null
  members: CoupleMemberWithProfile[]
  memberCount: number
  /** True when both members have joined. */
  isComplete: boolean
  /** First names used for the shared greeting, e.g. ["Xiomara", "Iván"]. */
  greetingNames: string[]
  loading: boolean
  refresh: () => Promise<void>
  createCouple: (name: string) => Promise<{ error: string | null }>
  invitePartner: (email: string) => Promise<coupleService.InviteResult>
  acceptInvite: (token: string) => Promise<coupleService.CoupleResult>
}

const CoupleContext = createContext<CoupleContextValue | null>(null)

function firstNames(members: CoupleMemberWithProfile[]): string[] {
  return members
    .map((m) => m.profiles?.full_name?.trim().split(/\s+/)[0])
    .filter((n): n is string => Boolean(n))
}

export function CoupleProvider({ children }: { children: ReactNode }) {
  const [couple, setCouple] = useState<Couple | null>(null)
  const [myMember, setMyMember] = useState<CoupleMember | null>(null)
  const [members, setMembers] = useState<CoupleMemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) {
      setCouple(null)
      setMyMember(null)
      setMembers([])
      setLoading(false)
      return
    }
    try {
      const result = await coupleService.getMyCouple(userId)
      if (!result) {
        setCouple(null)
        setMyMember(null)
        setMembers([])
      } else {
        setCouple(result.couple)
        setMembers(result.members)
        setMyMember(result.members.find((m) => m.user_id === userId) ?? null)
      }
    } catch {
      setCouple(null)
      setMyMember(null)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<CoupleContextValue>(
    () => ({
      couple,
      myMember,
      members,
      memberCount: members.length,
      isComplete: members.length === 2,
      greetingNames: firstNames(members),
      loading,
      refresh,
      createCouple: async (name) => {
        const result = await coupleService.createCouple(name, couple?.currency ?? 'EUR')
        await refresh()
        if (!result.error) return { error: null }
        const alreadyIn = result.error.includes('Ya pertenecéis')
        return { error: alreadyIn ? null : result.error }
      },
      invitePartner: coupleService.invitePartner,
      acceptInvite: async (token) => {
        const result = await coupleService.acceptInvite(token)
        if (!result.error && result.coupleId) await refresh()
        return result
      },
    }),
    [couple, myMember, members, loading, refresh],
  )

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
}

export function useCouple(): CoupleContextValue {
  const ctx = useContext(CoupleContext)
  if (!ctx) throw new Error('useCouple must be used within CoupleProvider')
  return ctx
}
