const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Role = require('../models/Role');

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Shaurya',
  'Atharv', 'Advik', 'Pranav', 'Advaith', 'Aarush', 'Anirudh', 'Dhruv', 'Kabir', 'Rohan', 'Arnav',
  'Priya', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aanya', 'Aadhya', 'Aarohi', 'Anvi', 'Prisha',
  'Riya', 'Kiara', 'Nisha', 'Pooja', 'Sunita', 'Meera', 'Kavya', 'Nandini', 'Tanvi', 'Shreya',
  'Rahul', 'Amit', 'Suresh', 'Rajesh', 'Vikram', 'Sanjay', 'Manoj', 'Deepak', 'Ravi', 'Sunil',
  'Neha', 'Sneha', 'Priti', 'Manisha', 'Rekha', 'Geeta', 'Suman', 'Alka', 'Neelam', 'Usha',
  'Vikash', 'Manish', 'Abhishek', 'Rakesh', 'Ajay', 'Vijay', 'Sanjay', 'Mukesh', 'Nitin', 'Rajesh',
  'Divya', 'Bhavana', 'Megha', 'Sonia', 'Ritu', 'Kavita', 'Jyoti', 'Sarita', 'Archana', 'Lata',
  'Karan', 'Nikhil', 'Gaurav', 'Tarun', 'Aakash', 'Ashish', 'Sachin', 'Pankaj', 'Arun', 'Hitesh',
  'Shweta', 'Pallavi', 'Deepika', 'Seema', 'Vandana', 'Sabita', 'Renu', 'Anjali', 'Nisha', 'Puja'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Patel', 'Nair', 'Menon', 'Iyer',
  'Mishra', 'Pandey', 'Tiwari', 'Choudhary', 'Joshi', 'Rao', 'Das', 'Banerjee', 'Mukherjee', 'Sen',
  'Kapoor', 'Malhotra', 'Khanna', 'Chopra', 'Mehta', 'Shah', 'Trivedi', 'Pandit', 'Vyas', 'Saxena',
  'Yadav', 'Chauhan', 'Sinha', 'Raut', 'Kulkarni', 'Desai', 'Naik', 'Pillai', 'Bhat', 'Kamath',
  'Tandon', 'Bhatt', 'Nagpal', 'Sethi', 'Arora', 'Grover', 'Kohli', 'Suri', 'Chandra', 'Mittal'
];

