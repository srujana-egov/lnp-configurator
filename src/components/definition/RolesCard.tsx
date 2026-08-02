import { DefinitionCard } from './DefinitionCard'
import type { SectionStatus } from '@/types/completeness'

export function RolesCard({ roles, status, highlighted }: { roles: string[]; status: SectionStatus; highlighted: boolean }) {
  return (
    <DefinitionCard
      title="Roles"
      status={status}
      highlighted={highlighted}
      isEmpty={roles.length === 0}
      emptyMessage="Roles will appear once the AI identifies who is involved."
    >
      <div className="flex flex-wrap gap-1.5">
        {roles.map((role) => (
          <span key={role} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            {role}
          </span>
        ))}
      </div>
    </DefinitionCard>
  )
}
