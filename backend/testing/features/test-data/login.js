import { buildEmail, featurePasswords } from './common.js'

export const loginFeatureData = {
  defaultName: 'Feature User',
  badPassword: featurePasswords.weak,
  whitespace: featurePasswords.whitespace,
  strongPassword: featurePasswords.strong,
  buildEmail: (tag = 'login') => buildEmail(`features-${tag}`)
}
