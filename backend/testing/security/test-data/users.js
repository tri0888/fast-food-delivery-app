import { forgedJwtHeader, securityEmails, securityPasswords, sqlInjectionPayload } from './common.js'

export const userSecurityData = {
  legitAccount: {
    email: 'legit@example.com',
    password: securityPasswords.strong
  },
  sqlInjectionLoginPayload: {
    email: sqlInjectionPayload,
    password: 'whatever'
  },
  bruteForce: {
    wrongPassword: securityPasswords.wrong,
    maxAttempts: 10
  },
  adminListEndpoint: {
    path: '/api/user/list'
  },
  forgedTokenPieces: {
    header: forgedJwtHeader,
    buildPayload: (userId) => ({ id: userId })
  },
  privilegeEscalation: {
    role: 'user'
  },
  seedPassword: securityPasswords.strong,
  uniqueEmail: (tag) => securityEmails.unique(tag)
}
