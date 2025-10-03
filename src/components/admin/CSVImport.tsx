import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { parseCSV } from '@/utils/csvParser';

const CSVImport: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setFileName(null);
      setPreviewData([]);
      return;
    }
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
      return;
    }
    
    setFileName(file.name);
    
    // Read and parse the CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const parsedData = parseCSV(csvContent);
        
        // Show preview of first 5 rows
        setPreviewData(parsedData.slice(0, 5));
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast({
          title: "Error parsing CSV",
          description: "The CSV file could not be parsed correctly",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
  };
  
  const handleImport = async () => {
    if (!fileName) return;
    
    setIsLoading(true);
    
    try {
      // Implementation for importing would go here
      // This is a placeholder for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Import successful",
        description: "Your CSV data has been imported",
        variant: "default"
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "There was an error importing your CSV data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import CSV Data</CardTitle>
        <CardDescription>
          Upload a CSV file to import data into the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-surface transition-colors"
               onClick={() => document.getElementById('csv-file-input')?.click()}>
            <input
              type="file"
              id="csv-file-input"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Upload className="h-10 w-10 mx-auto text-text-muted mb-2" />
            <p className="text-sm text-text-muted mb-1">
              {fileName ? (
                <span className="text-text-primary font-medium flex items-center justify-center gap-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  {fileName}
                </span>
              ) : (
                "Click to upload or drag and drop"
              )}
            </p>
            <p className="text-xs text-text-muted">CSV files only</p>
          </div>
          
          {previewData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Preview (first 5 rows):</h3>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface border-b border-border">
                      {Object.keys(previewData[0]).map((header, i) => (
                        <th key={i} className="px-3 py-2 text-left font-medium text-text-secondary">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        {Object.values(row).map((cell, j) => (
                          <td key={j} className="px-3 py-2 truncate max-w-[200px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={handleImport} 
              disabled={!fileName || isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent"></span>
                  Importing...
                </>
              ) : "Import Data"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVImport;