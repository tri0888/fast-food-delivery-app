import app from '../../app.js'
import request from 'supertest'

export function buildClient() {
  return request(app)
}
