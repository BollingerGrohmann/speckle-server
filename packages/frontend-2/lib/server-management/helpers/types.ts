import { Get } from 'type-fest'
import {
  AdminPanelUsersListQuery,
  AdminPanelProjectsListQuery,
  AdminPanelInvitesListQuery
} from '~~/lib/common/generated/gql/graphql'
import { ConcreteComponent } from 'vue'
import { MaybeAsync } from '@speckle/shared'

export type ItemType = UserItem | ProjectItem | InviteItem

export type UserItem = NonNullable<
  Get<AdminPanelUsersListQuery, 'admin.userList.items[0]'>
>
export type ProjectItem = NonNullable<
  Get<AdminPanelProjectsListQuery, 'admin.projectList.items[0]'>
>
export type InviteItem = NonNullable<
  Get<AdminPanelInvitesListQuery, 'admin.inviteList.items[0]'>
>

export interface CTA {
  type: 'button' | 'link'
  label: string
  action: () => MaybeAsync<void>
}

export interface Button {
  text: string
  props: { color: string; fullWidth: boolean; outline: boolean }
  onClick: () => void
}

export interface CardInfo {
  title: string
  value: string
  icon: ConcreteComponent
  cta?:
    | {
        type: 'button' | 'link'
        label: string
        action: () => MaybeAsync<void>
      }
    | undefined
}
