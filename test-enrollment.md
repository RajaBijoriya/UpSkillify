# Testing Student Enrollment in Instructor Dashboard

## Step-by-Step Test Process

### Prerequisites
1. Backend server running on port 5000
2. Frontend server running on port 3000
3. MongoDB database connected

### Test Steps

#### Step 1: Create Test Instructor Account
1. Go to http://localhost:3000/signup
2. Create account with:
   - Name: "Test Instructor"
   - Email: "instructor@test.com"
   - Password: "password123"
   - Role: "instructor"

#### Step 2: Create Test Course (as Instructor)
1. Login as instructor
2. Go to Instructor Dashboard
3. Create a new course:
   - Title: "Test Course"
   - Description: "Test course for enrollment"
   - Category: "Programming"
   - Price: 99

#### Step 3: Create Test Student Account
1. Logout from instructor account
2. Go to http://localhost:3000/signup
3. Create account with:
   - Name: "Test Student"
   - Email: "student@test.com"
   - Password: "password123"
   - Role: "student"

#### Step 4: Enroll in Course (as Student)
1. Login as student
2. Go to Browse Courses
3. Find "Test Course"
4. Click "Enroll Now"
5. Verify enrollment success message

#### Step 5: Check Instructor Dashboard (as Instructor)
1. Logout from student account
2. Login as instructor
3. Go to Instructor Dashboard
4. Look at "Student Enrollments" section
5. Click "Refresh" button
6. Check browser console (F12) for debug messages

### Expected Results
- Debug panel should show: "Enrollment data keys: 1"
- Course card should show: "Students Enrolled: 1"
- "Show Details" should reveal student information

### Debug Information to Check
Open browser console (F12) and look for:
- "Fetching enrollment data..."
- "Enrollment API response: [object]"
- "Total students calculated: 1"

### Common Issues
1. **No enrollments found**: Make sure student actually enrolled
2. **API errors**: Check backend server is running
3. **Authentication issues**: Verify user roles are correct
4. **Database issues**: Check MongoDB connection

### Manual Database Check (if needed)
If still not working, you can check the database directly:
```javascript
// In MongoDB shell or compass
db.enrollments.find({}).populate('user').populate('course')
db.courses.find({instructor: ObjectId("instructor_id")})
```
