import axios from "axios";
import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const OKTA_DOMAIN = process.env.OKTA_ISSUER!.replace("/oauth2/default", "");

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 🔹 Authenticate with Okta Authentication API
    const authResponse = await axios.post(
      `${OKTA_DOMAIN}/api/v1/authn`,
      { username: email, password: password },
      { headers: { "Content-Type": "application/json" } }
    );

    // Extract session token
    const { sessionToken } = authResponse.data;
    if (!sessionToken) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔹 Check if user exists in local DB
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, password: await bcrypt.hash(password, 10), oktaToken: sessionToken });
      await user.save();
    } else {
      user.oktaToken = sessionToken;
      await user.save();
    }

    // 🔹 Generate local JWT token
    const localToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      user: { email: user.email },
      oktaToken: sessionToken,
      localToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      const axiosError = error as any; // Type assertion for Axios error
      res.status(500).json({ 
        message: "Authentication failed", 
        error: axiosError.response?.data || error.message 
      });
    } else {
      res.status(500).json({ message: "Unknown error occurred", error });
    }
  }
};
