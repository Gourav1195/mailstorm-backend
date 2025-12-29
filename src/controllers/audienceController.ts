import { Request, Response } from "express";
import Audience from "../models/Audience";
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