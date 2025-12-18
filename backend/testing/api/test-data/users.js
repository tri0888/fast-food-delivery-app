import { buildEmail, passwords } from './common.js'

export const userApiData = {
  uniqueEmail: (tag = 'user') => buildEmail(`user-${tag}`),
  buildRegisterPayload: (overrides = {}, tag = 'user') => ({
    name: 'CSV Matrix User',
    email: buildEmail(`register-${tag}`),
    password: passwords.strong,
    ...overrides
  }),
  invalidEmail: 'invalid-email',
  weakPassword: passwords.weak,
  wrongPassword: passwords.wrong
}
