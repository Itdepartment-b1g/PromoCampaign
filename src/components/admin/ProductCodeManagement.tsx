import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ProductCodeManagement = () => {
  const [totalCodes, setTotalCodes] = useState(0);
  const [usedCodes, setUsedCodes] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate file processing
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          // Mock: simulate adding codes
          const newCodes = Math.floor(Math.random() * 10000) + 1000;
          setTotalCodes((prev) => prev + newCodes);
          
          toast({
            title: "Upload Successful!",
            description: `${newCodes.toLocaleString()} product codes have been imported.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Code Management</CardTitle>
          <CardDescription>Upload and manage product codes for the campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Upload Product Codes</p>
            <p className="text-sm text-muted-foreground mb-4">
              CSV or Excel file (up to 1 million codes)
            </p>
            <label htmlFor="file-upload">
              <Button asChild disabled={uploading}>
                <span>
                  {uploading ? "Uploading..." : "Choose File"}
                </span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Codes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalCodes.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Used Codes</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <p className="text-3xl font-bold">{usedCodes.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Available Codes</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-primary" />
                <p className="text-3xl font-bold">{(totalCodes - usedCodes).toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Rate */}
          {totalCodes > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Usage Rate</span>
                <span>{((usedCodes / totalCodes) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(usedCodes / totalCodes) * 100} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCodeManagement;
