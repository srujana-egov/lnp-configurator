import { z } from 'zod'

// Real, grounded starter examples for a step's first-visit welcome
// screen — deliberately allowed to come back empty. A session with
// nothing yet to ground a suggestion in should show no examples at all,
// not generic boilerplate unrelated to what's actually being configured.
export const WelcomeStartersSchema = z.object({
  starters: z.array(z.string()),
})

export type WelcomeStartersLlmOutput = z.infer<typeof WelcomeStartersSchema>
