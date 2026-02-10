# How to Add Status Column to Users Table

You have **3 options** to add the `status` column:

## Option 1: Run the Migration Script (Easiest) ✅

```bash
cd version_1/lms_backend
node scripts/add-status-column.js
```

This script will:
- Connect to your database
- Check if column exists
- Add the column if needed
- Update existing users to 'active'

## Option 2: Use TypeORM Migration System

```bash
cd version_1/lms_backend
npm run db:migrate
```

This will run all pending migrations including the new `AddUserStatusColumn` migration.

## Option 3: Connect to MySQL Directly

If you have MySQL client installed:

```bash
mysql -h db-lms-digitalt3.cejofalfd7i2.us-east-2.rds.amazonaws.com -u admin -p digitalt3_lms
```

Then enter your password when prompted, and run:

```sql
ALTER TABLE users ADD COLUMN status ENUM('pending', 'active', 'revoked') DEFAULT 'active' NOT NULL;
UPDATE users SET status = 'active' WHERE status IS NULL OR status = '';
```

## Recommended: Use Option 1

The script (`scripts/add-status-column.js`) is the safest and easiest way. It handles errors gracefully and checks if the column already exists.

## After Migration

Once the migration is complete:
- ✅ Login will work with status checks
- ✅ Registration will create pending accounts
- ✅ Admin can approve/reject accounts
- ✅ Admin can revoke accounts
