import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import * as XLSX from 'xlsx';
import "./RealtimeTransitions.css";

const ProductCodeManagement = () => {
  const [totalCodes, setTotalCodes] = useState(0);
  const [usedCodes, setUsedCodes] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchCodeStats();

    // Set up realtime subscription for product codes with granular updates
    const channel = supabase
      .channel('product-codes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_codes',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Increment total codes count
            setTotalCodes((current) => current + 1);
          } else if (payload.eventType === 'UPDATE') {
            // Check if code was marked as used
            const oldCode = payload.old as any;
            const newCode = payload.new as any;
            if (!oldCode.is_used && newCode.is_used) {
              // Code was just used
              setUsedCodes((current) => current + 1);
            } else if (oldCode.is_used && !newCode.is_used) {
              // Code was marked as unused (edge case)
              setUsedCodes((current) => Math.max(0, current - 1));
            }
          } else if (payload.eventType === 'DELETE') {
            // Decrement total codes
            const deletedCode = payload.old as any;
            setTotalCodes((current) => Math.max(0, current - 1));
            if (deletedCode.is_used) {
              setUsedCodes((current) => Math.max(0, current - 1));
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCodeStats = async () => {
    try {
      // Get total codes count
      const { count: total, error: totalError } = await supabase
        .from('product_codes')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get used codes count
      const { count: used, error: usedError } = await supabase
        .from('product_codes')
        .select('*', { count: 'exact', head: true })
        .eq('is_used', true);

      if (usedError) throw usedError;

      setTotalCodes(total || 0);
      setUsedCodes(used || 0);
    } catch (error) {
      console.error('Error fetching code stats:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.endsWith('.csv');
    const isTXT = file.name.endsWith('.txt');
    const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCSV && !isTXT && !isXLSX) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV, TXT, or Excel file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let codes: string[] = [];

      if (isXLSX) {
        // Handle Excel files
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        // Extract codes from first column, skip empty rows
        codes = jsonData
          .map(row => String(row[0] || '').trim())
          .filter(code => code && !code.toLowerCase().includes('code'));
      } else {
        // Handle CSV/TXT files
        const text = await file.text();
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        // Remove header if it exists
        codes = lines[0].toLowerCase().includes('code') ? lines.slice(1) : lines;
      }
      
      if (codes.length === 0) {
        toast({
          title: "Empty File",
          description: "No product codes found in the file.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      // Process codes in batches to avoid overwhelming the database
      const batchSize = 500;
      let processed = 0;
      let successCount = 0;
      let duplicateCount = 0;

      for (let i = 0; i < codes.length; i += batchSize) {
        const batch = codes.slice(i, i + batchSize);
        const codeObjects = batch.map(code => ({
          code: code.toUpperCase(),
          is_used: false,
        }));

        const { data, error } = await supabase
          .from('product_codes')
          .insert(codeObjects)
          .select();

        if (error) {
          // Count duplicates (unique constraint violation)
          if (error.code === '23505') {
            duplicateCount += batch.length - (data?.length || 0);
          } else {
            console.error('Error inserting codes:', error);
          }
        }

        successCount += data?.length || 0;
        processed += batch.length;
        setUploadProgress((processed / codes.length) * 100);
      }

      await fetchCodeStats();

      toast({
        title: "Upload Complete!",
        description: `${successCount.toLocaleString()} codes imported. ${duplicateCount > 0 ? `${duplicateCount} duplicates skipped.` : ''}`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Upload Failed",
        description: "An error occurred while processing the file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
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
              CSV, TXT, or Excel file with codes
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
              accept=".csv,.txt,.xlsx,.xls"
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
