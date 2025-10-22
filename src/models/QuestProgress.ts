import mongoose, { Schema, Model, Types } from "mongoose";

export interface IQuestProgress {
  userId: Types.ObjectId;
  questId: Types.ObjectId;
  progress: number; // Progression actuelle (0 à criteria.value)
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type QuestProgressModel = Model<IQuestProgress>;

const QuestProgressSchema = new Schema<IQuestProgress, QuestProgressModel>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  questId: { type: Schema.Types.ObjectId, ref: "Quest", required: true, index: true },
  progress: { type: Number, default: 0, min: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });

QuestProgressSchema.index({ userId: 1, questId: 1 }, { unique: true });
QuestProgressSchema.index({ userId: 1, isCompleted: 1 });

export const QuestProgress = (mongoose.models.QuestProgress as QuestProgressModel) || mongoose.model<IQuestProgress, QuestProgressModel>("QuestProgress", QuestProgressSchema);
