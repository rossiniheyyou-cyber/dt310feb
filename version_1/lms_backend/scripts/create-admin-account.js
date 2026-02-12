require('dotenv').config();

const bcrypt = require('bcrypt');
const { createDataSourceFromEnv } = require('../src/config/db');

/**
 * Create admin account: rossini@dt3.com
 * Password: Ashwath@1234
 */
async function createAdminAccount() {
  const ds = createDataSourceFromEnv();
  await ds.initialize();

  try {
    const userRepo = ds.getRepository('User');
    const normalizedEmail = 'rossini@dt3.com'.trim().toLowerCase();
    const password = 'Ashwath@1234';
    const passwordHash = await bcrypt.hash(password, 12);

    // Check if admin already exists
    const existing = await userRepo.findOne({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    if (existing) {
      // Update existing user to admin with active status
      try {
        await userRepo.update(
          { id: existing.id },
          {
            passwordHash,
            role: 'admin',
            status: 'active',
            name: 'Rossini',
            professionalTitle: 'Senior Fullstack Developer',
          }
        );
        console.log('✓ Admin account updated successfully');
        console.log(`Email: ${normalizedEmail}`);
        console.log(`Password: ${password}`);
        console.log(`Role: admin`);
        console.log(`Status: active`);
      } catch (updateErr) {
        const msg = updateErr && updateErr.message ? String(updateErr.message) : '';
        if (msg.includes('Unknown column') || msg.includes('status') || msg.includes('professionalTitle') || updateErr.code === 'ER_BAD_FIELD_ERROR') {
          // Try without status/professionalTitle
          await userRepo.update(
            { id: existing.id },
            {
              passwordHash,
              role: 'admin',
              name: 'Rossini',
            }
          );
          console.log('✓ Admin account updated (without status/professionalTitle columns)');
          console.log(`Email: ${normalizedEmail}`);
          console.log(`Password: ${password}`);
          console.log(`Role: admin`);
        } else {
          throw updateErr;
        }
      }
    } else {
      // Create new admin user
      const userData = {
        email: normalizedEmail,
        passwordHash,
        name: 'Rossini',
        role: 'admin',
      };

      // Try to add status and professionalTitle
      try {
        userData.status = 'active';
        userData.professionalTitle = 'Senior Fullstack Developer';
      } catch (e) {
        // Columns don't exist - will be added via migration
      }

      const created = userRepo.create(userData);
      let user;
      try {
        user = await userRepo.save(created);
      } catch (saveErr) {
        const msg = saveErr && saveErr.message ? String(saveErr.message) : '';
        if (msg.includes('Unknown column') || msg.includes('status') || msg.includes('professionalTitle') || saveErr.code === 'ER_BAD_FIELD_ERROR') {
          delete userData.status;
          delete userData.professionalTitle;
          const createdWithout = userRepo.create(userData);
          user = await userRepo.save(createdWithout);
          user.status = 'active';
          user.professionalTitle = 'Senior Fullstack Developer';
        } else {
          throw saveErr;
        }
      }

      console.log('✓ Admin account created successfully');
      console.log(`Email: ${normalizedEmail}`);
      console.log(`Password: ${password}`);
      console.log(`Role: admin`);
      console.log(`Status: active`);
    }
  } catch (err) {
    console.error('Failed to create admin account:', err);
    throw err;
  } finally {
    await ds.destroy();
  }
}

// Run if executed directly
if (require.main === module) {
  createAdminAccount()
    .then(() => {
      console.log('\n✓ Admin account ready for login');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}

module.exports = { createAdminAccount };
