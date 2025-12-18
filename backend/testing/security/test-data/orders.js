import { securityAddressTemplate, securityEmails, securityOrderItems } from './common.js'

export const orderSecurityData = {
  address: () => ({ ...securityAddressTemplate }),
  attackerProfile: {
    role: 'user'
  },
  accountPassword: 'Test1234!',
  userEmail: (tag) => securityEmails.unique(tag),
  victimOrderItems: {
    first: () => [securityOrderItems.victimBase()],
    second: () => [securityOrderItems.victimBase('2')]
  }
}
