const Settings = require('../models/Settings');

exports.getSettings = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const settings = await Settings.find(query);
    const grouped = settings.reduce((acc, s) => {
      if (!acc[s.category]) acc[s.category] = {};
      acc[s.category][s.key] = s.value;
      return acc;
    }, {});
    res.json({ success: true, data: grouped });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    const updates = [];
    for (const [key, value] of Object.entries(settings)) {
      updates.push(Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true }));
    }
    await Promise.all(updates);
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.initDefaultSettings = async (req, res, next) => {
  try {
    const defaults = [
      { key: 'company_name', value: 'Employee Management Co.', category: 'basic', description: 'Company name' },
      { key: 'company_email', value: 'hr@company.com', category: 'basic', description: 'Company email' },
      { key: 'annual_leave_days', value: 20, category: 'leave', description: 'Annual leave days per year' },
      { key: 'sick_leave_days', value: 10, category: 'leave', description: 'Sick leave days per year' },
      { key: 'personal_leave_days', value: 5, category: 'leave', description: 'Personal leave days per year' },
      { key: 'payroll_day', value: 25, category: 'payroll', description: 'Payroll processing day' },
      { key: 'currency', value: 'USD', category: 'payroll', description: 'Default currency' },
      { key: 'tax_rate', value: 0.2, category: 'payroll', description: 'Default tax rate' },
      { key: 'smtp_host', value: 'smtp.gmail.com', category: 'email', description: 'SMTP host' },
      { key: 'smtp_port', value: 587, category: 'email', description: 'SMTP port' },
      { key: 'theme', value: 'light', category: 'ui', description: 'UI theme' },
      { key: 'sidebar_collapsed', value: false, category: 'ui', description: 'Sidebar collapsed state' },
    ];
    for (const setting of defaults) {
      await Settings.findOneAndUpdate({ key: setting.key }, setting, { upsert: true });
    }
    res.json({ success: true, message: 'Default settings initialized' });
  } catch (error) {
    next(error);
  }
};
