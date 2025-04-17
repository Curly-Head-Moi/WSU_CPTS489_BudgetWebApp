const SupportInquiry = require('../models/SupportInquiry');

// Submit a new support inquiry
exports.submitInquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.render('support', { 
        error: 'Please fill in all required fields',
        formData: req.body,
        success: null
      });
    }
    
    // Create the support inquiry in the database
    const inquiry = await SupportInquiry.create({
      name,
      email,
      message
    });

    // Return success message
    return res.render('support', { 
      error: null,
      formData: {},
      success: 'Your support inquiry has been submitted successfully. We will contact you shortly.'
    });
  } catch (error) {
    console.error('Error submitting support inquiry:', error);
    return res.render('support', { 
      error: 'An error occurred while submitting your inquiry. Please try again.',
      formData: req.body,
      success: null
    });
  }
};

// Get all support inquiries (for admin)
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await SupportInquiry.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    return res.render('admin/supportInquiries', { inquiries });
  } catch (error) {
    console.error('Error fetching support inquiries:', error);
    return res.status(500).send('Error fetching support inquiries');
  }
};

// Update inquiry status (for admin)
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    
    const inquiry = await SupportInquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).send('Inquiry not found');
    }
    
    inquiry.status = status;
    await inquiry.save();
    
    return res.redirect('/support/admin/inquiries');
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return res.status(500).send('Error updating inquiry status');
  }
}; 