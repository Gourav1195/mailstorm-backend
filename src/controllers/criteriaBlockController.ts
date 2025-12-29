import { Request, Response } from 'express';
import { CriteriaBlock } from '../models/criteriaBlock';

type CriteriaType = 'string' | 'number' | 'date';

const allowedOperatorsMap: Record<CriteriaType, string[]> = {
  string: [
    'equals',
    'not equals',
    'contains',
    'notContains',
    'startsWith',
    'endsWith',
    'isEmpty',
    'isNotEmpty'
  ],
  number: [
    'equals',
    'not equals',
    'greaterThan',
    'greaterThanOrEqual',
    'lessThan',
    'lessThanOrEqual',
    'between',
    'in',
    'notIn',
    'isEmpty',
    'isNotEmpty'
  ],
  date: [
    'equals',
    'not equals',
    'before',
    'after',
    'on',
    'not on',
    'between',
    'onOrBefore',
    'onOrAfter',
    'notBetween',
    'isEmpty',
    'isNotEmpty'
  ],
};

// server-side mapping (single source of truth)
const FIELD_MAP: Record<string, string> = {
  age: "age",
  city: "location.city",
  state: "location.state",
  country: "location.country",
  tags: "tags",
  region: "attributes.region",
  plan: "attributes.plan"
};


export const createCriteriaBlock = async (req: Request, res: Response) => {
  try {
    const { key, label:name, type, category, operators } = req.body;
    console.log("name", name, "type", type, "category", category, "operators", operators);
    if (!name || !type || !category || !operators) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    if (!Array.isArray(operators) || operators.length === 0) {
      return res.status(400).json({ success: false, message: 'Operators must be a non-empty array.' });
    }

    const normalizedName = String(name).trim().toLowerCase();

// const key = FIELD_MAP[normalizedName];
// if (!key) {
//   return res.status(400).json({
//     success: false,
//     message: `Unknown field mapping for ${normalizedName}`
//   });
// }

    // ✅ Validate type safely
    if (!['string', 'number', 'date'].includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid type: ${type}` });
    }
console.log("Beforeeeeeeeeee CREATE BLOCK PAYLOAD", {
  key,
  label: name,
  type,
  category,
  operators
});

    const allowedOperators = allowedOperatorsMap[type as CriteriaType];
    const invalidOperators = operators.filter((op: string) => !allowedOperators.includes(op));
    if (invalidOperators.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid operator(s) for type "${type}": ${invalidOperators.join(', ')}`,
      });
    }

    const existingBlock = await CriteriaBlock.findOne({
      label: new RegExp(`^${name}$`, 'i'),
      category,
    });


    if (existingBlock) {
      return res.status(409).json({
        success: false,
        message: 'A Criteria Block with the same name already exists in this category.',
      });
    }
console.log("afterrrrrrrrrrrrrrrrrr CREATE BLOCK PAYLOAD", {
  key,
  label: name,
  type,
  category,
  operators
});

    const newBlock = await CriteriaBlock.create({ key, label:name.trim(), type, category, operators });

    return res.status(201).json({
      success: true,
      message: 'Criteria Block created.',
      data: newBlock,
    });
  } catch (error) {
    console.error('Error creating criteria block:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ✅ Get All Criteria Blocks (Optional filtering by category)
export const getCriteriaBlocks = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const filter: any = {};
    if (category) filter.category = category;

    const blocks = await CriteriaBlock.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: blocks });
  } catch (error) {
    console.error('Error fetching criteria blocks:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ✅ Delete Criteria Block
export const deleteCriteriaBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await CriteriaBlock.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Criteria Block deleted.' });
  } catch (error) {
    console.error('Error deleting criteria block:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};



