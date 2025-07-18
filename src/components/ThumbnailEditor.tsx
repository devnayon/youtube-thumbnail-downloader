import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { 
  Type, 
  Image as ImageIcon, 
  Download, 
  RotateCcw, 
  Palette, 
  Crop,
  Plus,
  Minus,
  X,
  Check,
  Upload
} from 'lucide-react';

interface ThumbnailEditorProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (dataUrl: string, filename: string) => void;
  filename: string;
}

interface FilterPreset {
  name: string;
  filter: fabric.IBaseFilter;
}

const ThumbnailEditor: React.FC<ThumbnailEditorProps> = ({
  imageUrl,
  onClose,
  onSave,
  filename
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'text' | 'filters' | 'watermark' | 'crop'>('text');
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState('#ffffff');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);

  const filterPresets: FilterPreset[] = [
    { name: 'Original', filter: new fabric.filters.ColorMatrix() },
    { name: 'Vintage', filter: new fabric.filters.Vintage() },
    { name: 'Sepia', filter: new fabric.filters.Sepia() },
    { name: 'BlackWhite', filter: new fabric.filters.BlackWhite() },
    { name: 'Polaroid', filter: new fabric.filters.Polaroid() },
    { name: 'Kodachrome', filter: new fabric.filters.Kodachrome() },
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 450,
      backgroundColor: '#f0f0f0',
    });

    fabricCanvasRef.current = canvas;

    // Load the thumbnail image
    fabric.Image.fromURL(imageUrl, (img) => {
      if (!img || !canvas) return;

      // Scale image to fit canvas
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const imgWidth = img.width || 1;
      const imgHeight = img.height || 1;

      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY);

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        selectable: false,
        evented: false,
      });

      canvas.add(img);
      canvas.sendToBack(img);
      canvas.renderAll();
      setIsLoading(false);
    }, {
      crossOrigin: 'anonymous'
    });

    return () => {
      canvas.dispose();
    };
  }, [imageUrl]);

  const addText = () => {
    if (!fabricCanvasRef.current || !textInput.trim()) return;

    const text = new fabric.Text(textInput, {
      left: 50,
      top: 50,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: 'SF Pro Display, Arial, sans-serif',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeWidth: 2,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.5)',
        blur: 4,
        offsetX: 2,
        offsetY: 2,
      }),
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
    setTextInput('');
  };

  const applyFilter = (filterName: string) => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current.getObjects();
    const backgroundImage = objects.find(obj => obj.type === 'image' && !obj.selectable);

    if (backgroundImage && backgroundImage instanceof fabric.Image) {
      // Clear existing filters
      backgroundImage.filters = [];

      if (filterName !== 'Original') {
        const preset = filterPresets.find(p => p.name === filterName);
        if (preset) {
          backgroundImage.filters.push(preset.filter);
        }
      }

      // Apply custom adjustments
      if (brightness !== 0) {
        backgroundImage.filters.push(new fabric.filters.Brightness({ brightness }));
      }
      if (contrast !== 0) {
        backgroundImage.filters.push(new fabric.filters.Contrast({ contrast }));
      }
      if (saturation !== 0) {
        backgroundImage.filters.push(new fabric.filters.Saturation({ saturation }));
      }
      if (blur > 0) {
        backgroundImage.filters.push(new fabric.filters.Blur({ blur: blur / 100 }));
      }

      backgroundImage.applyFilters();
      fabricCanvasRef.current.renderAll();
    }
  };

  const addWatermark = () => {
    if (!fabricCanvasRef.current) return;

    const watermark = new fabric.Text('© Your Brand', {
      left: fabricCanvasRef.current.getWidth() - 150,
      top: fabricCanvasRef.current.getHeight() - 40,
      fontSize: 16,
      fill: 'rgba(255,255,255,0.7)',
      fontFamily: 'SF Pro Display, Arial, sans-serif',
      fontWeight: 'normal',
    });

    fabricCanvasRef.current.add(watermark);
    fabricCanvasRef.current.renderAll();
  };

  const uploadLogo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !fabricCanvasRef.current) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        fabric.Image.fromURL(imgUrl, (img) => {
          if (!img || !fabricCanvasRef.current) return;

          img.set({
            left: fabricCanvasRef.current.getWidth() - 120,
            top: 20,
            scaleX: 0.2,
            scaleY: 0.2,
          });

          fabricCanvasRef.current.add(img);
          fabricCanvasRef.current.renderAll();
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current) return;

    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject && activeObject.selectable) {
      fabricCanvasRef.current.remove(activeObject);
      fabricCanvasRef.current.renderAll();
    }
  };

  const resetCanvas = () => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current.getObjects();
    const backgroundImage = objects.find(obj => obj.type === 'image' && !obj.selectable);

    fabricCanvasRef.current.clear();
    
    if (backgroundImage) {
      fabricCanvasRef.current.add(backgroundImage);
      fabricCanvasRef.current.sendToBack(backgroundImage);
    }

    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setBlur(0);
    fabricCanvasRef.current.renderAll();
  };

  const saveImage = () => {
    if (!fabricCanvasRef.current) return;

    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2, // Higher resolution
    });

    const editedFilename = filename.replace('.jpg', '_edited.png');
    onSave(dataUrl, editedFilename);
  };

  useEffect(() => {
    applyFilter('Original');
  }, [brightness, contrast, saturation, blur]);

  const tabs = [
    { id: 'text' as const, label: 'Text', icon: Type },
    { id: 'filters' as const, label: 'Filters', icon: Palette },
    { id: 'watermark' as const, label: 'Watermark', icon: ImageIcon },
    { id: 'crop' as const, label: 'Crop', icon: Crop },
  ];

  return (
    <div className="editor-overlay">
      <div className="editor-container glass-element">
        {/* Header */}
        <div className="editor-header">
          <h2 className="editor-title">Thumbnail Editor</h2>
          <div className="editor-actions">
            <button onClick={resetCanvas} className="glass-button secondary-button">
              <RotateCcw className="button-icon" />
              Reset
            </button>
            <button onClick={deleteSelected} className="glass-button secondary-button">
              <X className="button-icon" />
              Delete
            </button>
            <button onClick={saveImage} className="glass-button primary-button">
              <Check className="button-icon" />
              Save
            </button>
            <button onClick={onClose} className="glass-button close-button">
              <X className="button-icon" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="editor-content">
          {/* Canvas */}
          <div className="canvas-container">
            {isLoading && (
              <div className="canvas-loading">
                <div className="loading-spinner"></div>
                <p>Loading editor...</p>
              </div>
            )}
            <canvas ref={canvasRef} className="editor-canvas" />
          </div>

          {/* Sidebar */}
          <div className="editor-sidebar glass-container">
            {/* Tabs */}
            <div className="editor-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <tab.icon className="tab-icon" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'text' && (
                <div className="text-controls">
                  <h3 className="control-title">Add Text</h3>
                  <div className="control-group">
                    <label className="control-label">Text Content</label>
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter your text..."
                      className="glass-input"
                    />
                  </div>
                  <div className="control-group">
                    <label className="control-label">Font Size: {fontSize}px</label>
                    <input
                      type="range"
                      min="12"
                      max="100"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="glass-slider"
                    />
                  </div>
                  <div className="control-group">
                    <label className="control-label">Text Color</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="glass-color-input"
                    />
                  </div>
                  <button onClick={addText} className="glass-button primary-button full-width">
                    <Plus className="button-icon" />
                    Add Text
                  </button>
                </div>
              )}

              {activeTab === 'filters' && (
                <div className="filter-controls">
                  <h3 className="control-title">Filters & Effects</h3>
                  
                  <div className="filter-presets">
                    {filterPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyFilter(preset.name)}
                        className="filter-preset-button glass-button secondary-button"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  <div className="adjustment-controls">
                    <div className="control-group">
                      <label className="control-label">Brightness: {brightness}</label>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="glass-slider"
                      />
                    </div>
                    <div className="control-group">
                      <label className="control-label">Contrast: {contrast}</label>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="glass-slider"
                      />
                    </div>
                    <div className="control-group">
                      <label className="control-label">Saturation: {saturation}</label>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="glass-slider"
                      />
                    </div>
                    <div className="control-group">
                      <label className="control-label">Blur: {blur}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={blur}
                        onChange={(e) => setBlur(Number(e.target.value))}
                        className="glass-slider"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'watermark' && (
                <div className="watermark-controls">
                  <h3 className="control-title">Watermark & Logo</h3>
                  <button onClick={addWatermark} className="glass-button secondary-button full-width">
                    <Type className="button-icon" />
                    Add Text Watermark
                  </button>
                  <button onClick={uploadLogo} className="glass-button secondary-button full-width">
                    <Upload className="button-icon" />
                    Upload Logo
                  </button>
                </div>
              )}

              {activeTab === 'crop' && (
                <div className="crop-controls">
                  <h3 className="control-title">Crop & Resize</h3>
                  <p className="control-description">
                    Select objects on the canvas to move, resize, or rotate them.
                    Use the corner handles to maintain aspect ratio.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailEditor;