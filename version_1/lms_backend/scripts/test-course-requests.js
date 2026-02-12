/**
 * Test script to check course requests endpoint
 * Run with: node scripts/test-course-requests.js
 */

require('dotenv').config();
const { initializeDataSource } = require('../src/config/db');

async function testCourseRequests() {
  try {
    console.log('Connecting to database...');
    const ds = await initializeDataSource();

    const courseRepo = ds.getRepository('Course');
    
    // Get all courses
    const allCourses = await courseRepo.find({
      where: { deletedAt: null },
      relations: { createdBy: true },
    });
    
    console.log(`\n📊 Total courses: ${allCourses.length}`);
    console.log('\n📋 Course Status Breakdown:');
    const statusCounts = {};
    allCourses.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });
    
    // Get pending courses
    const pendingCourses = await courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.createdBy', 'createdBy')
      .where('course.deletedAt IS NULL')
      .andWhere('course.status = :status', { status: 'pending_approval' })
      .orderBy('course.createdAt', 'DESC')
      .getMany();
    
    console.log(`\n⏳ Pending approval courses: ${pendingCourses.length}`);
    if (pendingCourses.length > 0) {
      console.log('\n📝 Pending Courses:');
      pendingCourses.forEach(c => {
        console.log(`  - ID: ${c.id}, Title: "${c.title}", Instructor: ${c.createdBy?.name || 'Unknown'}`);
      });
    } else {
      console.log('\n⚠️  No courses with status "pending_approval" found.');
      console.log('   Make sure courses are being published with this status.');
    }
    
    await ds.destroy();
    console.log('\n✅ Test complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testCourseRequests();
