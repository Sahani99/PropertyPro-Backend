// ADMIN: Get all visit requests
const getAllVisitRequestsForAdmin = async (req, res) => {
    try {
        const requests = await VisitRequest.find().populate('propertyId', 'title address');
        res.json(requests);
    } catch (error) {
        console.error('Error in getAllVisitRequestsForAdmin:', error);
        res.status(500).json({ message: 'Error fetching visit requests.' });
    }
};

// ADMIN: Update visit request status
const updateVisitRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const request = await VisitRequest.findById(id);
        if (!request) return res.status(404).json({ message: 'Visit request not found.' });
        request.status = status;
        await request.save();
        res.json({ message: 'Visit request status updated.', request });
    } catch (error) {
        console.error('Error in updateVisitRequestStatus:', error);
        res.status(500).json({ message: 'Error updating visit request status.' });
    }
};
const VisitRequest = require('../models/VisitRequests.model');
const Property = require('../models/Property.model'); // To verify property exists
//const mongoose = require('mongoose');

// @desc    Create a new visit request
// @route   POST /api/visit-requests
// @access  Private (Authenticated Users via checkAuth)
const createVisitRequest = async (req, res) => {
    const {
        propertyId,
        preferredDate,
        preferredTime,
        contactNumber,
        message
    } = req.body;

    const userId = req.loggedInUser?._id;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    if (!propertyId || !preferredDate || !preferredTime || !contactNumber) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const propertyExists = await Property.findById(propertyId);
        if (!propertyExists) {
            return res.status(404).json({ message: 'Property not found.' });
        }

        const newVisitRequest = new VisitRequest({
            userId,
            propertyId,
            userName: req.loggedInUser.name,
            userEmail: req.loggedInUser.email,
            preferredDate: new Date(preferredDate),
            preferredTime,
            contactNumber,
            message: message || '',
            status: 'pending'
        });

        const savedRequest = await newVisitRequest.save();
        res.status(201).json(savedRequest);
    } catch (error) {
        console.error('Error creating visit request:', error);
        res.status(500).json({ message: 'Server error while creating visit request.' });
    }
};

const getMyVisitRequests = async (req, res) => {
    try {
        const userId = req.loggedInUser.id;
        const requests = await VisitRequest.find({ userId: userId })
            .populate('propertyId', 'title address imageUrls')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error("Error in getMyVisitRequests:", error);
        res.status(500).json({ message: "Server error while fetching your visit requests." });
    }
};

const cancelMyVisitRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.loggedInUser.id;

        const request = await VisitRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Visit request not found.' });
        }
        if (request.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to cancel this request.' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Cannot cancel a request with status: ${request.status}.` });
        }
        request.status = 'cancelled_by_user';
        const updatedRequest = await request.save();
        res.json({ message: 'Your visit request has been cancelled.', request: updatedRequest });
    } catch (error) {
        console.error("Error in cancelMyVisitRequest:", error);
        res.status(500).json({ message: "Server error while cancelling your request." });
    }
};


module.exports = {
    createVisitRequest,
    getMyVisitRequests,
    cancelMyVisitRequest,
    getAllVisitRequestsForAdmin,
    updateVisitRequestStatus
};