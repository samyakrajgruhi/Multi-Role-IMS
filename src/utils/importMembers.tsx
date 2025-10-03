import { firestore } from '@/firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface MemberData {
  cmsid: string;
  email: string;
  emergency_number: string;
  full_name: string;
  lobby_id: string;
  phone_number: string;
  role: string;
  sfa_id: string;
}

/**
 * Imports member data from CSV file to Firestore
 * @param csvData Raw CSV data as string
 * @param batchSize Number of documents to write in a single batch
 * @returns Results of the import operation
 */
export const importMembersToFirestore = async (
  csvData: string,
  batchSize: number = 500
): Promise<{ success: boolean; imported: number; errors?: any }> => {
  try {
    // Parse CSV content
    const records: MemberData[] = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`Found ${records.length} records to import`);
    
    const totalRecords = records.length;
    let importedCount = 0;
    
    // Process in batches to avoid Firestore limits
    for (let i = 0; i < totalRecords; i += batchSize) {
      const batch = writeBatch(firestore);
      const recordsSlice = records.slice(i, i + batchSize);
      
      recordsSlice.forEach(record => {
        // Use sfa_id as the document ID
        const docRef = doc(firestore, 'users', record.sfa_id);
        
        batch.set(docRef, {
          cms_id: record.cmsid,
          email: record.email,
          emergency_number: record.emergency_number,
          full_name: record.full_name,
          lobby_id: record.lobby_id,
          phone_number: record.phone_number,
          role: record.role,
          sfa_id: record.sfa_id,
          createdAt: new Date(),
        });
      });
      
      await batch.commit();
      importedCount += recordsSlice.length;
      console.log(`Imported batch ${i/batchSize + 1}: ${recordsSlice.length} records`);
    }
    
    return { success: true, imported: importedCount };
  } catch (error) {
    console.error("Error importing member data:", error);
    return { success: false, imported: 0, errors: error };
  }
};