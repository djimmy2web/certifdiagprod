import mongoose, { Schema, Model, Types } from "mongoose";

export interface IQuestCriteria {
  type: 'xp' | 'streak' | 'quiz_completed' | 'questions_answered' | 'badge_unlocked' | 'score_threshold' | 'correct_streak' | 'lesson_resumed' | 'error_quiz';
  value: number; // Valeur cible (ex: 20 pour 20 XP, 3 pour 3 quiz)
  additionalData?: {
    minScore?: number; // Pour les quêtes de score minimum
    lessonCount?: number; // Pour les quêtes de score sur plusieurs leçons
    streakCount?: number; // Pour les quêtes de bonnes réponses d'affilée
  };
}

export interface IQuest {
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  criteria: IQuestCriteria;
  reward?: {
    xp?: number;
    badge?: Types.ObjectId;
  };
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type QuestModel = Model<IQuest>;

const QuestCriteriaSchema = new Schema<IQuestCriteria>({
  type: { 
    type: String, 
    enum: ['xp', 'streak', 'quiz_completed', 'questions_answered', 'badge_unlocked', 'score_threshold', 'correct_streak', 'lesson_resumed', 'error_quiz'],
    required: true 
  },
  value: { type: Number, required: true },
  additionalData: {
    minScore: { type: Number },
    lessonCount: { type: Number },
    streakCount: { type: Number }
  }
}, { _id: false });

const QuestSchema = new Schema<IQuest, QuestModel>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  isActive: { type: Boolean, default: true, index: true },
  criteria: { type: QuestCriteriaSchema, required: true },
  reward: {
    xp: { type: Number },
    badge: { type: Schema.Types.ObjectId, ref: "Badge" }
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export const Quest = (mongoose.models.Quest as QuestModel) || mongoose.model<IQuest, QuestModel>("Quest", QuestSchema);
