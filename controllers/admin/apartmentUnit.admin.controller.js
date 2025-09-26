// backend/controllers/admin/apartmentUnit.admin.controller.js
const ApartmentUnit = require('../../models/ApartmentUnit.model');
const FutureApartmentProject = require('../../models/FutureApartmentProject.model');
const cloudinary = require('../../config/cloudinary');
const streamifier = require('streamifier');
const mongoose = require('mongoose');

// @desc    Create a new unit for a specific project
// @route   POST /api/admin/future-projects/:projectId/units
// @access  Private (Admin)
exports.createUnit = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID format.' });
        }

        const project = await FutureApartmentProject.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Parent project not found.' });
        }

        const newUnit = new ApartmentUnit({ ...req.body, projectId });
        await newUnit.save();
        
        res.status(201).json(newUnit);
    } catch (error) {
        console.error("Error in createUnit (Admin):", error);
        res.status(400).json({ message: 'Error creating unit', error: error.message });
    }
};

// @desc    Update a specific unit
// @route   PUT /api/admin/future-projects/:projectId/units/:unitId
// @access  Private (Admin)
exports.updateUnit = async (req, res) => {
    try {
        const { unitId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(unitId)) {
            return res.status(400).json({ message: 'Invalid unit ID format.' });
        }

        const updatedUnit = await ApartmentUnit.findByIdAndUpdate(unitId, req.body, { new: true, runValidators: true });
        if (!updatedUnit) {
            return res.status(404).json({ message: 'Apartment unit not found.' });
        }
        res.json(updatedUnit);
    } catch (error) {
        console.error("Error updating unit (Admin):", error);
        res.status(400).json({ message: 'Error updating unit', error: error.message });
    }
};

// @desc    Delete a specific unit
// @route   DELETE /api/admin/future-projects/:projectId/units/:unitId
// @access  Private (Admin)
exports.deleteUnit = async (req, res) => {
    try {
        const { unitId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(unitId)) {
            return res.status(400).json({ message: 'Invalid unit ID format.' });
        }
        
        const unit = await ApartmentUnit.findById(unitId);
        if (!unit) {
            return res.status(404).json({ message: 'Apartment unit not found.' });
        }

        if (unit.floorPlanImagePublicId) {
            await cloudinary.uploader.destroy(unit.floorPlanImagePublicId);
        }

        await ApartmentUnit.findByIdAndDelete(unitId);
        res.json({ message: 'Apartment unit deleted successfully.' });
    } catch (error) {
        console.error("Error deleting unit (Admin):", error);
        res.status(500).json({ message: 'Error deleting unit', error: error.message });
    }
};

// @desc    Upload Floor Plan Image for a Unit
// @route   POST /api/admin/future-projects/:projectId/units/:unitId/floorplan
// @access  Private (Admin)
exports.uploadFloorPlanImage = async (req, res) => {
    const { unitId, projectId } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: 'No floor plan image file uploaded.' });
    }

    try {
        const unit = await ApartmentUnit.findById(unitId);
        if (!unit || unit.projectId.toString() !== projectId) {
            return res.status(404).json({ message: 'Unit not found or not part of this project.' });
        }

        if (unit.floorPlanImagePublicId) {
            await cloudinary.uploader.destroy(unit.floorPlanImagePublicId);
        }

        let cld_upload_stream = cloudinary.uploader.upload_stream(
          { folder: `future_projects/${projectId}/units/${unitId}/floorplans` },
          async (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error (Floor Plan):', error);
              return res.status(500).json({ message: 'Cloudinary floor plan upload failed', error });
            }
            unit.floorPlanImageUrl = result.url;
            unit.floorPlanImageSecureUrl = result.secure_url;
            unit.floorPlanImagePublicId = result.public_id;
            await unit.save();
            res.json({ message: 'Floor plan image uploaded successfully', unit });
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
    } catch (error) {
        console.error("Error uploading floor plan image:", error);
        res.status(500).json({ message: 'Error uploading floor plan', error: error.message });
    }
};