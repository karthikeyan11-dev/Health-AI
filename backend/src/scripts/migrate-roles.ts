import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health_ai';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_1234567890';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'dev_refresh_jwt_secret_key_1234567890';
process.env.SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'patient@healthai.com';
process.env.SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'PatientPassword123!';

import { connectDatabase, disconnectDatabase } from '../config/database';
import { UserModel, UserRole } from '../models/user.model';
import { logger } from '../config/logger';

async function migrateRoles(): Promise<void> {
  try {
    await connectDatabase();

    // Update all users whose role is not PATIENT or SYSTEM to PATIENT
    const result = await UserModel.updateMany(
      { role: { $nin: [UserRole.PATIENT, UserRole.SYSTEM] } },
      { $set: { role: UserRole.PATIENT } },
    );

    logger.info(
      { modifiedCount: result.modifiedCount },
      'Successfully migrated non-patient/system roles to PATIENT',
    );

    // Also update System Admin user to Default Patient if present
    const adminUser = await UserModel.findOne({ email: 'admin@healthai.com' });
    if (adminUser) {
      adminUser.firstName = 'Default';
      adminUser.lastName = 'Patient';
      adminUser.email = 'patient@healthai.com';
      adminUser.role = UserRole.PATIENT;
      await adminUser.save();
      logger.info('Updated admin@healthai.com to patient@healthai.com');
    }
  } catch (err) {
    logger.error({ err }, 'Error migrating roles in database');
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

void migrateRoles();
