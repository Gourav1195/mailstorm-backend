// src/utils/buildAudienceQuery.ts
//Filter JSON  ──▶  MongoDB Query | to get audience size before scheduling email

import { operatorMap } from "./operatorMap";

export function buildAudienceQuery(filter: any) {
  const groupQueries = filter.conditions.map((group: any) => {
    const criteriaQueries = group.criteria.map((c: any) => {
      const opFn = operatorMap[c.operator];
      if (!opFn) {
        throw new Error(`Unsupported operator: ${c.operator}`);
      }
      return opFn(c.field, c.value);
    });

    return group.groupOperator === "AND"
      ? { $and: criteriaQueries }
      : { $or: criteriaQueries };
  });

  if (groupQueries.length === 1) {
    return groupQueries[0];
  }

  return filter.logicalOperator === "AND"
    ? { $and: groupQueries }
    : { $or: groupQueries };
}
