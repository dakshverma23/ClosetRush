const ScienceSection = require('../models/ScienceSection');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all science sections (public)
exports.getAllSections = async (req, res) => {
  try {
    const sections = await ScienceSection.find({ active: true })
      .sort({ order: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      sections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch science sections',
      error: error.message
    });
  }
};

// Get single section by ID
exports.getSectionById = async (req, res) => {
  try {
    const section = await ScienceSection.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    res.json({
      success: true,
      section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch section',
      error: error.message
    });
  }
};

// Create new section (admin only)
exports.createSection = async (req, res) => {
  try {
    const { title, order, layout, content, backgroundColor, textColor } = req.body;
    
    // Check if order already exists
    const existingSection = await ScienceSection.findOne({ order });
    if (existingSection) {
      return res.status(400).json({
        success: false,
        message: `Section with order ${order} already exists`
      });
    }
    
    const section = new ScienceSection({
      title,
      order,
      layout,
      content,
      backgroundColor,
      textColor,
      images: []
    });
    
    await section.save();
    
    res.status(201).json({
      success: true,
      message: 'Science section created successfully',
      section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create section',
      error: error.message
    });
  }
};

// Update section (admin only)
exports.updateSection = async (req, res) => {
  try {
    const { title, order, layout, content, active, backgroundColor, textColor } = req.body;
    
    const section = await ScienceSection.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    // If order is being changed, check if new order is available
    if (order && order !== section.order) {
      const existingSection = await ScienceSection.findOne({ 
        order, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingSection) {
        return res.status(400).json({
          success: false,
          message: `Section with order ${order} already exists`
        });
      }
    }
    
    // Update fields
    if (title) section.title = title;
    if (order) section.order = order;
    if (layout) section.layout = layout;
    if (content) section.content = content;
    if (typeof active !== 'undefined') section.active = active;
    if (backgroundColor) section.backgroundColor = backgroundColor;
    if (textColor) section.textColor = textColor;
    
    await section.save();
    
    res.json({
      success: true,
      message: 'Section updated successfully',
      section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update section',
      error: error.message
    });
  }
};

// Upload image to section (admin only)
exports.uploadImage = async (req, res) => {
  try {
    const { caption, position } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    const section = await ScienceSection.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'closet-rush/science-sections',
      resource_type: 'image'
    });
    
    // Add image to section
    section.images.push({
      url: result.secure_url,
      publicId: result.public_id,
      caption: caption || '',
      position: position || 'left'
    });
    
    await section.save();
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// Delete image from section (admin only)
exports.deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const section = await ScienceSection.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    const image = section.images.id(imageId);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);
    
    // Remove from section
    section.images.pull(imageId);
    await section.save();
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
      section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

// Delete section (admin only)
exports.deleteSection = async (req, res) => {
  try {
    const section = await ScienceSection.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    // Delete all images from Cloudinary
    for (const image of section.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }
    
    await section.deleteOne();
    
    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete section',
      error: error.message
    });
  }
};
