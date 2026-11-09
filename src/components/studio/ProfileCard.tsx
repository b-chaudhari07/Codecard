import { forwardRef } from 'react'

import { ClassicLandscapeCard } from '../card/ClassicLandscapeCard'
import type { CardOptions, Profile } from '../../types/profile'

interface ProfileCardProps {
  profile: Profile
  options: CardOptions
}

/**
 * Thin template switcher. Only the classic template is available today, so
 * every other id falls back to it. The forwarded ref and
 * `data-codecard-export` attribute live on the rendered card, which keeps the
 * PNG export target stable.
 */
export const ProfileCard = forwardRef<HTMLDivElement, ProfileCardProps>(
  function ProfileCard({ profile, options }, ref) {
    switch (options.template) {
      case 'classic':
      default:
        return (
          <ClassicLandscapeCard
            ref={ref}
            profile={profile}
            options={options}
          />
        )
    }
  },
)
