// backend/controllers/admin/futureProject.admin.controller.js
const FutureApartmentProject = require('../../models/FutureApartmentProject.model');
const cloudinary = require('../../config/cloudinary');
const mongoose = require('mongoose');

// @desc    Create a new Future Project (Admin)
// @route   POST /api/admin/future-projects
// @access  Private (Admin)
exports.createProject = async (req, res) => {
  try {
    const newProject = new FutureApartmentProject({ ...req.body });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating future project (Admin):", error);
    res.status(400).json({ message: "Error creating project", error: error.message });
  }
};

// @desc    Update a project's details (Admin)
// @route   PUT /api/admin/future-projects/:projectId
// @access  Private (Admin)
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: 'Invalid project ID format.' });
    }

    const updatedProject = await FutureApartmentProject.findByIdAndUpdate(
      projectId,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: 'Future project not found.' });
    }
    res.json(updatedProject);
  } catch (error) {
    console.error("Error updating project details (Admin):", error);
    res.status(400).json({ message: 'Error updating project details', error: error.message });
  }
};

// @desc    Delete a project (Admin)
// @route   DELETE /api/admin/future-projects/:projectId
// @access  Private (Admin)
exports.deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid project ID format.' });
        }
        const project = await FutureApartmentProject.findByIdAndDelete(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Future project not found.' });
        }
        // TODO: Add logic here to delete associated units and Cloudinary assets if necessary
        res.json({ message: 'Future project deleted successfully.' });
    } catch (error) {
        console.error("Error deleting future project (Admin):", error);
        res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
};

// @desc    Get Cloudinary signature for signed uploads (Admin)
// @route   POST /api/admin/future-projects/cloudinary-signature
// @access  Private (Admin)
exports.generateCloudinarySignature = (req, res) => {
  try {
    const { fileType } = req.body; // Expect 'glb' or 'cover' from the request body
    const timestamp = Math.round(new Date().getTime() / 1000);
    const uploadPreset = process.env.CLOUDINARY_SIGNED_UPLOAD_PRESET;

    if (!uploadPreset || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Cloudinary signature generation failed: Preset or API secret is not configured.");
        return res.status(500).json({ message: "Server configuration error for uploads." });
    }

    let folder = '';
    if (fileType === 'glb') {
        folder = 'future_projects/models';
    } else if (fileType === 'cover') {
        folder = 'future_projects/covers'; // Use a different folder for images
    } else {
        return res.status(400).json({ message: "Invalid file type specified for signature." });
    }
    
    const paramsToSign = {
      timestamp: timestamp,
      upload_preset: uploadPreset,
      folder: folder
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: uploadPreset,
      folder: paramsToSign.folder,
    });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    res.status(500).json({ message: "Error generating upload signature", error: error.message });
  }
};