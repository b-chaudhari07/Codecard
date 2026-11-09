import { forwardRef } from 'react'

import { ClassicLandscapeCard } from '../card/ClassicLandscapeCard'
import { PortraitCard } from '../card/PortraitCard'
import type { CardOptions, Profile } from '../../types/profile'

interface ProfileCardProps {
  profile: Profile
  options: CardOptions
}

/**
 * Thin template switcher. Portrait (and its portrait/story/print variants)
 * render the shared collectible design; anything not implemented yet falls
 * back to it. The forwarded ref and `data-codecard-export` attribute live on
 * the rendered card, which keeps the PNG export target stable.
 */
export const ProfileCard = forwardRef<HTMLDivElement, ProfileCardProps>(
  function ProfileCard({ profile, options }, ref) {
    switch (options.template) {
      case 'classic':
        return (
          <ClassicLandscapeCard
            ref={ref}
            profile={profile}
            options={options}
          />
        )
      case 'story':
      case 'link':
      case 'print':
      case 'portrait':
      default:
        return (
          <PortraitCard
            ref={ref}
            profile={profile}
            options={options}
          />
        )
    }
  },
)
