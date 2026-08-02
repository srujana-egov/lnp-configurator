import { useMemo } from 'react'
import { useDemo } from './useDemo'
import { useCompilation } from './useCompilation'
import type { TimelineStageId } from '@/types/scenario'

export function useEffectiveTimelineStage() {
  const { timelineStage, reachedStages } = useDemo()
  const compilation = useCompilation()

  const stage: TimelineStageId =
    compilation.status === 'complete' ? 'deployment' : compilation.status !== 'idle' ? 'compilation' : timelineStage

  const effectiveReachedStages = useMemo(() => {
    const set = new Set(reachedStages)
    if (compilation.status !== 'idle') set.add('compilation')
    if (compilation.status === 'complete') set.add('deployment')
    return set
  }, [reachedStages, compilation.status])

  return { stage, reachedStages: effectiveReachedStages, jumpableStages: reachedStages }
}
