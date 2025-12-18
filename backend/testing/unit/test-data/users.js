export const userUnitData = {
  loginFlow: {
    credentials: {
      email: 'user@login.test',
      plaintext: 'PlainSecret1!',
      hashedDigest: 'hashed-secret'
    }
  },
  registerFlow: {
    payload: {
      name: 'Unit User',
      email: 'unit@register.test',
      password: 'StrongPass1!'
    }
  },
  toggleCartLock: {
    request: { body: { userId: 'user-lock' } },
    response: { userId: 'user-lock', isCartLock: true }
  }
}