const positions = {
  'Engineering': ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'DevOps Engineer', 'QA Engineer', 'Frontend Developer', 'Backend Developer'],
  'Human Resources': ['HR Executive', 'HR Manager', 'Recruiter', 'HR Coordinator', 'Training Specialist'],
  'Marketing': ['Marketing Executive', 'Content Writer', 'SEO Specialist', 'Brand Manager', 'Digital Marketing'],
  'Finance': ['Accountant', 'Financial Analyst', 'Auditor', 'CA', 'Finance Manager'],
  'Operations': ['Operations Manager', 'Supply Chain', 'Logistics', 'Coordinator', 'Analyst'],
  'Sales': ['Sales Executive', 'Sales Manager', 'Business Development', 'Account Manager', 'Regional Lead'],
  'IT': ['System Admin', 'Network Engineer', 'IT Support', 'Cloud Engineer', 'Security Analyst'],
  'Design': ['UI/UX Designer', 'Graphic Designer', 'Product Designer', 'Creative Lead', 'Visual Designer']
};
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Noida', 'Gurgaon', 'Indore', 'Bhopal', 'Nagpur'];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Get existing departments
  const depts = await Department.find();
  if (depts.length === 0) {
    console.log('No departments found. Run main seed first!');
    process.exit(1);
  }
  console.log(`Found ${depts.length} departments`);

  const deptMap = {};
  depts.forEach(d => { deptMap[d.name] = d._id; });
  const departments = Object.keys(deptMap);

  // Get admin user for reporting
  const adminUser = await User.findOne({ role: 'super-admin' });
  if (!adminUser) {
    console.log('No admin user found. Run main seed first!');
    process.exit(1);
  }

  const users = [];
  const employees = [];

  const existingCount = await Employee.countDocuments();
  const lastEmp = await Employee.findOne().sort({ employeeId: -1 }).select('employeeId');
  const startNum = lastEmp ? parseInt(lastEmp.employeeId.split('-')[1]) + 1 : 1;
  console.log(`Existing employees: ${existingCount}, starting from EMP-${String(startNum).padStart(4, '0')}`);

  console.log('Creating 100 employees...');

  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.emp${i + 11}@company.com`;
    const deptName = departments[Math.floor(Math.random() * departments.length)];
    const deptId = deptMap[deptName];
    const posList = positions[deptName];
    const position = posList[Math.floor(Math.random() * posList.length)];
    const gender = ['male', 'female'][Math.floor(Math.random() * 2)];
    const salary = Math.floor(Math.random() * 120000) + 30000;
    const joinYear = Math.floor(Math.random() * 4) + 2022;
    const joinMonth = Math.floor(Math.random() * 12) + 1;
    const joinDay = Math.floor(Math.random() * 28) + 1;
    const city = cities[Math.floor(Math.random() * cities.length)];
    const statuses = ['active', 'active', 'active', 'active', 'active', 'active', 'inactive', 'on-leave'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: 'password123',
      role: 'employee',
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    });
    users.push(user);

    const emp = await Employee.create({
      user: user._id,
      employeeId: `EMP-${String(startNum + i).padStart(4, '0')}`,
      firstName,
      lastName,
      email,
      phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      dateOfBirth: new Date(Math.floor(Math.random() * 20 + 1970), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      gender,
      address: {
        street: `${Math.floor(Math.random() * 500) + 1}, Main Street`,
        city,
        state: 'Maharashtra',
        zipCode: String(Math.floor(Math.random() * 900000) + 100000),
        country: 'India',
      },
      department: deptId,
      position,
      employmentType: ['full-time', 'full-time', 'full-time', 'part-time', 'contract'][Math.floor(Math.random() * 5)],
      joinDate: new Date(joinYear, joinMonth - 1, joinDay),
      salary,
      status,
      workShift: ['morning', 'morning', 'morning', 'afternoon', 'night', 'flexible'][Math.floor(Math.random() * 6)],
      emergencyContact: {
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
        phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        relationship: ['spouse', 'parent', 'sibling'][Math.floor(Math.random() * 3)],
      },
      bankDetails: {
        accountName: `${firstName} ${lastName}`,
        accountNumber: String(Math.floor(Math.random() * 9000000000) + 1000000000),
        bankName: ['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB'][Math.floor(Math.random() * 5)],
        ifscCode: `SBIN${Math.floor(Math.random() * 900000000) + 100000000}`,
        branch: city,
      },
      documents: {
        aadharNumber: `${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)}`,
        panNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000000 + 1000000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      },
      personalInfo: {
        nationality: 'Indian',
        maritalStatus: ['single', 'married', 'single', 'married'][Math.floor(Math.random() * 4)],
        bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][Math.floor(Math.random() * 8)],
      },
      education: {
        highestDegree: ['Bachelor\'s', 'Master\'s', 'Diploma', 'PhD'][Math.floor(Math.random() * 4)],
        institution: ['IIT Delhi', 'IIT Bombay', 'NIT Trichy', 'BITS Pilani', 'VIT Vellore', 'Delhi University', 'Mumbai University'][Math.floor(Math.random() * 7)],
        yearOfPassing: Math.floor(Math.random() * 10) + 2014,
        percentage: `${Math.floor(Math.random() * 30) + 70}%`,
      },
      experience: {
        totalYears: Math.floor(Math.random() * 15),
        previousCompany: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Accenture', 'Capgemini'][Math.floor(Math.random() * 7)],
        previousPosition: position,
      },
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'MongoDB', 'AWS', 'Docker'].slice(0, Math.floor(Math.random() * 5) + 2),
    });
    employees.push(emp);

    if ((i + 1) % 20 === 0) console.log(`  Created ${i + 1}/100 employees...`);
  }

  console.log('Creating attendance records for June 2026...');

  let attendanceCount = 0;
  for (const emp of employees) {
    for (let day = 1; day <= 28; day++) {
      const date = new Date(2026, 5, day);
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const rand = Math.random();
      let status, clockInHour, clockInMin, overtime = 0;
      if (rand < 0.6) { status = 'present'; clockInHour = 8 + Math.floor(Math.random() * 2); clockInMin = Math.floor(Math.random() * 60); }
      else if (rand < 0.75) { status = 'late'; clockInHour = 9 + Math.floor(Math.random() * 2); clockInMin = Math.floor(Math.random() * 60); }
      else if (rand < 0.85) { status = 'absent'; clockInHour = 0; clockInMin = 0; }
      else if (rand < 0.92) { status = 'half-day'; clockInHour = 9; clockInMin = Math.floor(Math.random() * 30); }
      else { status = 'on-leave'; clockInHour = 0; clockInMin = 0; }

      const clockIn = status !== 'absent' && status !== 'on-leave'
        ? new Date(2026, 5, day, clockInHour, clockInMin)
        : undefined;

      const clockOut = clockIn && status !== 'half-day'
        ? new Date(2026, 5, day, 17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))
        : clockIn && status === 'half-day'
        ? new Date(2026, 5, day, 13 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))
        : undefined;

      if (clockIn && clockOut) {
        const diff = (clockOut - clockIn) / (1000 * 60 * 60);
        overtime = Math.max(0, diff - 8);
      }

      await Attendance.create({
        employee: emp._id,
        date,
        clockIn,
        clockOut,
        status,
        overtime: Math.round(overtime * 100) / 100,
      });
      attendanceCount++;
    }
  }

  console.log(`Created ${attendanceCount} attendance records!`);

  // Create some payroll
  console.log('Creating payroll records...');
  let payrollCount = 0;
  for (const emp of employees) {
    if (emp.status !== 'active') continue;
    for (const m of [4, 5, 6]) {
      const allowances = { housing: emp.salary * 0.15, transport: emp.salary * 0.08, medical: emp.salary * 0.05, other: 0 };
      const deductions = { tax: emp.salary * 0.2, insurance: emp.salary * 0.05, loan: 0, other: 0 };
      const totalAllow = Object.values(allowances).reduce((a, b) => a + b, 0);
      const totalDed = Object.values(deductions).reduce((a, b) => a + b, 0);
      await Payroll.create({
        employee: emp._id, month: m, year: 2026,
        basicSalary: emp.salary, allowances, deductions,
        overtime: Math.random() * 500, bonus: m === 6 ? emp.salary * 0.1 : 0,
        netSalary: emp.salary + totalAllow - totalDed + (m === 6 ? emp.salary * 0.1 : 0),
        status: m < 6 ? 'paid' : 'pending',
        paidDate: m < 6 ? new Date(2026, m, 25) : undefined,
      });
      payrollCount++;
    }
  }

  console.log(`Created ${payrollCount} payroll records!`);
  console.log('---');
  console.log('DONE! 100 employees + attendance + payroll created!');
  console.log('All employee passwords: password123');
  process.exit();
};

seed().catch((err) => { console.error(err); process.exit(1); });
