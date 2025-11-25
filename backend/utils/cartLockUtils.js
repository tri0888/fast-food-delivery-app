export const ensureCartLockMap = (cartLocks) => {
    if (!cartLocks) {
        return new Map();
    }

    if (cartLocks instanceof Map) {
        return cartLocks;
    }

    return new Map(
        Object.entries(cartLocks).map(([key, value]) => [String(key), Boolean(value)])
    );
};

export const cartLocksToObject = (cartLocks) => {
    const map = ensureCartLockMap(cartLocks);
    return Object.fromEntries(
        Array.from(map.entries()).map(([key, value]) => [String(key), Boolean(value)])
    );
};

export const isRestaurantLocked = (cartLocks, restaurantId) => {
    if (!restaurantId) {
        return false;
    }

    const map = ensureCartLockMap(cartLocks);
    return Boolean(map.get(String(restaurantId)));
};
