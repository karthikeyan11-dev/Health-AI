import { Types } from 'mongoose';
import {
  CardiovascularAssessmentModel,
  type ICardiovascularAssessment,
  type ICardiovascularAssessmentDocument,
} from '../../models/cardiovascular-assessment.model';

export class CardiovascularRepository {
  /**
   * Creates and persists a new cardiovascular risk assessment record.
   */
  public async create(
    assessmentData: Partial<ICardiovascularAssessment>,
  ): Promise<ICardiovascularAssessmentDocument> {
    return await CardiovascularAssessmentModel.create(assessmentData);
  }

  /**
   * Retrieves the most recent cardiovascular risk assessment for a user.
   */
  public async findLatestByUserId(
    userId: string | Types.ObjectId,
  ): Promise<ICardiovascularAssessmentDocument | null> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return await CardiovascularAssessmentModel.findOne({ userId: userObjId })
      .sort({ timestamp: -1 })
      .exec();
  }

  /**
   * Retrieves paginated risk assessment history for a user sorted chronologically.
   */
  public async getHistoryByUserId(
    userId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ records: ICardiovascularAssessmentDocument[]; total: number }> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      CardiovascularAssessmentModel.find({ userId: userObjId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      CardiovascularAssessmentModel.countDocuments({ userId: userObjId }),
    ]);

    return { records, total };
  }
}

export const cardiovascularRepository = new CardiovascularRepository();
