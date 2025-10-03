/**
 * Browser-compatible CSV parser
 * @param csvString CSV content as string
 * @param options Configuration options
 * @returns Parsed CSV data as array of objects
 */
export const parseCSV = (
  csvString: string,
  options: {
    header?: boolean;
    skipEmptyLines?: boolean;
    delimiter?: string;
  } = {}
): Record<string, string>[] => {
  const {
    header = true,
    skipEmptyLines = true,
    delimiter = ','
  } = options;

  // Split the CSV string into lines
  const lines = csvString.split(/\r?\n/);
  
  // Skip empty lines if requested
  const nonEmptyLines = skipEmptyLines 
    ? lines.filter(line => line.trim() !== '') 
    : lines;
  
  if (nonEmptyLines.length === 0) {
    return [];
  }
  
  // Parse the header row
  const headers = header 
    ? nonEmptyLines[0].split(delimiter).map(h => h.trim()) 
    : nonEmptyLines[0].split(delimiter).map((_, i) => `column${i}`);
  
  // Start from index 1 if there's a header row, otherwise start from 0
  const startIndex = header ? 1 : 0;
  const result: Record<string, string>[] = [];
  
  // Process each row
  for (let i = startIndex; i < nonEmptyLines.length; i++) {
    const line = nonEmptyLines[i].trim();
    if (!line && skipEmptyLines) continue;
    
    // Handle quoted values with commas inside
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
        insideQuotes = !insideQuotes;
        continue;
      }
      
      if (char === delimiter && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
        continue;
      }
      
      currentValue += char;
    }
    
    // Push the last value
    values.push(currentValue.trim());
    
    // Create object from headers and values
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (index < values.length) {
        // Remove surrounding quotes if present
        let value = values[index];
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        row[header] = value;
      } else {
        row[header] = '';
      }
    });
    
    result.push(row);
  }
  
  return result;
};
