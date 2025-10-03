import { firestore } from '@/firebase';
import { dataTagErrorSymbol } from '@tanstack/react-query';
import { collection, writeBatch, doc } from 'firebase/firestore';

interface PaymentRecord {
  srNo: number;
  payDate: string;
  lobby: string;
  sfaId: string;
  name: string;
  cmsId: string;
  receiver: string;
  amount: number;
  paymentMode: string;
  remarks?: string;
}

// Helper function to extract month shortform from date
const getMonthAndYear = (dateString: string): {month: string, year:string} => {
  // Handle date format like "14-Sep-2025"
  const months: Record<string, string> = {
    'jan': 'jan',
    'feb': 'feb',
    'mar': 'mar',
    'apr': 'apr',
    'may': 'may',
    'jun': 'jun',
    'jul': 'jul',
    'aug': 'aug',
    'sep': 'sept',
    'oct': 'oct',
    'nov': 'nov',
    'dec': 'dec'
  };

  // Extract month from date string
  const parts = dateString.split('-');
  let month = '';
  let year = '';

  if (parts.length >= 3) {
    const monthPart = parts[1].toLowerCase();
    year = parts[2];
    for (const [key, value] of Object.entries(months)) {
      if (monthPart.startsWith(key)) {
        month =  value;
        break;
      }
    }
  }

  // Default to current month if parsing fails
  if(!month || !year){
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear().toString();
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'];
    return {
      month: month || monthNames[currentMonth],
      year: year || currentYear
    };
  }

  return {month, year};
  
};

const getDateDigits = (dateString:string ) : string =>{
  const parts = dateString.split('-');
  if(parts.length >= 3){
    const day = parts[0];
    const year = parts[2];
    return `${day}${year}`;
  }
  return '';
};

export const parseCSVData = (csvContent: string): PaymentRecord[] => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).filter(line => line.trim()).map((line, index) => {
    const values = line.split(',');
    const record: Record<string, any> = {};
    
    headers.forEach((header, i) => {
      let value = values[i]?.trim() || '';
      
      // Handle amount - remove currency symbol and convert to number
      if (header.toLowerCase().includes('amount')) {
        value = value.replace(/[₹,]/g, '');
        record[header.trim()] = parseFloat(value);
      } else {
        record[header.trim()] = value;
      }
    });
    
    return {
      srNo: parseInt(record['Sr.no'] || index + 1),
      payDate: record['Pay Date'] || '',
      lobby: record['Lobby'] || '',
      sfaId: record['SFA id'] || '',
      name: record['name'] || '',
      cmsId: record['cms id'] || '',
      receiver: record['receiver'] || '',
      amount: record['amount'] || 0,
      paymentMode: record['payment mode'] || '',
      remarks: record['remarks'] || ''
    };
  });
};

export const importCSVToFirestore = async (
  csvData: PaymentRecord[],
  batchSize: number = 500
): Promise<{ success: boolean; imported: number; errors?: any }> => {
  try {
    const totalRecords = csvData.length;
    let importedCount = 0;
    
    // Determine month from data (use first record's date)
    const { month, year } = csvData.length > 0 
      ? getMonthAndYear(csvData[0].payDate) 
      : getMonthAndYear('');
      
    const collectionName = `transactions_${month}_${year}`;

    console.log(`Importing to collection: ${collectionName}`);
    
    // Process in batches to avoid Firestore limits
    for (let i = 0; i < totalRecords; i += batchSize) {
      const batch = writeBatch(firestore);
      const recordsSlice = csvData.slice(i, i + batchSize);
      
      recordsSlice.forEach(record => {
        // Creating document ID in format : SfaId_dateDigits
        const dateDigits = getDateDigits(record.payDate);
        const docId = `${record.sfaId}_${dateDigits}`;

        const docRef = doc(collection(firestore, collectionName), docId);

        batch.set(docRef, {
          sfaId: record.sfaId,
          lobby: record.lobby,
          amount: record.amount,
          date:record.payDate,
          mode:record.paymentMode,
          remarks:record.remarks || '',
          receiver: record.receiver,
          createdAt: new Date(),
        });
      });
      
      await batch.commit();
      importedCount += recordsSlice.length;
    }
    
    return { success: true, imported: importedCount };
  } catch (error) {
    console.error("Error importing CSV data:", error);
    return { success: false, imported: 0, errors: error };
  }
};