// src/utils/operatorMap.ts
export const operatorMap: Record<string, (field: string, value: any) => any> = {
  equals: (f, v) => ({ [f]: v }),

  notEquals: (f, v) => ({ [f]: { $ne: v } }),

  contains: (f, v) => ({ [f]: { $regex: v, $options: 'i' } }),

  startsWith: (f, v) => ({ [f]: { $regex: `^${v}`, $options: 'i' } }),

  endsWith: (f, v) => ({ [f]: { $regex: `${v}$`, $options: 'i' } }),

  greaterThan: (f, v) => ({ [f]: { $gt: v } }),

  greaterThanOrEqual: (f, v) => ({ [f]: { $gte: v } }),

  lessThan: (f, v) => ({ [f]: { $lt: v } }),

  lessThanOrEqual: (f, v) => ({ [f]: { $lte: v } }),

  between: (f, [min, max]) => ({ [f]: { $gte: min, $lte: max } }),

  in: (f, v) => ({ [f]: { $in: v } }),

  notIn: (f, v) => ({ [f]: { $nin: v } }),

  isEmpty: (f) => ({ [f]: { $exists: false } }),

  isNotEmpty: (f) => ({ [f]: { $exists: true } })
};

export const logicalOperatorMap: Record<string, string> = {
  AND: "$and",
  OR: "$or"
}; 