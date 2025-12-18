import { foodXssPayloads, securityEmails, securityFoodAssets, securityPasswords } from './common.js'

export const foodSecurityData = {
  adminProfile: () => ({
    name: 'Security Admin',
    email: securityEmails.unique('sec-admin'),
    password: securityPasswords.strong,
    role: 'admin'
  }),
  payloads: {
    scriptDescription: foodXssPayloads.scriptTag,
    imageOnError: foodXssPayloads.imageOnError
  },
  attachments: {
    image: () => ({ buffer: securityFoodAssets.sampleImageBuffer(), filename: 'security.png' })
  },
  metadata: {
    nameScript: 'XSS Pho',
    nameSanitized: 'Sanitized Banh Mi'
  }
}
