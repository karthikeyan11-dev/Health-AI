import { Types } from 'mongoose';
import {
  StressAssessmentModel,
  type IStressAssessment,
  type IStressAssessmentDocument,
} from '../../models/stress-assessment.model';

export class StressRepository {
  /**
   * Creates and persists a new stress assessment record.
   */
  public async create(
    assessmentData: Partial<IStressAssessment>,
  ): Promise<IStressAssessmentDocument> {
    return await StressAssessmentModel.create(assessmentData);
  }

  /**
   * Retrieves the latest stress assessment for a user.
   */
  public async findLatestByUserId(
    userId: string | Types.ObjectId,
  ): Promise<IStressAssessmentDocument | null> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return await StressAssessmentModel.findOne({ userId: userObjId })
      .sort({ timestamp: -1 })
      .exec();
  }

  /**
   * Retrieves paginated stress assessment history for a user.
   */
  public async getHistoryByUserId(
    userId: string | Types.ObjectId,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ records: IStressAssessmentDocument[]; total: number }> {
    const userObjId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      StressAssessmentModel.find({ userId: userObjId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      StressAssessmentModel.countDocuments({ userId: userObjId }),
    ]);

    return { records, total };
  }
}

export const stressRepository = new StressRepository();
