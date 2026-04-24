import React, { useState } from 'react';
import { Card, Upload, Button, message, Input, Form, Tabs } from 'antd';
import { UploadOutlined, SaveOutlined, CloudUploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const BrandSettingsPage = () => {
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('brandLogo') || '');
  const [newsletterLogoUrl, setNewsletterLogoUrl] = useState(localStorage.getItem('newsletterLogo') || '');
  const [brandName, setBrandName] = useState(localStorage.getItem('brandName') || 'ClosetRush');
  const [uploading, setUploading] = useState(false);
  const [uploadingNewsletter, setUploadingNewsletter] = useState(false);

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = 'dnuucbhwa';

  const handleLogoUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setLogoUrl(dataUrl);
      localStorage.setItem('brandLogo', dataUrl);
      
      // Dispatch storage event to notify other components
      window.dispatchEvent(new Event('storage'));
      
      message.success('Logo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleCloudinaryUpload = async (file, type = 'brand') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'closet_rush'); // Using your custom preset

    try {
      if (type === 'brand') {
        setUploading(true);
      } else {
        setUploadingNewsletter(true);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        if (type === 'brand') {
          setLogoUrl(data.secure_url);
          localStorage.setItem('brandLogo', data.secure_url);
        } else {
          setNewsletterLogoUrl(data.secure_url);
          localStorage.setItem('newsletterLogo', data.secure_url);
        }
        
        // Dispatch storage event to notify other components
        window.dispatchEvent(new Event('storage'));
        
        message.success(`${type === 'brand' ? 'Brand' : 'Newsletter'} logo uploaded to Cloudinary successfully!`);
      } else if (data.error) {
        // If unsigned upload fails, show helpful error
        console.error('Cloudinary error:', data.error);
        message.error(`Upload failed: ${data.error.message || 'Please change preset to Unsigned mode in Cloudinary settings'}`);
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      message.error('Failed to upload to Cloudinary. Using local upload instead is recommended.');
    } finally {
      if (type === 'brand') {
        setUploading(false);
      } else {
        setUploadingNewsletter(false);
      }
    }
  };

  const handleSave = (values) => {
    localStorage.setItem('brandName', values.brandName);
    setBrandName(values.brandName);
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    message.success('Brand settings saved successfully!');
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }
    return true;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Brand Settings</h1>
      
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: 'Navbar Logo',
            children: (
              <Card className="shadow-lg rounded-xl">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Navbar Brand Logo</h2>
                <p className="text-slate-600 mb-4">
                  Upload your brand logo for the navbar. Recommended size: 200x200px. Max file size: 2MB.
                </p>
                
                <div className="flex items-center gap-6 mb-6">
                  {/* Logo Preview */}
                  <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Brand Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">CR</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Buttons */}
                  <div className="flex flex-col gap-3">
                    <Upload
                      name="logo"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        if (beforeUpload(file)) {
                          handleLogoUpload(file);
                        }
                        return false;
                      }}
                    >
                      <Button icon={<UploadOutlined />} size="large">
                        Upload Locally
                      </Button>
                    </Upload>

                    <Upload
                      name="logo"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        if (beforeUpload(file)) {
                          handleCloudinaryUpload(file, 'brand');
                        }
                        return false;
                      }}
                    >
                      <Button 
                        icon={<CloudUploadOutlined />} 
                        size="large" 
                        type="primary"
                        loading={uploading}
                      >
                        Upload to Cloudinary
                      </Button>
                    </Upload>
                    
                    {logoUrl && (
                      <Button
                        danger
                        onClick={() => {
                          setLogoUrl('');
                          localStorage.removeItem('brandLogo');
                          message.success('Logo removed');
                        }}
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ),
          },
          {
            key: '2',
            label: 'Newsletter Logo',
            children: (
              <Card className="shadow-lg rounded-xl">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Newsletter Section Logo</h2>
                <p className="text-slate-600 mb-4">
                  Upload a logo/illustration for the newsletter section. Recommended size: 512x512px. Max file size: 2MB.
                </p>
                
                <div className="flex items-center gap-6 mb-6">
                  {/* Logo Preview */}
                  <div className="w-32 h-32 border-2 border-dashed border-cyan-300 rounded-lg flex items-center justify-center bg-cyan-50">
                    {newsletterLogoUrl ? (
                      <img src={newsletterLogoUrl} alt="Newsletter Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <div className="text-center text-slate-400 text-sm p-2">
                        Default penguin illustration will be shown
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Buttons */}
                  <div className="flex flex-col gap-3">
                    <Upload
                      name="newsletterLogo"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        if (beforeUpload(file)) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const dataUrl = e.target.result;
                            setNewsletterLogoUrl(dataUrl);
                            localStorage.setItem('newsletterLogo', dataUrl);
                            
                            // Dispatch storage event to notify other components
                            window.dispatchEvent(new Event('storage'));
                            
                            message.success('Newsletter logo uploaded successfully!');
                          };
                          reader.readAsDataURL(file);
                        }
                        return false;
                      }}
                    >
                      <Button icon={<UploadOutlined />} size="large">
                        Upload Locally
                      </Button>
                    </Upload>

                    <Upload
                      name="newsletterLogo"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        if (beforeUpload(file)) {
                          handleCloudinaryUpload(file, 'newsletter');
                        }
                        return false;
                      }}
                    >
                      <Button 
                        icon={<CloudUploadOutlined />} 
                        size="large" 
                        type="primary"
                        loading={uploadingNewsletter}
                      >
                        Upload to Cloudinary
                      </Button>
                    </Upload>
                    
                    {newsletterLogoUrl && (
                      <Button
                        danger
                        onClick={() => {
                          setNewsletterLogoUrl('');
                          localStorage.removeItem('newsletterLogo');
                          message.success('Newsletter logo removed');
                        }}
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ),
          },
          {
            key: '3',
            label: 'Brand Name',
            children: (
              <Card className="shadow-lg rounded-xl">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Brand Name</h2>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave}
                  initialValues={{ brandName }}
                >
                  <Form.Item
                    label="Brand Name"
                    name="brandName"
                    rules={[{ required: true, message: 'Please enter brand name' }]}
                  >
                    <Input size="large" placeholder="Enter your brand name" />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
                      Save Settings
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: '4',
            label: 'Offer Video',
            children: (
              <Card className="shadow-lg rounded-xl">
                <h2 className="text-xl font-semibold text-slate-700 mb-2">What We Offer — Video</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Upload a product video to Cloudinary. It will autoplay in the "What We Offer" section on the homepage. Max 50MB, MP4 or WebM.
                </p>

                {/* Preview */}
                <div className="mb-6 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center" style={{ height: 220 }}>
                  {localStorage.getItem('offerVideo') ? (
                    <video src={localStorage.getItem('offerVideo')} controls className="w-full h-full object-cover" />
                  ) : (
                    <p className="text-slate-400 text-sm">No video uploaded yet</p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Upload
                    name="offerVideo"
                    showUploadList={false}
                    accept="video/mp4,video/webm"
                    beforeUpload={async (file) => {
                      const isVideo = file.type.startsWith('video/');
                      if (!isVideo) { message.error('Please upload a video file!'); return false; }
                      const isLt50M = file.size / 1024 / 1024 < 50;
                      if (!isLt50M) { message.error('Video must be under 50MB!'); return false; }

                      const hide = message.loading('Uploading to Cloudinary...', 0);
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('upload_preset', 'closet_rush');
                      formData.append('resource_type', 'video');

                      try {
                        const res = await fetch(
                          `https://api.cloudinary.com/v1_1/dnuucbhwa/video/upload`,
                          { method: 'POST', body: formData }
                        );
                        const data = await res.json();
                        hide();
                        if (data.secure_url) {
                          localStorage.setItem('offerVideo', data.secure_url);
                          window.dispatchEvent(new Event('storage'));
                          message.success('Video uploaded to Cloudinary!');
                          window.location.reload();
                        } else {
                          message.error(data.error?.message || 'Upload failed. Ensure preset is set to Unsigned.');
                        }
                      } catch {
                        hide();
                        message.error('Upload failed. Check Cloudinary configuration.');
                      }
                      return false;
                    }}
                  >
                    <Button icon={<CloudUploadOutlined />} type="primary" size="large">
                      Upload Video to Cloudinary
                    </Button>
                  </Upload>

                  {localStorage.getItem('offerVideo') && (
                    <Button danger onClick={() => {
                      localStorage.removeItem('offerVideo');
                      window.dispatchEvent(new Event('storage'));
                      message.success('Video removed');
                      window.location.reload();
                    }}>
                      Remove Video
                    </Button>
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> Ensure your <code>closet_rush</code> Cloudinary preset is set to <strong>Unsigned</strong> mode for uploads to work.
                  </p>
                </div>
              </Card>
            ),
          },
          {
            key: '5',
            label: 'Hero Image',
            children: (
              <Card className="shadow-lg rounded-xl">
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Homepage Hero Image</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Upload the background image shown on the homepage hero section. Recommended: 1920×1080px, JPG/PNG, max 10MB.
                </p>

                {/* Preview */}
                <div className="mb-6 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center" style={{ height: 200 }}>
                  {localStorage.getItem('heroImage') ? (
                    <img src={localStorage.getItem('heroImage')} alt="Hero" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400 text-sm p-4">
                      <p className="mb-1">No custom image uploaded</p>
                      <p className="text-xs">Default bedroom image is being used</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Upload
                    name="heroImage"
                    showUploadList={false}
                    accept="image/*"
                    beforeUpload={async (file) => {
                      const isImage = file.type.startsWith('image/');
                      if (!isImage) { message.error('Please upload an image file!'); return false; }
                      const isLt10M = file.size / 1024 / 1024 < 10;
                      if (!isLt10M) { message.error('Image must be under 10MB!'); return false; }

                      const hide = message.loading('Uploading hero image to Cloudinary...', 0);
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('upload_preset', 'closet_rush');

                      try {
                        const res = await fetch(
                          `https://api.cloudinary.com/v1_1/dnuucbhwa/image/upload`,
                          { method: 'POST', body: formData }
                        );
                        const data = await res.json();
                        hide();
                        if (data.secure_url) {
                          localStorage.setItem('heroImage', data.secure_url);
                          window.dispatchEvent(new Event('storage'));
                          message.success('Hero image uploaded successfully!');
                          window.location.reload();
                        } else {
                          message.error(data.error?.message || 'Upload failed. Ensure preset is Unsigned.');
                        }
                      } catch {
                        hide();
                        message.error('Upload failed. Check Cloudinary configuration.');
                      }
                      return false;
                    }}
                  >
                    <Button icon={<CloudUploadOutlined />} type="primary" size="large">
                      Upload Hero Image to Cloudinary
                    </Button>
                  </Upload>

                  {localStorage.getItem('heroImage') && (
                    <Button danger onClick={() => {
                      localStorage.removeItem('heroImage');
                      window.dispatchEvent(new Event('storage'));
                      message.success('Hero image removed — default image restored');
                      window.location.reload();
                    }}>
                      Remove Custom Image (Restore Default)
                    </Button>
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Tip:</strong> Use a high-quality bedroom/lifestyle image. Landscape orientation (16:9) works best. The image will be blurred slightly by the hero overlay.
                  </p>
                </div>
              </Card>
            ),
          },
        ]}
      />

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800 mb-2">
          <strong>✅ Recommended: Upload Locally</strong>
        </p>
        <p className="text-sm text-green-700 mb-3">
          The "Upload Locally" option works immediately and is perfect for most use cases. 
          Your logo will be stored in browser storage and appear instantly on your site.
        </p>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800 mb-2">
          <strong>⚠️ Important: Change Preset to Unsigned Mode</strong>
        </p>
        <p className="text-sm text-amber-700 mb-2">
          Your preset "closet_rush" is currently in <strong>Signed</strong> mode. To make uploads work, change it to <strong>Unsigned</strong>:
        </p>
        <ol className="text-xs text-amber-700 list-decimal list-inside space-y-1">
          <li>Go to <a href="https://cloudinary.com/console/settings/upload" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Cloudinary Upload Settings</a></li>
          <li>Find your "closet_rush" preset</li>
          <li>Click the edit icon (pencil)</li>
          <li>Change <strong>Signing mode</strong> from "Signed" to <strong>"Unsigned"</strong></li>
          <li>Click Save</li>
          <li>Refresh this page and try uploading again</li>
        </ol>
      </div>
    </div>
  );
};

export default BrandSettingsPage;
