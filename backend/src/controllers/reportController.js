const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

exports.getDepartmentReport = async (req, res, next) => {
  try {
    const { department, month, year } = req.query;
    const query = {};
    if (department) query._id = department;

    const departments = await Department.find(query);
    const report = [];

    for (const dept of departments) {
      const employees = await Employee.find({ department: dept._id });
      const employeeIds = employees.map((e) => e._id);

      const attendanceQuery = { employee: { $in: employeeIds } };
      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        attendanceQuery.date = { $gte: startDate, $lte: endDate };
      }
      const attendance = await Attendance.find(attendanceQuery);

      const payrollQuery = { employee: { $in: employeeIds } };
      if (month && year) {
        payrollQuery.month = parseInt(month);
        payrollQuery.year = parseInt(year);
      }
      const payroll = await Payroll.find(payrollQuery);

      const present = attendance.filter((a) => a.status === 'present').length;
      const absent = attendance.filter((a) => a.status === 'absent').length;
      const halfDay = attendance.filter((a) => a.status === 'half-day').length;
      const onLeave = attendance.filter((a) => a.status === 'on-leave').length;
      const totalOvertime = attendance.reduce((sum, a) => sum + (a.overtime || 0), 0);

      const totalSalary = payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0);
      const totalPaid = payroll.filter((p) => p.status === 'paid').reduce((sum, p) => sum + (p.netSalary || 0), 0);
      const totalPending = payroll.filter((p) => p.status !== 'paid').reduce((sum, p) => sum + (p.netSalary || 0), 0);
      const totalDeductions = payroll.reduce((sum, p) => {
        const d = p.deductions || {};
        return sum + (d.tax || 0) + (d.insurance || 0) + (d.loan || 0) + (d.other || 0);
      }, 0);
      const totalAllowances = payroll.reduce((sum, p) => {
        const a = p.allowances || {};
        return sum + (a.housing || 0) + (a.transport || 0) + (a.medical || 0) + (a.other || 0);
      }, 0);

      report.push({
        department: { _id: dept._id, name: dept.name, code: dept.code, budget: dept.budget },
        employees: {
          total: employees.length,
          active: employees.filter((e) => e.status === 'active').length,
          inactive: employees.filter((e) => e.status !== 'active').length,
          list: employees.map((e) => ({
            _id: e._id,
            employeeId: e.employeeId,
            name: `${e.firstName} ${e.lastName}`,
            position: e.position,
            salary: e.salary,
            status: e.status,
          })),
        },
        attendance: {
          totalRecords: attendance.length,
          present,
          absent,
          halfDay,
          onLeave,
          totalOvertime,
          attendanceRate: attendance.length > 0 ? ((present / attendance.length) * 100).toFixed(1) : 0,
        },
        payroll: {
          totalRecords: payroll.length,
          totalSalary,
          totalPaid,
          totalPending,
          totalDeductions,
          totalAllowances,
          averageSalary: employees.length > 0 ? (totalSalary / employees.length).toFixed(0) : 0,
        },
      });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

exports.exportPDF = async (req, res, next) => {
  try {
    const { department, month, year } = req.query;
    const query = {};
    if (department) query._id = department;

    const departments = await Department.find(query);

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=department-report-${Date.now()}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text('Department Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    const period = month && year ? `Period: ${month}/${year}` : 'All Time';
    doc.text(`Generated: ${new Date().toLocaleDateString()} | ${period}`, { align: 'center' });
    doc.moveDown(1);

    for (const dept of departments) {
      const employees = await Employee.find({ department: dept._id });
      const employeeIds = employees.map((e) => e._id);

      const attendanceQuery = { employee: { $in: employeeIds } };
      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        attendanceQuery.date = { $gte: startDate, $lte: endDate };
      }
      const attendance = await Attendance.find(attendanceQuery);

      const payrollQuery = { employee: { $in: employeeIds } };
      if (month && year) {
        payrollQuery.month = parseInt(month);
        payrollQuery.year = parseInt(year);
      }
      const payroll = await Payroll.find(payrollQuery);

      const present = attendance.filter((a) => a.status === 'present').length;
      const totalSalary = payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0);
      const totalPaid = payroll.filter((p) => p.status === 'paid').reduce((sum, p) => sum + (p.netSalary || 0), 0);
      const totalPending = payroll.filter((p) => p.status !== 'paid').reduce((sum, p) => sum + (p.netSalary || 0), 0);

      if (doc.y > 450) doc.addPage();

      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text(`${dept.name} (${dept.code})`, { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(9).font('Helvetica').fillColor('#333');
      doc.text(`Employees: ${employees.length} | Budget: $${(dept.budget || 0).toLocaleString()}`);
      doc.moveDown(0.2);
      doc.text(`Attendance Rate: ${attendance.length > 0 ? ((present / attendance.length) * 100).toFixed(1) : 0}% | Total Salary: $${totalSalary.toLocaleString()} | Paid: $${totalPaid.toLocaleString()} | Pending: $${totalPending.toLocaleString()}`);
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000');
      const tableTop = doc.y;
      const colLeft = [30, 120, 260, 380, 480, 580, 670];
      const headers = ['Employee ID', 'Name', 'Position', 'Salary', 'Status'];

      doc.fillColor('#4f46e5');
      doc.rect(30, tableTop, 740, 18).fill();
      doc.fillColor('#fff').fontSize(8).font('Helvetica-Bold');
      headers.forEach((h, i) => doc.text(h, colLeft[i], tableTop + 4, { width: 100 }));

      doc.fillColor('#000').font('Helvetica').fontSize(8);
      let rowY = tableTop + 22;
      employees.forEach((emp, idx) => {
        if (rowY > 560) {
          doc.addPage();
          rowY = 30;
        }
        if (idx % 2 === 0) {
          doc.fillColor('#f3f4f6');
          doc.rect(30, rowY - 2, 740, 16).fill();
        }
        doc.fillColor('#333');
        doc.text(emp.employeeId || '-', colLeft[0], rowY, { width: 80 });
        doc.text(`${emp.firstName} ${emp.lastName}`, colLeft[1], rowY, { width: 130 });
        doc.text(emp.position || '-', colLeft[2], rowY, { width: 110 });
        doc.text(`$${(emp.salary || 0).toLocaleString()}`, colLeft[3], rowY, { width: 90 });
        doc.text(emp.status || '-', colLeft[4], rowY, { width: 80 });
        rowY += 16;
      });

      doc.moveDown(1.5);
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

exports.exportExcel = async (req, res, next) => {
  try {
    const { department, month, year } = req.query;
    const query = {};
    if (department) query._id = department;

    const departments = await Department.find(query);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EMS';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('Summary', { properties: { defaultColWidth: 15 } });
    summarySheet.columns = [
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Code', key: 'code', width: 10 },
      { header: 'Employees', key: 'totalEmployees', width: 12 },
      { header: 'Active', key: 'active', width: 10 },
      { header: 'Attendance Rate %', key: 'attendanceRate', width: 18 },
      { header: 'Total Salary', key: 'totalSalary', width: 15 },
      { header: 'Total Paid', key: 'totalPaid', width: 15 },
      { header: 'Total Pending', key: 'totalPending', width: 15 },
      { header: 'Budget', key: 'budget', width: 15 },
    ];

    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

    for (const dept of departments) {
      const employees = await Employee.find({ department: dept._id });
      const employeeIds = employees.map((e) => e._id);

      const attendanceQuery = { employee: { $in: employeeIds } };
      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        attendanceQuery.date = { $gte: startDate, $lte: endDate };
      }
      const attendance = await Attendance.find(attendanceQuery);

      const payrollQuery = { employee: { $in: employeeIds } };
      if (month && year) {
        payrollQuery.month = parseInt(month);
        payrollQuery.year = parseInt(year);
      }
      const payroll = await Payroll.find(payrollQuery);

      const present = attendance.filter((a) => a.status === 'present').length;
      const totalSalary = payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0);
      const totalPaid = payroll.filter((p) => p.status === 'paid').reduce((sum, p) => sum + (p.netSalary || 0), 0);
      const totalPending = payroll.filter((p) => p.status !== 'paid').reduce((sum, p) => sum + (p.netSalary || 0), 0);

      summarySheet.addRow({
        department: dept.name,
        code: dept.code,
        totalEmployees: employees.length,
        active: employees.filter((e) => e.status === 'active').length,
        attendanceRate: attendance.length > 0 ? ((present / attendance.length) * 100).toFixed(1) : 0,
        totalSalary,
        totalPaid,
        totalPending,
        budget: dept.budget || 0,
      });

      const empSheet = workbook.addWorksheet(dept.name.substring(0, 31));
      empSheet.columns = [
        { header: 'Employee ID', key: 'employeeId', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Position', key: 'position', width: 20 },
        { header: 'Salary', key: 'salary', width: 12 },
        { header: 'Status', key: 'status', width: 12 },
      ];
      empSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      empSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

      employees.forEach((emp) => {
        empSheet.addRow({
          employeeId: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          position: emp.position,
          salary: emp.salary || 0,
          status: emp.status,
        });
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=department-report-${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
