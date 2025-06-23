// Fisher-Yates shuffle algorithm for truly random results
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random items from array without repeating until all seen
export function getRandomItems<T>(
  items: T[],
  count: number,
  seenItems: T[] = [],
  keyExtractor?: (item: T) => string
): T[] {
  const getKey = keyExtractor || ((item: T) => JSON.stringify(item));
  const seenKeys = new Set(seenItems.map(getKey));

  // Filter out already seen items
  const unseenItems = items.filter((item) => !seenKeys.has(getKey(item)));

  // If we've seen everything, reset and use all items
  const availableItems = unseenItems.length > 0 ? unseenItems : items;

  // Shuffle and take the requested count
  const shuffled = shuffleArray(availableItems);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Get weighted random selection based on user preferences
export function getWeightedRandomItems<T>(
  items: T[],
  count: number,
  weightFunction: (item: T) => number,
  seenItems: T[] = [],
  keyExtractor?: (item: T) => string
): T[] {
  const getKey = keyExtractor || ((item: T) => JSON.stringify(item));
  const seenKeys = new Set(seenItems.map(getKey));

  // Filter out seen items and calculate weights
  const availableItems = items
    .filter((item) => !seenKeys.has(getKey(item)))
    .map((item) => ({
      item,
      weight: weightFunction(item),
    }))
    .filter(({ weight }) => weight > 0);

  if (availableItems.length === 0) {
    // If no available items, fall back to regular random selection
    return getRandomItems(items, count, [], keyExtractor);
  }

  // Create cumulative weight array
  const totalWeight = availableItems.reduce(
    (sum, { weight }) => sum + weight,
    0
  );
  const cumulativeWeights = availableItems.map(
    ({ weight }) => weight / totalWeight
  );

  for (let i = 1; i < cumulativeWeights.length; i++) {
    cumulativeWeights[i] += cumulativeWeights[i - 1];
  }

  const selected: T[] = [];
  const usedIndices = new Set<number>();

  while (selected.length < count && selected.length < availableItems.length) {
    const random = Math.random();
    const index = cumulativeWeights.findIndex((weight) => random <= weight);

    if (index !== -1 && !usedIndices.has(index)) {
      selected.push(availableItems[index].item);
      usedIndices.add(index);
    }
  }

  return selected;
}
