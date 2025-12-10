import express from 'express';
import {
  createCriteriaBlock,
  getCriteriaBlocks,
  deleteCriteriaBlock,
} from '../controllers/criteriaBlockController';

const router = express.Router();

router.post('/', createCriteriaBlock);                 // Create
router.get('/', getCriteriaBlocks);                    // Read (optionally filter by category)
router.delete('/:id', deleteCriteriaBlock);            // Delete

export default router;
