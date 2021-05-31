import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';

class ImportTransactionsService {
  async execute(csvFilePath: string): Promise<Transaction[]> {
    // TODO

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 1,
      ltrim: true,
      rtrim: true,
      columns: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);
    const csvLines: Transaction[] = [];

    parseCSV.on('data', line => {
      csvLines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return csvLines;
  }
}

export default ImportTransactionsService;
