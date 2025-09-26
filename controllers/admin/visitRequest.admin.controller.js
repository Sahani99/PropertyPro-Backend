const VisitRequest = require('../../models/VisitRequests.model');
const sendEmail = require('../../utils/sendEmail');

// ADMIN: Get all visit requests
const getAllVisitRequestsForAdmin = async (req, res) => {
  try {
    const requests = await VisitRequest.find()
      .populate('propertyId', 'title address');
    res.json(requests);
  } catch (error) {
    console.error('Error in getAllVisitRequestsForAdmin:', error);
    res.status(500).json({ message: 'Error fetching visit requests.' });
  }
};

// ADMIN: Update visit request status
// Only send email if status is 'confirmed'
const updateVisitRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await VisitRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Visit request not found.' });

    request.status = status;
    await request.save();

    // Send email only if confirmed
    if (status.toLowerCase() === 'confirmed') {
      await sendEmail({
        email: request.userEmail,
        subject: 'Your Visit Request is Confirmed',
        message: `Hello ${request.userName},\n\nYour visit request scheduled on ${request.preferredDate.toDateString()} at ${request.preferredTime} has been confirmed.\n\nThank you.`
      });
    }

    res.json({ message: 'Visit request status updated.', request });
  } catch (error) {
    console.error('Error in updateVisitRequestStatus:', error);
    res.status(500).json({ message: 'Error updating visit request status.' });
  }
};

module.exports = {
  getAllVisitRequestsForAdmin,
  updateVisitRequestStatus,
};
