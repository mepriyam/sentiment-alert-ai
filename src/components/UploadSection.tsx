import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Image, FileSpreadsheet, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadSectionProps {
  onTextSubmit: (text: string, source: string) => void;
}

const UploadSection = ({ onTextSubmit }: UploadSectionProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [rawText, setRawText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['text/csv', 'application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
      return validTypes.includes(file.type) || file.name.endsWith('.csv');
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid File Type",
        description: "Please upload CSV, PDF, image, or text files only.",
        variant: "destructive"
      });
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    for (const file of selectedFiles) {
      try {
        let text = '';
        
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          text = await file.text();
          // Simple CSV parsing - extract text content
          text = text.split('\n').slice(1).map(row => 
            row.split(',').slice(-1)[0]?.replace(/"/g, '')
          ).filter(Boolean).join('. ');
        } else if (file.type === 'text/plain') {
          text = await file.text();
        } else if (file.type === 'application/pdf') {
          // For PDF, we'll simulate extraction (real implementation would need pdf.js)
          text = "PDF content extraction would require additional libraries. Please use raw text input for now.";
          toast({
            title: "PDF Processing",
            description: "PDF text extraction requires backend processing. Please copy-paste the text content.",
            variant: "default"
          });
        } else if (file.type.startsWith('image/')) {
          // For images, we'll simulate OCR (real implementation would need OCR service)
          text = "Image OCR would require additional services. Please type the text content manually.";
          toast({
            title: "Image Processing",
            description: "OCR text extraction requires additional services. Please type the text content.",
            variant: "default"
          });
        }

        if (text && text.length > 10) {
          onTextSubmit(text, `File: ${file.name}`);
        }
      } catch (error) {
        toast({
          title: "File Processing Error",
          description: `Failed to process ${file.name}`,
          variant: "destructive"
        });
      }
    }
    
    setSelectedFiles([]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8 text-purple-600" />;
    if (file.type === 'application/pdf') return <FileText className="w-8 h-8 text-red-600" />;
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
    return <FileText className="w-8 h-8 text-blue-600" />;
  };

  return (
    <section id="upload-section" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upload Feedback Data
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose your preferred input method to analyze citizen feedback
          </p>
        </div>

        {/* Upload Area */}
        <Card className="shadow-xl bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors duration-300">
          <CardContent className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 transition-colors duration-300 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.pdf,.png,.jpg,.jpeg,.txt"
                onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                className="hidden"
              />
              
              <div className="text-center space-y-4">
                <Upload className={`w-16 h-16 mx-auto ${dragActive ? 'text-blue-500' : 'text-gray-400'} animate-bounce`} />
                <div>
                  <p className="text-lg font-semibold">Drag & Drop Files Here</p>
                  <p className="text-muted-foreground">or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Supports CSV, PDF, Images (PNG, JPG), and Text files
                  </p>
                </div>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                >
                  Browse Files
                </Button>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold">Selected Files:</h3>
                <div className="grid gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeFile(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button onClick={processFiles} className="w-full">
                  Process Files ({selectedFiles.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Raw Text Input */}
        <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 space-y-4">
            <Label htmlFor="raw-text" className="text-lg font-semibold">
              Or Enter Text Directly
            </Label>
            <Textarea
              id="raw-text"
              placeholder="Paste your feedback text here for immediate analysis..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="min-h-32 text-base"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {rawText.length} characters | {rawText.trim().split(/\s+/).filter(w => w).length} words
              </p>
              <Button 
                onClick={() => {
                  if (rawText.trim()) {
                    onTextSubmit(rawText, 'Direct input');
                    setRawText('');
                  }
                }}
                disabled={!rawText.trim()}
              >
                Analyze Text
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default UploadSection;