import { describe, it, expect, jest } from '@jest/globals'
import AppError from '../../../utils/appError.js'
import { foodUnitData } from '../test-data/foods.js'

const mockAddFoodRepository = {
  create: jest.fn()
}

jest.unstable_mockModule('../../../modules/Foods/addFood/Repository.js', () => ({
  __esModule: true,
  default: mockAddFoodRepository
}))

const mockFoodModel = {
  find: jest.fn()
}

jest.unstable_mockModule('../../../models/foodModel.js', () => ({
  __esModule: true,
  default: mockFoodModel
}))

const mockRemoveFoodRepository = {
  findById: jest.fn(),
  deleteById: jest.fn()
}

jest.unstable_mockModule('../../../modules/Foods/removeFood/Repository.js', () => ({
  __esModule: true,
  default: mockRemoveFoodRepository
}))

const mockFs = {
  unlink: jest.fn((_, cb) => cb && cb())
}

jest.unstable_mockModule('fs', () => ({
  __esModule: true,
  default: mockFs,
  unlink: mockFs.unlink
}))

const { default: addFoodService } = await import('../../../modules/Foods/addFood/Service.js')
const listFoodRepository = (await import('../../../modules/Foods/listFood/Repository.js')).default
const { default: removeFoodService } = await import('../../../modules/Foods/removeFood/Service.js')

describe('Unit · Food surface', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('UNI_FOOD_UNIT_01 / UNI_FOOD_UNIT_02 · rejects creation when name missing', async () => {
    await expect(
      addFoodService.createFood(foodUnitData.creationPayloads.missingName, { filename: 'foo.png' })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('UNI_FOOD_UNIT_03 / UNI_FOOD_UNIT_04 · repository should apply dynamic filters to query', async () => {
    mockFoodModel.find.mockResolvedValue([])

    const filters = foodUnitData.listFilters()

    await listFoodRepository.findAll(filters)

    expect(mockFoodModel.find).toHaveBeenCalledWith(filters)
  })

  it('UNI_FOOD_UNIT_05 / UNI_FOOD_UNIT_06 · delete should block foods tied to active orders', async () => {
    mockRemoveFoodRepository.findById.mockResolvedValue(foodUnitData.protectedInventory())

    await expect(removeFoodService.deleteFood('food-protected')).rejects.toBeInstanceOf(AppError)
    expect(mockRemoveFoodRepository.deleteById).not.toHaveBeenCalled()
  })
})
