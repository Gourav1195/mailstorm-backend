import mongoose, { Schema, Document } from 'mongoose';

export interface ICriteriaBlock extends Document {
  // name: string;
  key: string;                     // actual backend field
  label: string;                   // UI display name
  
  type: 'string' | 'number' | 'date';
  category: 'filterComponent' | 'triggerFilter';
  operators: string[];
}

const CriteriaBlockSchema: Schema = new Schema(
  {
    // name: { type: String, required: true },
     key: { type: String, required: true, unique: true },
    label: { type: String, required: true },

    type: { type: String, enum: ['string', 'number', 'date'], required: true },
    category: { type: String, enum: ['filterComponent', 'triggerFilter'], required: true },
    operators: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one operator is required.',
      },
    },
  },
  { timestamps: true }
);

export const CriteriaBlock = mongoose.model<ICriteriaBlock>('CriteriaBlock', CriteriaBlockSchema);
