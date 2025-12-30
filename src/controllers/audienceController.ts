import { Request, Response } from "express";
import Audience from "../models/Audience";
import { buildAudienceQuery } from "../utils/buildAudienceQuery";
// 1️⃣ Create New Audience Member
export const createAudienceMember = async (req: Request, res: Response) => {
  try {
    const { email, name, age, location, tags, attributes } = req.body;
    const newMember = new Audience({
        email,
        name,
        age,
        location,
        tags,
        attributes
    });
    await newMember.save();
    res.status(201).json(newMember);
    } catch (error) {
    res.status(500).json({ message: "Error creating audience member", error });
    }
};

export const getAudience = async (req: Request, res: Response) => {
  try {
    const audience = await Audience.find();
    res.json(audience);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch audience" });
  }
};

// get audience count 
export const getAudienceCount = async (req: Request, res: Response) => {
  try {
    const count = await Audience.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch audience count" });
  }
};

export const estimateAudience = async (req: Request, res: Response) => {
  try {
    const { conditions, logicalOperator } = req.body;

    // 1. Validate conditions (basic sanity, not full schema police)
    if (!conditions || !Array.isArray(conditions)) {
      return res.status(400).json({ message: "Invalid filter conditions" });
    }

    // 2. Convert filter DSL → Mongo query
    const mongoQuery = buildAudienceQuery({ conditions, logicalOperator });

    // 3. Count only
    const count = await Audience.countDocuments(mongoQuery);

    res.json({ count });
  } catch (err) {
    console.error("Audience estimate failed", err);
    res.status(500).json({ message: "Failed to estimate audience" });
  }
};
